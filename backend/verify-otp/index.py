import json
import os
import random
import string
from datetime import datetime
import psycopg2


def get_client_ip(event):
    hdrs = event.get('headers') or {}
    ip = hdrs.get('X-Forwarded-For', hdrs.get('x-forwarded-for', ''))
    if ip:
        ip = ip.split(',')[0].strip()
    if not ip:
        ip = hdrs.get('X-Real-Ip', hdrs.get('x-real-ip', ''))
    if not ip:
        rc = event.get('requestContext') or {}
        ip = (rc.get('identity') or {}).get('sourceIp', 'unknown')
    return ip or 'unknown'


def check_rate_limit(cur, conn, ip, endpoint, max_requests, window_seconds):
    try:
        cur.execute(
            "SELECT id, request_count FROM rate_limits WHERE ip_address = '%s' AND endpoint = '%s' AND window_start > NOW() - INTERVAL '%d seconds' LIMIT 1"
            % (ip.replace("'", "''"), endpoint.replace("'", "''"), window_seconds)
        )
        row = cur.fetchone()
        if row and row[1] >= max_requests:
            return True
        if row:
            cur.execute("UPDATE rate_limits SET request_count = request_count + 1 WHERE id = %d" % row[0])
        else:
            cur.execute(
                "INSERT INTO rate_limits (ip_address, endpoint, request_count, window_start) VALUES ('%s', '%s', 1, NOW())"
                % (ip.replace("'", "''"), endpoint.replace("'", "''"))
            )
        conn.commit()
        return False
    except Exception:
        try:
            conn.rollback()
        except Exception:
            pass
        return False


def generate_code():
    chars = string.ascii_uppercase + string.digits
    return 'USER-' + ''.join(random.choices(chars, k=7))


def handler(event, context):
    """Проверка OTP-кода и регистрация/авторизация пользователя"""
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token, X-Session-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }

    headers = {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'}

    if event.get('httpMethod') != 'POST':
        return {'statusCode': 405, 'headers': headers, 'body': json.dumps({'error': 'Method not allowed'})}

    dsn = os.environ['DATABASE_URL']
    conn = psycopg2.connect(dsn)
    cur = conn.cursor()

    client_ip = get_client_ip(event)
    if check_rate_limit(cur, conn, client_ip, 'verify-otp', 10, 60):
        cur.close()
        conn.close()
        return {'statusCode': 429, 'headers': headers, 'body': json.dumps({'error': 'Too many attempts. Try again later.'})}

    raw_body = event.get('body') or '{}'
    body = json.loads(raw_body) if isinstance(raw_body, str) and raw_body.strip() else {}
    email = body.get('email', '').strip().lower()
    code = body.get('code', '').strip()
    name = body.get('name', '').strip()
    city = body.get('city', '').strip()
    mode = body.get('mode', 'register')
    device_token = body.get('device_token', '').strip()

    if not email or not code:
        cur.close()
        conn.close()
        return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Email and code required'})}

    schema = os.environ.get('MAIN_DB_SCHEMA', 'public')

    now_str = datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')
    cur.execute(
        "SELECT id, code FROM {schema}.otp_codes WHERE email = '{email}' AND used = false AND expires_at > '{now}' ORDER BY created_at DESC LIMIT 1".format(
            schema=schema, email=email.replace("'", "''"), now=now_str
        )
    )
    row = cur.fetchone()

    if not row:
        cur.close()
        conn.close()
        return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Code expired or not found'})}

    otp_id, stored_code = row

    if stored_code != code:
        cur.close()
        conn.close()
        return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Invalid code'})}

    cur.execute(
        "UPDATE {schema}.otp_codes SET used = true WHERE id = {otp_id}".format(
            schema=schema, otp_id=otp_id
        )
    )

    user_id = 'u_' + email.replace("'", "''")

    cur.execute(
        "SELECT id, username, rating, city, games_played, wins, losses, draws, user_code FROM {schema}.users WHERE id = '{uid}'".format(
            schema=schema, uid=user_id.replace("'", "''")
        )
    )
    existing = cur.fetchone()

    if mode == 'admin':
        conn.commit()
        cur.close()
        conn.close()
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({'success': True, 'verified': True})
        }

    if mode == 'login':
        if not existing:
            conn.commit()
            cur.close()
            conn.close()
            return {'statusCode': 404, 'headers': headers, 'body': json.dumps({'error': 'User not found', 'message': 'Аккаунт с этим email не найден. Пожалуйста, зарегистрируйтесь.'})}

        if device_token:
            cur.execute(
                "UPDATE {schema}.users SET active_device_token = '{dt}', session_expires_at = NOW() + INTERVAL '30 days' WHERE id = '{uid}'".format(
                    schema=schema, dt=device_token.replace("'", "''")[:64], uid=user_id.replace("'", "''")
                )
            )
        conn.commit()
        user_data = {
            'id': existing[0],
            'username': existing[1],
            'rating': existing[2],
            'city': existing[3],
            'games_played': existing[4],
            'wins': existing[5],
            'losses': existing[6],
            'draws': existing[7],
            'user_code': existing[8] or '',
            'is_new': False
        }
    elif existing:
        if name:
            cur.execute(
                "UPDATE {schema}.users SET username = '{name}', updated_at = now() WHERE id = '{uid}'".format(
                    schema=schema, name=name.replace("'", "''"), uid=user_id.replace("'", "''")
                )
            )
            if city:
                cur.execute(
                    "UPDATE {schema}.users SET city = '{city}' WHERE id = '{uid}'".format(
                        schema=schema, city=city.replace("'", "''"), uid=user_id.replace("'", "''")
                    )
                )
        if device_token:
            cur.execute(
                "UPDATE {schema}.users SET active_device_token = '{dt}', session_expires_at = NOW() + INTERVAL '30 days' WHERE id = '{uid}'".format(
                    schema=schema, dt=device_token.replace("'", "''")[:64], uid=user_id.replace("'", "''")
                )
            )
        conn.commit()

        user_data = {
            'id': existing[0],
            'username': name if name else existing[1],
            'rating': existing[2],
            'city': city if city else existing[3],
            'games_played': existing[4],
            'wins': existing[5],
            'losses': existing[6],
            'draws': existing[7],
            'user_code': existing[8] or '',
            'is_new': False
        }
    else:
        if not name:
            cur.close()
            conn.close()
            return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Name required for new user'})}

        new_code = generate_code()
        for _ in range(10):
            cur.execute("SELECT id FROM {schema}.users WHERE user_code = '{code}'".format(schema=schema, code=new_code.replace("'", "''")))
            if not cur.fetchone():
                break
            new_code = generate_code()

        dt_val = device_token.replace("'", "''")[:64] if device_token else ''
        cur.execute(
            "INSERT INTO {schema}.users (id, username, email, city, rating, games_played, wins, losses, draws, user_code, active_device_token, session_expires_at) VALUES ('{uid}', '{name}', '{email}', '{city}', 500, 0, 0, 0, 0, '{code}', '{dt}', NOW() + INTERVAL '30 days')".format(
                schema=schema,
                uid=user_id.replace("'", "''"),
                name=name.replace("'", "''"),
                email=email.replace("'", "''"),
                city=city.replace("'", "''"),
                code=new_code.replace("'", "''"),
                dt=dt_val
            )
        )
        conn.commit()

        user_data = {
            'id': user_id,
            'username': name,
            'rating': 500,
            'city': city,
            'games_played': 0,
            'wins': 0,
            'losses': 0,
            'draws': 0,
            'user_code': new_code,
            'is_new': True
        }

    cur.close()
    conn.close()

    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({'success': True, 'user': user_data})
    }