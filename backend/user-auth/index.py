import json
import os
import hashlib
import psycopg2
import psycopg2.extras
import smtplib
import random
import string
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.utils import formataddr, formatdate, make_msgid
from datetime import datetime

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 'public')

def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def generate_code() -> str:
    return ''.join(random.choices(string.digits, k=6))

def generate_ref_code() -> str:
    chars = string.ascii_lowercase + string.digits
    return ''.join(random.choices(chars, k=8))

def send_email(to_email: str, code: str):
    smtp_host = os.environ.get('SMTP_HOST', '')
    smtp_port = int(os.environ.get('SMTP_PORT', '465'))
    smtp_user = os.environ.get('SMTP_USER', '')
    smtp_password = os.environ.get('SMTP_PASSWORD', '')

    msg = MIMEMultipart('alternative')
    msg['Subject'] = 'Ваш код для восстановления пароля'
    msg['From'] = formataddr(('ПоДелам', smtp_user))
    msg['To'] = to_email
    msg['Date'] = formatdate(localtime=True)
    msg['Message-ID'] = make_msgid(domain='mail.ru')
    msg['X-Mailer'] = 'PoDelam Mailer'

    html = f"""
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
      <h2 style="color: #7c3aed; margin-bottom: 8px;">ПоДелам</h2>
      <p style="color: #374151; font-size: 16px; margin-bottom: 24px;">
        Вы запросили восстановление пароля. Введите код ниже:
      </p>
      <div style="background: #f5f3ff; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
        <span style="font-size: 40px; font-weight: 900; color: #7c3aed; letter-spacing: 12px;">{code}</span>
      </div>
      <p style="color: #6b7280; font-size: 14px;">
        Код действителен 15 минут. Если вы не запрашивали сброс пароля — просто проигнорируйте это письмо.
      </p>
    </div>
    """

    msg.attach(MIMEText(html, 'html'))

    print(f"SMTP: connecting to {smtp_host}:{smtp_port} as {smtp_user}")
    with smtplib.SMTP_SSL(smtp_host, smtp_port) as server:
        server.login(smtp_user, smtp_password)
        server.sendmail(smtp_user, to_email, msg.as_string())
    print(f"SMTP: email sent to {to_email}")

def handler(event: dict, context) -> dict:
    """Регистрация, вход и восстановление пароля пользователей"""
    cors = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    }

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors, 'body': ''}

    body = json.loads(event.get('body') or '{}')
    action = body.get('action')

    conn = get_conn()
    try:
        cur = conn.cursor()
        S = SCHEMA

        if action == 'register':
            name = body.get('name', '').strip()
            email = body.get('email', '').strip().lower()
            password = body.get('password', '')
            ref = body.get('ref', '').strip().lower()

            if not name or not email or not password:
                return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'Заполните все поля'})}

            cur.execute(f'SELECT id FROM "{S}".users WHERE email = %s', (email,))
            if cur.fetchone():
                return {'statusCode': 409, 'headers': cors, 'body': json.dumps({'error': 'Email уже зарегистрирован'})}

            referred_by = None
            if ref:
                cur.execute(f'SELECT id FROM "{S}".users WHERE ref_code = %s', (ref,))
                ref_row = cur.fetchone()
                if ref_row:
                    referred_by = ref_row[0]

            ref_code = generate_ref_code()
            for _ in range(5):
                cur.execute(f'SELECT 1 FROM "{S}".users WHERE ref_code = %s', (ref_code,))
                if not cur.fetchone():
                    break
                ref_code = generate_ref_code()

            pw_hash = hash_password(password)
            cur.execute(
                f'INSERT INTO "{S}".users (name, email, password_hash, ref_code, referred_by) VALUES (%s, %s, %s, %s, %s) RETURNING id, name, email, created_at',
                (name, email, pw_hash, ref_code, referred_by)
            )
            row = cur.fetchone()
            conn.commit()
            return {
                'statusCode': 200,
                'headers': cors,
                'body': json.dumps({
                    'user': {'id': row[0], 'name': row[1], 'email': row[2], 'created_at': str(row[3])},
                    'test_results': [],
                    'balance': 0,
                    'subscription_expires': None,
                    'paid_tools': [],
                    'ref_code': ref_code,
                })
            }

        elif action == 'login':
            email = body.get('email', '').strip().lower()
            password = body.get('password', '')
            pw_hash = hash_password(password)

            cur.execute(f'SELECT id, name, email, balance, subscription_expires, paid_tools, ref_code FROM "{S}".users WHERE email = %s AND password_hash = %s', (email, pw_hash))
            row = cur.fetchone()
            if not row:
                return {'statusCode': 401, 'headers': cors, 'body': json.dumps({'error': 'Неверный email или пароль'})}

            user_id = row[0]
            balance = row[3] or 0
            sub_expires = str(row[4]) if row[4] else None
            paid_tools = [t.strip() for t in (row[5] or '').split(',') if t.strip()]
            user_ref_code = row[6]

            if not user_ref_code:
                user_ref_code = generate_ref_code()
                cur.execute(f'UPDATE "{S}".users SET ref_code = %s WHERE id = %s', (user_ref_code, user_id))

            cur.execute(f'UPDATE "{S}".users SET last_login = %s WHERE id = %s', (datetime.now(), user_id))
            conn.commit()

            cur.execute(
                f'SELECT test_type, score, result_data, created_at FROM "{S}".test_results WHERE user_id = %s ORDER BY created_at DESC',
                (user_id,)
            )
            results = []
            for r in cur.fetchall():
                results.append({
                    'test_type': r[0],
                    'score': r[1],
                    'result_data': r[2] if isinstance(r[2], dict) else json.loads(r[2]) if r[2] else {},
                    'created_at': str(r[3]) if r[3] else None,
                })

            return {
                'statusCode': 200,
                'headers': cors,
                'body': json.dumps({
                    'user': {'id': user_id, 'name': row[1], 'email': row[2]},
                    'test_results': results,
                    'balance': balance,
                    'subscription_expires': sub_expires,
                    'paid_tools': paid_tools,
                    'ref_code': user_ref_code,
                })
            }

        elif action == 'get_profile':
            email = body.get('email', '').strip().lower()
            if not email:
                return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'email required'})}

            cur.execute(
                f'SELECT id, balance, subscription_expires, paid_tools FROM "{S}".users WHERE email = %s',
                (email,)
            )
            row = cur.fetchone()
            if not row:
                return {'statusCode': 404, 'headers': cors, 'body': json.dumps({'error': 'User not found'})}

            balance = row[1] or 0
            sub_expires = str(row[2]) if row[2] else None
            paid_tools = [t.strip() for t in (row[3] or '').split(',') if t.strip()]
            return {
                'statusCode': 200,
                'headers': cors,
                'body': json.dumps({
                    'balance': balance,
                    'subscription_expires': sub_expires,
                    'paid_tools': paid_tools,
                })
            }

        elif action == 'save_test_result':
            user_id = body.get('userId')
            test_type = body.get('testType', '')
            result_data = body.get('resultData', {})
            score = result_data.get('topSegScore', 0) if isinstance(result_data, dict) else 0

            if not user_id:
                return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'userId required'})}

            cur.execute(
                f'DELETE FROM "{S}".test_results WHERE user_id = %s AND test_type = %s',
                (user_id, test_type)
            )
            cur.execute(
                f'INSERT INTO "{S}".test_results (user_id, test_type, score, result_data) VALUES (%s, %s, %s, %s)',
                (user_id, test_type, score, json.dumps(result_data, ensure_ascii=False))
            )
            conn.commit()
            return {'statusCode': 200, 'headers': cors, 'body': json.dumps({'ok': True})}

        elif action == 'reset_request':
            email = body.get('email', '').strip().lower()
            if not email:
                return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'Введите email'})}

            cur.execute(f'SELECT id FROM "{S}".users WHERE email = %s', (email,))
            if not cur.fetchone():
                return {'statusCode': 200, 'headers': cors, 'body': json.dumps({'ok': True})}

            code = generate_code()
            cur.execute(
                f'INSERT INTO "{S}".password_reset_codes (email, code) VALUES (%s, %s)',
                (email, code)
            )
            conn.commit()

            try:
                send_email(email, code)
            except Exception as e:
                print(f"SMTP ERROR: {e}")
                return {'statusCode': 500, 'headers': cors, 'body': json.dumps({'error': f'Ошибка отправки письма: {str(e)}'})}
            return {'statusCode': 200, 'headers': cors, 'body': json.dumps({'ok': True})}

        elif action == 'reset_confirm':
            email = body.get('email', '').strip().lower()
            code = body.get('code', '').strip()
            new_password = body.get('new_password', '')

            if not email or not code or not new_password:
                return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'Заполните все поля'})}

            cur.execute(
                f"SELECT id FROM \"{S}\".password_reset_codes WHERE email = %s AND code = %s AND used = FALSE AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1",
                (email, code)
            )
            row = cur.fetchone()
            if not row:
                return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'Неверный или устаревший код'})}

            reset_id = row[0]
            pw_hash = hash_password(new_password)
            cur.execute(f'UPDATE "{S}".users SET password_hash = %s WHERE email = %s', (pw_hash, email))
            cur.execute(f'UPDATE "{S}".password_reset_codes SET used = TRUE WHERE id = %s', (reset_id,))
            conn.commit()
            return {'statusCode': 200, 'headers': cors, 'body': json.dumps({'ok': True})}

        return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'Неизвестное действие'})}
    finally:
        conn.close()
