import json
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.utils import formataddr, formatdate, make_msgid
import psycopg2
import psycopg2.extras

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 'public')

def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def send_partner_email(to_email: str, accepted_at_str: str):
    smtp_host = os.environ.get('SMTP_HOST', '')
    smtp_port = int(os.environ.get('SMTP_PORT', '465'))
    smtp_user = os.environ.get('SMTP_USER', '')
    smtp_password = os.environ.get('SMTP_PASSWORD', '')

    msg = MIMEMultipart('alternative')
    msg['Subject'] = 'Вы приняли правила партнёрской программы'
    msg['From'] = formataddr(('ПоДелам', smtp_user))
    msg['To'] = to_email
    msg['Date'] = formatdate(localtime=True)
    msg['Message-ID'] = make_msgid(domain='mail.ru')
    msg['X-Mailer'] = 'PoDelam Mailer'

    html = f"""
    <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 32px;">
      <h2 style="color: #7c3aed; margin-bottom: 8px;">ПоДелам</h2>
      <p style="color: #374151; font-size: 16px; margin-bottom: 24px;">
        Вы успешно приняли правила партнёрской программы проекта «ПоДелам».
      </p>
      <div style="background: #f5f3ff; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
        <p style="margin: 0 0 8px; color: #374151; font-size: 15px;"><strong>Дата принятия:</strong> {accepted_at_str}</p>
        <p style="margin: 0; color: #374151; font-size: 15px;"><strong>Ваша комиссия:</strong> 20% с каждой оплаты приглашённого</p>
      </div>
      <p style="color: #374151; font-size: 15px; margin-bottom: 16px;">
        Теперь вам доступна персональная реферальная ссылка в личном кабинете.
        Делитесь ею с друзьями — и получайте бонусы с каждой их покупки.
      </p>
      <a href="https://podelam.su/cabinet?tab=referral"
         style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #a855f7); color: #fff; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-weight: 700; font-size: 15px;">
        Перейти в личный кабинет
      </a>
      <p style="color: #6b7280; font-size: 13px; margin-top: 24px;">
        Полный текст правил доступен в разделе «Рефералы» личного кабинета.
        Если вы не совершали это действие — напишите нам в <a href="https://t.me/AnnaUvaro" style="color: #7c3aed;">поддержку</a>.
      </p>
    </div>
    """
    msg.attach(MIMEText(html, 'html'))

    with smtplib.SMTP_SSL(smtp_host, smtp_port) as server:
        server.login(smtp_user, smtp_password)
        server.sendmail(smtp_user, to_email, msg.as_string())
    print(f"SMTP: partner rules email sent to {to_email}")

def handler(event: dict, context) -> dict:
    """Реферальная программа: получить данные, историю начислений, списать бонусы"""
    cors = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    }

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors, 'body': ''}

    params = event.get('queryStringParameters') or {}
    body = {}
    if event.get('body'):
        body = json.loads(event['body'])

    action = params.get('action') or body.get('action', '')
    user_email = (params.get('email') or body.get('email', '')).strip().lower()

    if not user_email:
        return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'email required'})}

    conn = get_conn()
    try:
        cur = conn.cursor()
        S = SCHEMA

        cur.execute(
            f'SELECT id, ref_code, ref_balance, partner_rules_accepted, partner_rules_accepted_at FROM "{S}".users WHERE email = %s',
            (user_email,)
        )
        user = cur.fetchone()
        if not user:
            return {'statusCode': 404, 'headers': cors, 'body': json.dumps({'error': 'user not found'})}

        user_id, ref_code, ref_balance, rules_accepted, rules_accepted_at = user

        if action == 'info':
            cur.execute(
                f'SELECT COUNT(*) FROM "{S}".users WHERE referred_by = %s',
                (user_id,)
            )
            referrals_count = cur.fetchone()[0]

            cur.execute(
                f'SELECT COALESCE(SUM(amount), 0) FROM "{S}".referral_transactions WHERE referrer_id = %s',
                (user_id,)
            )
            total_earned = cur.fetchone()[0]

            cur.execute(
                f'''SELECT rt.amount, rt.created_at, u.name, p.tariff
                FROM "{S}".referral_transactions rt
                JOIN "{S}".users u ON u.id = rt.referred_id
                JOIN "{S}".payments p ON p.id = rt.payment_id
                WHERE rt.referrer_id = %s
                ORDER BY rt.created_at DESC LIMIT 50''',
                (user_id,)
            )
            history = []
            for row in cur.fetchall():
                history.append({
                    'amount': row[0],
                    'date': str(row[1]),
                    'referral_name': row[2],
                    'tariff': row[3],
                })

            return {
                'statusCode': 200,
                'headers': cors,
                'body': json.dumps({
                    'ref_code': ref_code,
                    'ref_balance': ref_balance,
                    'referrals_count': referrals_count,
                    'total_earned': total_earned,
                    'history': history,
                    'rules_accepted': bool(rules_accepted),
                    'rules_accepted_at': str(rules_accepted_at) if rules_accepted_at else None,
                })
            }

        elif action == 'accept_rules':
            cur.execute(
                f'UPDATE "{S}".users SET partner_rules_accepted = TRUE, partner_rules_accepted_at = NOW() WHERE id = %s RETURNING partner_rules_accepted_at',
                (user_id,)
            )
            accepted_at = cur.fetchone()[0]
            conn.commit()

            try:
                from datetime import datetime
                dt = accepted_at if isinstance(accepted_at, datetime) else datetime.fromisoformat(str(accepted_at))
                date_str = dt.strftime('%d.%m.%Y в %H:%M')
                send_partner_email(user_email, date_str)
            except Exception as e:
                print(f"Email send error: {e}")

            return {
                'statusCode': 200,
                'headers': cors,
                'body': json.dumps({'ok': True, 'rules_accepted': True, 'rules_accepted_at': str(accepted_at)})
            }

        elif action == 'use_bonus':
            amount = body.get('amount', 0)
            if not amount or amount <= 0:
                return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'invalid amount'})}

            if amount > ref_balance:
                return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'insufficient ref_balance'})}

            cur.execute(
                f'UPDATE "{S}".users SET ref_balance = ref_balance - %s, balance = balance + %s WHERE id = %s RETURNING balance, ref_balance',
                (amount, amount, user_id)
            )
            new_balance, new_ref = cur.fetchone()
            conn.commit()
            return {
                'statusCode': 200,
                'headers': cors,
                'body': json.dumps({
                    'ok': True,
                    'balance': new_balance,
                    'ref_balance': new_ref,
                })
            }

        return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'unknown action'})}
    finally:
        conn.close()
