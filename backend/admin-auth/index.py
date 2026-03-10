import json
import os
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


def handler(event, context):
    """Проверка админского доступа по email после OTP-верификации"""
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
    if check_rate_limit(cur, conn, client_ip, 'admin-auth', 5, 60):
        cur.close()
        conn.close()
        return {'statusCode': 429, 'headers': headers, 'body': json.dumps({'error': 'Too many requests'})}
    cur.close()
    conn.close()

    raw_body = event.get('body') or '{}'
    body = json.loads(raw_body) if isinstance(raw_body, str) and raw_body.strip() else {}
    email = body.get('email', '').strip().lower()

    if not email or '@' not in email:
        return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Invalid email'})}

    dsn = os.environ['DATABASE_URL']
    schema = os.environ.get('MAIN_DB_SCHEMA', 'public')
    conn = psycopg2.connect(dsn)
    cur = conn.cursor()

    cur.execute(
        "SELECT id, email FROM {schema}.admins WHERE email = '{email}'".format(
            schema=schema, email=email.replace("'", "''")
        )
    )
    admin = cur.fetchone()
    cur.close()
    conn.close()

    if not admin:
        return {'statusCode': 403, 'headers': headers, 'body': json.dumps({'error': 'Access denied', 'message': 'Этот email не имеет доступа к админ-панели'})}

    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({'success': True, 'admin': {'id': admin[0], 'email': admin[1]}})
    }