import json
import os
import psycopg2
from datetime import datetime


def esc(val):
    return str(val).replace("'", "''")


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
    """Чат между друзьями: отправка, получение сообщений, список бесед"""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token, X-Session-Id', 'Access-Control-Max-Age': '86400'}, 'body': ''}

    headers = {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'}
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()

    client_ip = get_client_ip(event)
    if event.get('httpMethod') == 'POST':
        if check_rate_limit(cur, conn, client_ip, 'chat', 30, 60):
            cur.close()
            conn.close()
            return {'statusCode': 429, 'headers': headers, 'body': json.dumps({'error': 'Too many requests'})}

    if event.get('httpMethod') == 'GET':
        qs = event.get('queryStringParameters') or {}
        action = qs.get('action', 'conversations')
        user_id = qs.get('user_id', '')

        if not user_id:
            cur.close()
            conn.close()
            return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'user_id required'})}

        if action == 'conversations':
            cur.execute("""
                WITH last_msgs AS (
                    SELECT
                        CASE WHEN sender_id = '%s' THEN receiver_id ELSE sender_id END AS partner_id,
                        text,
                        created_at,
                        sender_id,
                        ROW_NUMBER() OVER (
                            PARTITION BY LEAST(sender_id, receiver_id), GREATEST(sender_id, receiver_id)
                            ORDER BY created_at DESC
                        ) AS rn
                    FROM chat_messages
                    WHERE sender_id = '%s' OR receiver_id = '%s'
                ),
                partners AS (
                    SELECT partner_id, text AS last_message, created_at AS last_message_time, sender_id
                    FROM last_msgs WHERE rn = 1
                ),
                unread_counts AS (
                    SELECT sender_id AS partner_id, COUNT(*) AS unread
                    FROM chat_messages
                    WHERE receiver_id = '%s' AND read_at IS NULL
                    GROUP BY sender_id
                )
                SELECT p.partner_id, u.username, u.avatar, u.rating, u.city, u.last_online,
                       p.last_message, p.last_message_time, COALESCE(uc.unread, 0) AS unread,
                       p.sender_id
                FROM partners p
                JOIN users u ON u.id = p.partner_id
                LEFT JOIN unread_counts uc ON uc.partner_id = p.partner_id
                ORDER BY p.last_message_time DESC
            """ % (esc(user_id), esc(user_id), esc(user_id), esc(user_id)))
            rows = cur.fetchall()

            conversations = []
            now = datetime.utcnow()
            for r in rows:
                last_online = r[5]
                from datetime import timedelta
                is_online = last_online and (now - last_online) < timedelta(minutes=5)
                is_own = r[9] == user_id
                conversations.append({
                    'partner_id': r[0],
                    'username': r[1],
                    'avatar': r[2] or '',
                    'rating': r[3],
                    'city': r[4] or '',
                    'status': 'online' if is_online else 'offline',
                    'last_message': r[6] or '',
                    'last_message_time': r[7].isoformat() if r[7] else None,
                    'unread': r[8],
                    'last_message_is_own': is_own
                })

            cur.close()
            conn.close()
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'conversations': conversations})}

        if action == 'messages':
            partner_id = qs.get('partner_id', '')
            if not partner_id:
                cur.close()
                conn.close()
                return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'partner_id required'})}

            before_id = qs.get('before_id', '')
            limit = 50

            where_before = ""
            if before_id:
                where_before = " AND m.id < %s" % int(before_id)

            cur.execute("""
                SELECT m.id, m.sender_id, m.text, m.created_at, m.read_at,
                       u.username
                FROM chat_messages m
                JOIN users u ON u.id = m.sender_id
                WHERE ((m.sender_id = '%s' AND m.receiver_id = '%s')
                    OR (m.sender_id = '%s' AND m.receiver_id = '%s'))
                %s
                ORDER BY m.created_at DESC
                LIMIT %d
            """ % (esc(user_id), esc(partner_id), esc(partner_id), esc(user_id), where_before, limit))
            rows = cur.fetchall()

            cur.execute("""
                UPDATE chat_messages SET read_at = NOW()
                WHERE sender_id = '%s' AND receiver_id = '%s' AND read_at IS NULL
            """ % (esc(partner_id), esc(user_id)))
            conn.commit()

            messages = []
            for r in reversed(rows):
                messages.append({
                    'id': r[0],
                    'sender_id': r[1],
                    'text': r[2],
                    'created_at': r[3].isoformat() if r[3] else None,
                    'read_at': r[4].isoformat() if r[4] else None,
                    'sender_name': r[5],
                    'is_own': r[1] == user_id
                })

            cur.close()
            conn.close()
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'messages': messages})}

    if event.get('httpMethod') == 'POST':
        body = json.loads(event.get('body', '{}'))
        action = body.get('action', 'send')
        user_id = body.get('user_id', '')

        if not user_id:
            cur.close()
            conn.close()
            return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'user_id required'})}

        if action == 'send':
            receiver_id = body.get('receiver_id', '')
            text = body.get('text', '').strip()

            if not receiver_id or not text:
                cur.close()
                conn.close()
                return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'receiver_id and text required'})}

            if len(text) > 2000:
                text = text[:2000]

            cur.execute("""
                INSERT INTO chat_messages (sender_id, receiver_id, text)
                VALUES ('%s', '%s', '%s')
                RETURNING id, created_at
            """ % (esc(user_id), esc(receiver_id), esc(text)))
            row = cur.fetchone()
            conn.commit()

            cur.close()
            conn.close()
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({
                'message_id': row[0],
                'created_at': row[1].isoformat() if row[1] else None
            })}

        if action == 'mark_read':
            partner_id = body.get('partner_id', '')
            if not partner_id:
                cur.close()
                conn.close()
                return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'partner_id required'})}

            cur.execute("""
                UPDATE chat_messages SET read_at = NOW()
                WHERE sender_id = '%s' AND receiver_id = '%s' AND read_at IS NULL
            """ % (esc(partner_id), esc(user_id)))
            conn.commit()
            cur.close()
            conn.close()
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'ok': True})}

    cur.close()
    conn.close()
    return {'statusCode': 405, 'headers': headers, 'body': json.dumps({'error': 'Method not allowed'})}