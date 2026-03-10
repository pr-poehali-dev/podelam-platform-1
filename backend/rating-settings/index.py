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


def handler(event: dict, context) -> dict:
    """Получение и обновление настроек рейтинговой системы"""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token, X-Session-Id', 'Access-Control-Max-Age': '86400'}, 'body': ''}

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    headers = {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'}

    cur = conn.cursor()
    client_ip = get_client_ip(event)
    method = event.get('httpMethod', 'GET')
    if method == 'PUT':
        if check_rate_limit(cur, conn, client_ip, 'rating-settings', 10, 60):
            cur.close()
            conn.close()
            return {'statusCode': 429, 'headers': headers, 'body': json.dumps({'error': 'Too many requests'})}
    cur.close()

    if method == 'GET':
        cur = conn.cursor()
        cur.execute("SELECT key, value, description FROM rating_settings ORDER BY id")
        rows = cur.fetchall()
        cur.close()
        conn.close()

        settings = {}
        for row in rows:
            settings[row[0]] = {'value': row[1], 'description': row[2]}

        return {'statusCode': 200, 'headers': headers, 'body': json.dumps(settings, ensure_ascii=False)}

    if method == 'PUT':
        body = json.loads(event.get('body', '{}'))
        cur = conn.cursor()

        for key, val in body.items():
            value = str(val) if not isinstance(val, dict) else str(val.get('value', ''))
            cur.execute(
                "UPDATE rating_settings SET value = '%s', updated_at = NOW() WHERE key = '%s'" % (
                    value.replace("'", "''"), key.replace("'", "''")
                )
            )

        conn.commit()
        cur.close()
        conn.close()

        return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'ok': True})}

    conn.close()
    return {'statusCode': 405, 'headers': headers, 'body': json.dumps({'error': 'Method not allowed'})}