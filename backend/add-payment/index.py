import json
import os
import psycopg2

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 'public')

def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def handler(event: dict, context) -> dict:
    """Записать платёж клиента в базу данных"""
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

    if not user_email or not amount:
        return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'Укажите email и сумму'})}

    conn = get_conn()
    cur = conn.cursor()
    S = SCHEMA

    cur.execute(f'SELECT id FROM "{S}".users WHERE email = %s', (user_email,))
    user_row = cur.fetchone()
    user_id = user_row[0] if user_row else None

    cur.execute(
        f'INSERT INTO "{S}".payments (user_id, user_email, user_name, amount, tariff, status) VALUES (%s, %s, %s, %s, %s, %s) RETURNING id',
        (user_id, user_email, user_name, amount, tariff, status)
    )
    payment_id = cur.fetchone()[0]
    conn.commit()
    conn.close()

    return {
        'statusCode': 200,
        'headers': cors,
        'body': json.dumps({'payment_id': payment_id, 'status': 'ok'})
    }