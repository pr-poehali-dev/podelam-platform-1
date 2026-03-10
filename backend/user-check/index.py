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
    """Проверка существования пользователя в БД и очистка всех данных"""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token, X-Session-Id', 'Access-Control-Max-Age': '86400'}, 'body': ''}

    headers = {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'}
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()

    client_ip = get_client_ip(event)
    if event.get('httpMethod') == 'POST':
        if check_rate_limit(cur, conn, client_ip, 'user-check', 10, 60):
            cur.close()
            conn.close()
            return {'statusCode': 429, 'headers': headers, 'body': json.dumps({'error': 'Too many requests'})}

    if event.get('httpMethod') == 'GET':
        qs = event.get('queryStringParameters') or {}
        user_id = qs.get('user_id', '')
        device_token = qs.get('device_token', '')
        if not user_id:
            cur.close()
            conn.close()
            return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'user_id required'})}

        safe_id = user_id.replace("'", "''")
        schema = os.environ.get('MAIN_DB_SCHEMA', 'public')
        cur.execute("SELECT id, username, rating, city, active_device_token, session_expires_at FROM {schema}.users WHERE id = '{uid}'".format(schema=schema, uid=safe_id))
        row = cur.fetchone()
        cur.close()
        conn.close()
        if not row:
            return {'statusCode': 404, 'headers': headers, 'body': json.dumps({'exists': False})}
        session_valid = True
        # Проверка device_token
        if device_token and row[4] and row[4] != device_token:
            session_valid = False
        # Проверка срока сессии
        if row[5] is not None:
            from datetime import datetime, timezone
            expires_at = row[5]
            if expires_at.tzinfo is None:
                expires_at = expires_at.replace(tzinfo=timezone.utc)
            if datetime.now(timezone.utc) > expires_at:
                session_valid = False
        return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'exists': True, 'session_valid': session_valid, 'user': {'id': row[0], 'username': row[1], 'rating': row[2], 'city': row[3]}})}

    if event.get('httpMethod') == 'POST':
        body = json.loads(event.get('body', '{}'))
        action = body.get('action', '')

        if action == 'cleanup' and body.get('confirm') == 'DELETE_ALL':
            cur.execute("DELETE FROM friends")
            cur.execute("DELETE FROM game_history")
            cur.execute("DELETE FROM matchmaking_queue")
            cur.execute("DELETE FROM online_games")
            cur.execute("DELETE FROM otp_codes")
            cur.execute("DELETE FROM users")
            conn.commit()
            cur.close()
            conn.close()
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'status': 'cleaned', 'message': 'All user data deleted'})}

        cur.close()
        conn.close()
        return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Invalid action'})}

    cur.close()
    conn.close()
    return {'statusCode': 405, 'headers': headers, 'body': json.dumps({'error': 'Method not allowed'})}