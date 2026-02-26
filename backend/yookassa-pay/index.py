import json
import os
import uuid
import psycopg2
import urllib.request
import urllib.error
import base64

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 'public')
YOOKASSA_API = 'https://api.yookassa.ru/v3/payments'

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token, X-Session-Id',
    'Access-Control-Max-Age': '86400',
}

def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def yookassa_request(method, url, data=None):
    """Запрос к API ЮКассы с Basic Auth"""
    shop_id = os.environ['YOOKASSA_SHOP_ID']
    secret = os.environ['YOOKASSA_SECRET_KEY']
    creds = base64.b64encode(f'{shop_id}:{secret}'.encode()).decode()

    headers = {
        'Authorization': f'Basic {creds}',
        'Content-Type': 'application/json',
        'Idempotence-Key': str(uuid.uuid4()),
    }

    body = json.dumps(data).encode() if data else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        error_body = e.read().decode() if e.fp else ''
        print(f'[YOOKASSA ERROR] {e.code}: {error_body}')
        return {'error': True, 'code': e.code, 'detail': error_body}

def respond(status, body):
    return {'statusCode': status, 'headers': CORS, 'body': json.dumps(body, ensure_ascii=False)}

def handler(event: dict, context) -> dict:
    """Создание платежа ЮКассы и обработка вебхука подтверждения оплаты"""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    body = json.loads(event.get('body') or '{}')
    action = body.get('action', '')

    if body.get('event') and body.get('object'):
        return handle_webhook(event, body)

    if action == 'webhook':
        return handle_webhook(event, body)

    if action == 'status':
        return handle_status(event, body)

    return handle_create(event, body)


def handle_create(event, body):
    """Создать платёж в ЮКассе и вернуть URL для оплаты"""
    user_email = body.get('user_email', '').strip().lower()
    user_name = body.get('user_name', '').strip()
    amount = body.get('amount', 0)
    return_url = body.get('return_url', '')

    if not user_email or not amount or amount < 1:
        return respond(400, {'error': 'Укажите email и сумму (минимум 1₽)'})

    if not return_url:
        return respond(400, {'error': 'Укажите return_url'})

    conn = get_conn()
    cur = conn.cursor()
    S = SCHEMA

    cur.execute(f'SELECT id FROM "{S}".users WHERE email = %s', (user_email,))
    user_row = cur.fetchone()
    user_id = user_row[0] if user_row else None

    cur.execute(
        f'''INSERT INTO "{S}".payments (user_id, user_email, user_name, amount, tariff, status, description)
            VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING id''',
        (user_id, user_email, user_name, amount, 'Пополнение баланса', 'pending', f'Пополнение баланса на {amount}₽')
    )
    payment_id = cur.fetchone()[0]
    conn.commit()

    func_url = event.get('requestContext', {}).get('functionId', '')
    webhook_base = event.get('headers', {}).get('X-Forwarded-Proto', 'https') + '://' + event.get('headers', {}).get('Host', '')
    if not webhook_base or webhook_base == 'https://':
        webhook_base = f"https://functions.poehali.dev/{func_url}"

    success_url = f"{return_url}/payment/success?payment_id={payment_id}"
    fail_url = f"{return_url}/payment/fail?payment_id={payment_id}"

    amount_value = f'{int(amount)}.00' if float(amount) == int(amount) else f'{float(amount):.2f}'

    yookassa_data = {
        'amount': {
            'value': amount_value,
            'currency': 'RUB',
        },
        'confirmation': {
            'type': 'redirect',
            'return_url': success_url,
        },
        'capture': True,
        'description': f'Пополнение баланса ПоДелам — {amount}₽',
        'receipt': {
            'customer': {'email': user_email},
            'items': [{
                'description': f'Пополнение баланса на {amount}₽',
                'quantity': '1.00',
                'amount': {'value': amount_value, 'currency': 'RUB'},
                'vat_code': 1,
                'payment_subject': 'service',
                'payment_mode': 'full_payment',
            }],
        },
        'metadata': {
            'payment_id': payment_id,
            'user_email': user_email,
            'amount': amount,
        },
    }

    yookassa_resp = yookassa_request('POST', YOOKASSA_API, yookassa_data)

    if yookassa_resp.get('error'):
        conn.close()
        return respond(500, {'error': 'Не удалось создать платёж', 'detail': yookassa_resp.get('detail', '')})

    yookassa_id = yookassa_resp.get('id', '')
    confirmation_url = yookassa_resp.get('confirmation', {}).get('confirmation_url', '')

    cur = conn.cursor()
    cur.execute(
        f'UPDATE "{S}".payments SET yookassa_id = %s WHERE id = %s',
        (yookassa_id, payment_id)
    )
    conn.commit()
    conn.close()

    if not confirmation_url:
        return respond(500, {'error': 'Не удалось создать платёж'})

    return respond(200, {
        'payment_id': payment_id,
        'yookassa_id': yookassa_id,
        'confirmation_url': confirmation_url,
    })


def handle_webhook(event, body):
    """Вебхук от ЮКассы — подтверждение оплаты"""
    event_type = body.get('event', '')
    payment_obj = body.get('object', {})

    if not payment_obj or not event_type:
        return respond(200, {'status': 'ignored'})

    if 'succeeded' not in event_type and 'canceled' not in event_type and 'waiting_for_capture' not in event_type:
        return respond(200, {'status': 'ignored'})

    yookassa_id = payment_obj.get('id', '')
    yk_status = payment_obj.get('status', '')

    if not yookassa_id:
        return respond(200, {'status': 'no_id'})

    conn = get_conn()
    cur = conn.cursor()
    S = SCHEMA

    cur.execute(
        f'SELECT id, user_email, amount, status, user_id FROM "{S}".payments WHERE yookassa_id = %s',
        (yookassa_id,)
    )
    row = cur.fetchone()

    if not row:
        conn.close()
        return respond(200, {'status': 'not_found'})

    payment_id, user_email, amount, current_status, user_id = row

    if current_status == 'paid':
        conn.close()
        return respond(200, {'status': 'already_paid'})

    if yk_status == 'succeeded':
        cur.execute(
            f"UPDATE \"{S}\".payments SET status = 'paid' WHERE id = %s",
            (payment_id,)
        )

        if user_id:
            cur.execute(
                f'UPDATE "{S}".users SET balance = balance + %s WHERE id = %s',
                (amount, user_id)
            )

        conn.commit()
        conn.close()
        return respond(200, {'status': 'paid', 'payment_id': payment_id})

    elif yk_status == 'canceled':
        cur.execute(
            f"UPDATE \"{S}\".payments SET status = 'failed' WHERE id = %s",
            (payment_id,)
        )
        conn.commit()
        conn.close()
        return respond(200, {'status': 'failed', 'payment_id': payment_id})

    conn.close()
    return respond(200, {'status': 'pending'})


def handle_status(event, body):
    """Проверить статус платежа по payment_id"""
    payment_id = body.get('payment_id')

    if not payment_id:
        return respond(400, {'error': 'Укажите payment_id'})

    conn = get_conn()
    cur = conn.cursor()
    S = SCHEMA

    cur.execute(
        f'SELECT id, status, amount, yookassa_id, user_id FROM "{S}".payments WHERE id = %s',
        (payment_id,)
    )
    row = cur.fetchone()

    if not row:
        conn.close()
        return respond(404, {'error': 'Платёж не найден'})

    db_status = row[1]
    amount = row[2]
    yookassa_id = row[3]
    user_id = row[4]

    if db_status == 'pending' and yookassa_id:
        yk_resp = yookassa_request('GET', f'{YOOKASSA_API}/{yookassa_id}')
        yk_status = yk_resp.get('status', '')

        if yk_status == 'succeeded':
            cur.execute(
                f"UPDATE \"{S}\".payments SET status = 'paid' WHERE id = %s AND status = 'pending'",
                (payment_id,)
            )
            if cur.rowcount > 0 and user_id:
                cur.execute(
                    f'UPDATE "{S}".users SET balance = balance + %s WHERE id = %s',
                    (amount, user_id)
                )
            conn.commit()
            db_status = 'paid'

        elif yk_status == 'canceled':
            cur.execute(
                f"UPDATE \"{S}\".payments SET status = 'failed' WHERE id = %s",
                (payment_id,)
            )
            conn.commit()
            db_status = 'failed'

    conn.close()

    return respond(200, {
        'payment_id': row[0],
        'status': db_status,
        'amount': amount,
    })