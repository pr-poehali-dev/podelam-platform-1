import json
import os
import psycopg2
import random
import string
from datetime import datetime, timedelta


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


def generate_code():
    chars = string.ascii_uppercase + string.digits
    return 'USER-' + ''.join(random.choices(chars, k=7))


def handler(event: dict, context) -> dict:
    """Управление друзьями: добавление с подтверждением, удаление, список, профиль, история, init"""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token, X-Session-Id', 'Access-Control-Max-Age': '86400'}, 'body': ''}

    headers = {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'}
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()

    client_ip = get_client_ip(event)
    if event.get('httpMethod') == 'POST':
        if check_rate_limit(cur, conn, client_ip, 'friends', 20, 60):
            cur.close()
            conn.close()
            return {'statusCode': 429, 'headers': headers, 'body': json.dumps({'error': 'Too many requests'})}

    if event.get('httpMethod') == 'GET':
        qs = event.get('queryStringParameters') or {}
        action = qs.get('action', 'list')
        user_id = qs.get('user_id', '')

        if not user_id:
            cur.close()
            conn.close()
            return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'user_id required'})}

        if action == 'my_code':
            cur.execute("SELECT user_code FROM users WHERE id = '%s'" % esc(user_id))
            row = cur.fetchone()
            if not row or not row[0]:
                new_code = generate_code()
                for _ in range(10):
                    cur.execute("SELECT id FROM users WHERE user_code = '%s'" % esc(new_code))
                    if not cur.fetchone():
                        break
                    new_code = generate_code()
                cur.execute("UPDATE users SET user_code = '%s' WHERE id = '%s'" % (esc(new_code), esc(user_id)))
                conn.commit()
                cur.close()
                conn.close()
                return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'code': new_code})}
            cur.close()
            conn.close()
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'code': row[0]})}

        if action == 'heartbeat':
            cur.execute("UPDATE users SET last_online = NOW() WHERE id = '%s'" % esc(user_id))
            conn.commit()
            cur.close()
            conn.close()
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'ok': True})}

        if action == 'init':
            cur.execute("UPDATE users SET last_online = NOW() WHERE id = '%s'" % esc(user_id))
            conn.commit()
            cur.execute("SELECT user_code FROM users WHERE id = '%s'" % esc(user_id))
            row = cur.fetchone()
            code = ''
            if not row or not row[0]:
                new_code = generate_code()
                for _ in range(10):
                    cur.execute("SELECT id FROM users WHERE user_code = '%s'" % esc(new_code))
                    if not cur.fetchone():
                        break
                    new_code = generate_code()
                cur.execute("UPDATE users SET user_code = '%s' WHERE id = '%s'" % (esc(new_code), esc(user_id)))
                conn.commit()
                code = new_code
            else:
                code = row[0]
            cur.execute(
                """SELECT u.id, u.username, u.avatar, u.rating, u.city, u.last_online, u.user_code, f.status
                   FROM friends f
                   JOIN users u ON u.id = f.friend_id
                   WHERE f.user_id = '%s' AND f.status = 'confirmed'
                   ORDER BY u.last_online DESC NULLS LAST""" % esc(user_id))
            f_rows = cur.fetchall()
            now = datetime.utcnow()
            friends = []
            for r in f_rows:
                last_online = r[5]
                is_online = last_online and (now - last_online) < timedelta(minutes=5)
                friends.append({'id': r[0], 'username': r[1], 'avatar': r[2] or '', 'rating': r[3], 'city': r[4] or '',
                                'status': 'online' if is_online else 'offline', 'user_code': r[6] or ''})
            cur.execute(
                """SELECT u.id, u.username, u.avatar, u.rating, u.city, u.user_code
                   FROM friends f JOIN users u ON u.id = f.user_id
                   WHERE f.friend_id = '%s' AND f.status = 'pending'
                   AND NOT EXISTS (SELECT 1 FROM friends f2 WHERE f2.user_id = '%s' AND f2.friend_id = f.user_id)
                   ORDER BY f.created_at DESC""" % (esc(user_id), esc(user_id)))
            p_rows = cur.fetchall()
            pending = []
            for r in p_rows:
                pending.append({'id': r[0], 'username': r[1], 'avatar': r[2] or '', 'rating': r[3], 'city': r[4] or '', 'user_code': r[5] or ''})
            cur.close()
            conn.close()
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'code': code, 'friends': friends, 'pending': pending})}

        if action == 'resolve_code':
            code = qs.get('code', '')
            if not code:
                cur.close()
                conn.close()
                return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'code required'})}
            cur.execute("SELECT id, username, avatar, rating, city, user_code FROM users WHERE user_code = '%s'" % esc(code))
            row = cur.fetchone()
            cur.close()
            conn.close()
            if not row:
                return {'statusCode': 404, 'headers': headers, 'body': json.dumps({'error': 'User not found'})}
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({
                'user': {'id': row[0], 'username': row[1], 'avatar': row[2] or '', 'rating': row[3], 'city': row[4] or '', 'user_code': row[5]}
            })}

        if action == 'profile':
            friend_id = qs.get('friend_id', '')
            if not friend_id:
                cur.close()
                conn.close()
                return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'friend_id required'})}
            cur.execute("SELECT id, username, avatar, rating, city, games_played, wins, losses, draws, last_online FROM users WHERE id = '%s'" % esc(friend_id))
            row = cur.fetchone()
            cur.close()
            conn.close()
            if not row:
                return {'statusCode': 404, 'headers': headers, 'body': json.dumps({'error': 'User not found'})}
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({
                'user': {'id': row[0], 'username': row[1], 'avatar': row[2] or '', 'rating': row[3], 'city': row[4] or '',
                         'games_played': row[5], 'wins': row[6], 'losses': row[7], 'draws': row[8],
                         'last_online': row[9].isoformat() if row[9] else None}
            })}

        if action == 'friend_games':
            friend_id = qs.get('friend_id', '')
            if not friend_id:
                cur.close()
                conn.close()
                return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'friend_id required'})}
            cur.execute(
                """SELECT id, opponent_name, opponent_type, opponent_rating, result, user_color,
                          time_control, difficulty, moves_count, rating_before, rating_after,
                          rating_change, duration_seconds, end_reason, created_at
                   FROM game_history WHERE user_id = '%s' ORDER BY created_at DESC LIMIT 50""" % esc(friend_id))
            rows = cur.fetchall()
            cur.close()
            conn.close()
            games = []
            for r in rows:
                games.append({'id': r[0], 'opponent_name': r[1], 'opponent_type': r[2], 'opponent_rating': r[3],
                              'result': r[4], 'user_color': r[5], 'time_control': r[6], 'difficulty': r[7],
                              'moves_count': r[8], 'rating_before': r[9], 'rating_after': r[10], 'rating_change': r[11],
                              'duration_seconds': r[12], 'end_reason': r[13],
                              'created_at': r[14].isoformat() if r[14] else None})
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'games': games})}

        if action == 'pending':
            cur.execute(
                """SELECT u.id, u.username, u.avatar, u.rating, u.city, u.user_code
                   FROM friends f JOIN users u ON u.id = f.user_id
                   WHERE f.friend_id = '%s' AND f.status = 'pending'
                   AND NOT EXISTS (SELECT 1 FROM friends f2 WHERE f2.user_id = '%s' AND f2.friend_id = f.user_id)
                   ORDER BY f.created_at DESC""" % (esc(user_id), esc(user_id)))
            rows = cur.fetchall()
            cur.close()
            conn.close()
            pending = []
            for r in rows:
                pending.append({'id': r[0], 'username': r[1], 'avatar': r[2] or '', 'rating': r[3], 'city': r[4] or '', 'user_code': r[5] or ''})
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'pending': pending})}

        cur.execute(
            """SELECT u.id, u.username, u.avatar, u.rating, u.city, u.last_online, u.user_code, f.status
               FROM friends f
               JOIN users u ON u.id = f.friend_id
               WHERE f.user_id = '%s' AND f.status = 'confirmed'
               ORDER BY u.last_online DESC NULLS LAST""" % esc(user_id))
        rows = cur.fetchall()
        cur.close()
        conn.close()
        friends = []
        now = datetime.utcnow()
        for r in rows:
            last_online = r[5]
            is_online = last_online and (now - last_online) < timedelta(minutes=5)
            friends.append({'id': r[0], 'username': r[1], 'avatar': r[2] or '', 'rating': r[3], 'city': r[4] or '',
                            'status': 'online' if is_online else 'offline', 'user_code': r[6] or ''})
        return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'friends': friends})}

    if event.get('httpMethod') == 'POST':
        body = json.loads(event.get('body', '{}'))
        action = body.get('action', 'add')
        user_id = body.get('user_id', '')

        if not user_id:
            cur.close()
            conn.close()
            return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'user_id required'})}

        if action == 'add':
            friend_code = body.get('friend_code', '')
            if not friend_code:
                cur.close()
                conn.close()
                return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'friend_code required'})}

            cur.execute("SELECT id, username, avatar, rating, city, user_code FROM users WHERE user_code = '%s'" % esc(friend_code))
            friend_row = cur.fetchone()
            if not friend_row:
                cur.close()
                conn.close()
                return {'statusCode': 404, 'headers': headers, 'body': json.dumps({'error': 'User not found'})}

            friend_id = friend_row[0]
            if friend_id == user_id:
                cur.close()
                conn.close()
                return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Cannot add yourself'})}

            cur.execute("SELECT id, status FROM friends WHERE user_id = '%s' AND friend_id = '%s'" % (esc(user_id), esc(friend_id)))
            existing = cur.fetchone()
            if existing and existing[1] == 'confirmed':
                cur.close()
                conn.close()
                return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Already friends'})}

            cur.execute("SELECT id FROM friends WHERE user_id = '%s' AND friend_id = '%s'" % (esc(friend_id), esc(user_id)))
            reverse_exists = cur.fetchone()

            if reverse_exists:
                cur.execute("UPDATE friends SET status = 'confirmed' WHERE user_id = '%s' AND friend_id = '%s'" % (esc(friend_id), esc(user_id)))
                if not existing:
                    cur.execute("INSERT INTO friends (user_id, friend_id, status) VALUES ('%s', '%s', 'confirmed')" % (esc(user_id), esc(friend_id)))
                else:
                    cur.execute("UPDATE friends SET status = 'confirmed' WHERE user_id = '%s' AND friend_id = '%s'" % (esc(user_id), esc(friend_id)))
                conn.commit()
                cur.close()
                conn.close()
                return {'statusCode': 200, 'headers': headers, 'body': json.dumps({
                    'status': 'confirmed',
                    'friend': {'id': friend_row[0], 'username': friend_row[1], 'avatar': friend_row[2] or '',
                               'rating': friend_row[3], 'city': friend_row[4] or '', 'user_code': friend_row[5]}
                })}
            else:
                if not existing:
                    cur.execute("INSERT INTO friends (user_id, friend_id, status) VALUES ('%s', '%s', 'pending')" % (esc(user_id), esc(friend_id)))
                conn.commit()
                cur.close()
                conn.close()
                return {'statusCode': 200, 'headers': headers, 'body': json.dumps({
                    'status': 'pending',
                    'friend': {'id': friend_row[0], 'username': friend_row[1], 'avatar': friend_row[2] or '',
                               'rating': friend_row[3], 'city': friend_row[4] or '', 'user_code': friend_row[5]}
                })}

        if action == 'accept':
            friend_id = body.get('friend_id', '')
            if not friend_id:
                cur.close()
                conn.close()
                return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'friend_id required'})}
            cur.execute("UPDATE friends SET status = 'confirmed' WHERE user_id = '%s' AND friend_id = '%s'" % (esc(friend_id), esc(user_id)))
            cur.execute("INSERT INTO friends (user_id, friend_id, status) VALUES ('%s', '%s', 'confirmed') ON CONFLICT (user_id, friend_id) DO UPDATE SET status = 'confirmed'" % (esc(user_id), esc(friend_id)))
            conn.commit()
            cur.close()
            conn.close()
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'status': 'confirmed'})}

        if action == 'reject':
            friend_id = body.get('friend_id', '')
            if not friend_id:
                cur.close()
                conn.close()
                return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'friend_id required'})}
            cur.execute("DELETE FROM friends WHERE user_id = '%s' AND friend_id = '%s'" % (esc(friend_id), esc(user_id)))
            conn.commit()
            cur.close()
            conn.close()
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'status': 'rejected'})}

        if action == 'remove':
            friend_id = body.get('friend_id', '')
            if not friend_id:
                cur.close()
                conn.close()
                return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'friend_id required'})}
            cur.execute("DELETE FROM friends WHERE (user_id = '%s' AND friend_id = '%s') OR (user_id = '%s' AND friend_id = '%s')" % (esc(user_id), esc(friend_id), esc(friend_id), esc(user_id)))
            conn.commit()
            cur.close()
            conn.close()
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'status': 'removed'})}

    cur.close()
    conn.close()
    return {'statusCode': 405, 'headers': headers, 'body': json.dumps({'error': 'Method not allowed'})}