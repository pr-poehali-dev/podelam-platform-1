import json
import os
import psycopg2
from datetime import datetime, timedelta

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 'public')

def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def handler(event: dict, context) -> dict:
    """Записать платёж и обновить баланс/подписку пользователя"""
    cors = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    }

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors, 'body': ''}

    body = json.loads(event.get('body') or '{}')
    user_email = body.get('user_email', '').strip().lower()
    user_name = body.get('user_name', '').strip()
    amount = body.get('amount', 0)
    tariff = body.get('tariff', '')
    status = body.get('status', 'paid')
    action = body.get('action', 'payment')

    if action == 'consume_tool':
        tool_id = body.get('tool_id', '')
        if user_email and tool_id:
            conn = get_conn()
            try:
                cur = conn.cursor()
                S = SCHEMA
                cur.execute(f'SELECT id, paid_tools FROM "{S}".users WHERE email = %s', (user_email,))
                row = cur.fetchone()
                if row:
                    uid, paid = row[0], row[1] or ''
                    paid_set = set(t.strip() for t in paid.split(',') if t.strip())
                    paid_set.discard(tool_id)
                    cur.execute(f'UPDATE "{S}".users SET paid_tools = %s WHERE id = %s', (','.join(sorted(paid_set)), uid))
                    conn.commit()
            finally:
                conn.close()
        return {'statusCode': 200, 'headers': cors, 'body': json.dumps({'status': 'consumed'})}

    if not user_email or not amount:
        return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'Укажите email и сумму'})}

    conn = get_conn()
    try:
        cur = conn.cursor()
        S = SCHEMA

        cur.execute(f'SELECT id, balance, subscription_expires, paid_tools FROM "{S}".users WHERE email = %s', (user_email,))
        user_row = cur.fetchone()
        user_id = user_row[0] if user_row else None
        current_balance = user_row[1] or 0 if user_row else 0
        current_sub = user_row[2] if user_row else None
        current_paid = user_row[3] or '' if user_row else ''

        cur.execute(
            f'INSERT INTO "{S}".payments (user_id, user_email, user_name, amount, tariff, status) VALUES (%s, %s, %s, %s, %s, %s) RETURNING id',
            (user_id, user_email, user_name, amount, tariff, status)
        )
        payment_id = cur.fetchone()[0]

        if user_id:
            if action == 'topup':
                new_balance = current_balance + amount
                cur.execute(f'UPDATE "{S}".users SET balance = %s WHERE id = %s', (new_balance, user_id))
            elif action == 'pay_tool':
                tool_id = body.get('tool_id', '')
                new_balance = max(0, current_balance - amount)
                paid_set = set(t.strip() for t in current_paid.split(',') if t.strip())
                if tool_id:
                    paid_set.add(tool_id)
                new_paid = ','.join(sorted(paid_set))
                cur.execute(f'UPDATE "{S}".users SET balance = %s, paid_tools = %s WHERE id = %s', (new_balance, new_paid, user_id))
            elif action == 'pay_sub':
                new_balance = max(0, current_balance - amount)
                now = datetime.now()
                base = current_sub if current_sub and current_sub > now else now
                new_sub = base + timedelta(days=30)
                cur.execute(f'UPDATE "{S}".users SET balance = %s, subscription_expires = %s WHERE id = %s', (new_balance, new_sub, user_id))

        if user_id and action in ('pay_tool', 'pay_sub') and status == 'paid':
            cur.execute(f'SELECT referred_by FROM "{S}".users WHERE id = %s', (user_id,))
            ref_row = cur.fetchone()
            referrer_id = ref_row[0] if ref_row and ref_row[0] else None
            if referrer_id:
                bonus = int(amount * 0.2)
                if bonus > 0:
                    cur.execute(
                        f'UPDATE "{S}".users SET ref_balance = ref_balance + %s WHERE id = %s',
                        (bonus, referrer_id)
                    )
                    cur.execute(
                        f'INSERT INTO "{S}".referral_transactions (referrer_id, referred_id, payment_id, amount) VALUES (%s, %s, %s, %s)',
                        (referrer_id, user_id, payment_id, bonus)
                    )

        conn.commit()

        return {
            'statusCode': 200,
            'headers': cors,
            'body': json.dumps({'payment_id': payment_id, 'status': 'ok'})
        }
    finally:
        conn.close()
