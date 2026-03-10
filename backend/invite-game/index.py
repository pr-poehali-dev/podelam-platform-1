import json
import os
import psycopg2
import random


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


def get_initial_time(time_control):
    if '+' in time_control:
        parts = time_control.split('+')
        return int(parts[0]) * 60
    mapping = {'blitz': 180, 'rapid': 600, 'classic': 900}
    return mapping.get(time_control, 600)


def handler(event: dict, context) -> dict:
    """Приглашения на игру между друзьями: отправка, опрос, принятие, отклонение"""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token, X-Session-Id', 'Access-Control-Max-Age': '86400'}, 'body': ''}

    headers = {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'}
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()

    client_ip = get_client_ip(event)
    if event.get('httpMethod') == 'POST':
        if check_rate_limit(cur, conn, client_ip, 'invite-game', 20, 60):
            cur.close()
            conn.close()
            return {'statusCode': 429, 'headers': headers, 'body': json.dumps({'error': 'Too many requests'})}

    try:
        if event.get('httpMethod') == 'GET':
            qs = event.get('queryStringParameters') or {}
            action = qs.get('action', 'poll')
            user_id = qs.get('user_id', '')

            if not user_id:
                return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'user_id required'})}

            if action == 'poll':
                cur.execute(
                    "DELETE FROM game_invites WHERE status = 'pending' AND created_at < NOW() - INTERVAL '2 minutes'"
                )
                conn.commit()

                cur.execute(
                    "SELECT id, from_user_id, from_username, from_avatar, from_rating, time_control, color_choice, created_at "
                    "FROM game_invites WHERE to_user_id = '%s' AND status = 'pending' "
                    "ORDER BY created_at DESC LIMIT 1" % esc(user_id)
                )
                row = cur.fetchone()
                if row:
                    return {'statusCode': 200, 'headers': headers, 'body': json.dumps({
                        'invite': {
                            'id': row[0],
                            'from_user_id': row[1],
                            'from_username': row[2],
                            'from_avatar': row[3],
                            'from_rating': row[4],
                            'time_control': row[5],
                            'color_choice': row[6],
                            'created_at': row[7].isoformat() if row[7] else ''
                        }
                    })}
                return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'invite': None})}

            if action == 'check_accepted':
                invite_id = qs.get('invite_id', '')
                if not invite_id:
                    return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'invite_id required'})}
                cur.execute(
                    "SELECT id, status, game_id FROM game_invites WHERE id = %d AND from_user_id = '%s'" % (int(invite_id), esc(user_id))
                )
                row = cur.fetchone()
                if not row:
                    return {'statusCode': 404, 'headers': headers, 'body': json.dumps({'error': 'invite not found'})}
                return {'statusCode': 200, 'headers': headers, 'body': json.dumps({
                    'status': row[1],
                    'game_id': row[2]
                })}

            return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'unknown action'})}

        if event.get('httpMethod') != 'POST':
            return {'statusCode': 405, 'headers': headers, 'body': json.dumps({'error': 'Method not allowed'})}

        body = json.loads(event.get('body', '{}'))
        action = body.get('action', '')

        if action == 'send':
            from_user_id = body.get('from_user_id', '')
            to_user_id = body.get('to_user_id', '')
            time_control = body.get('time_control', '10+0')
            color_choice = body.get('color_choice', 'random')

            if not from_user_id or not to_user_id:
                return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'from_user_id and to_user_id required'})}

            cur.execute("SELECT id, username, avatar, rating FROM users WHERE id = '%s'" % esc(from_user_id))
            sender = cur.fetchone()
            if not sender:
                return {'statusCode': 404, 'headers': headers, 'body': json.dumps({'error': 'sender not found'})}

            cur.execute("SELECT id FROM users WHERE id = '%s'" % esc(to_user_id))
            receiver = cur.fetchone()
            if not receiver:
                return {'statusCode': 404, 'headers': headers, 'body': json.dumps({'error': 'receiver not found'})}

            cur.execute(
                "DELETE FROM game_invites WHERE from_user_id = '%s' AND to_user_id = '%s' AND status = 'pending'"
                % (esc(from_user_id), esc(to_user_id))
            )

            cur.execute(
                "INSERT INTO game_invites (from_user_id, from_username, from_avatar, from_rating, to_user_id, time_control, color_choice) "
                "VALUES ('%s', '%s', '%s', %d, '%s', '%s', '%s') RETURNING id"
                % (esc(from_user_id), esc(sender[1]), esc(sender[2] or ''), sender[3], esc(to_user_id), esc(time_control), esc(color_choice))
            )
            invite_id = cur.fetchone()[0]
            conn.commit()

            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({
                'status': 'sent',
                'invite_id': invite_id
            })}

        if action == 'accept':
            invite_id = body.get('invite_id', 0)
            user_id = body.get('user_id', '')

            if not invite_id or not user_id:
                return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'invite_id and user_id required'})}

            cur.execute(
                "SELECT id, from_user_id, from_username, from_avatar, from_rating, to_user_id, time_control, color_choice, status "
                "FROM game_invites WHERE id = %d AND to_user_id = '%s'" % (int(invite_id), esc(user_id))
            )
            invite = cur.fetchone()
            if not invite:
                return {'statusCode': 404, 'headers': headers, 'body': json.dumps({'error': 'invite not found'})}
            if invite[8] != 'pending':
                return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'invite already processed'})}

            cur.execute("SELECT id, username, avatar, rating FROM users WHERE id = '%s'" % esc(user_id))
            accepter = cur.fetchone()
            if not accepter:
                return {'statusCode': 404, 'headers': headers, 'body': json.dumps({'error': 'user not found'})}

            from_uid = invite[1]
            from_name = invite[2]
            from_avatar = invite[3] or ''
            from_rating = invite[4]
            to_uid = user_id
            to_name = accepter[1]
            to_avatar = accepter[2] or ''
            to_rating = accepter[3]
            time_control = invite[6]
            color_choice = invite[7]
            initial_time = get_initial_time(time_control)

            if color_choice == 'white':
                w_uid, w_name, w_avatar, w_rating = from_uid, from_name, from_avatar, from_rating
                b_uid, b_name, b_avatar, b_rating = to_uid, to_name, to_avatar, to_rating
            elif color_choice == 'black':
                w_uid, w_name, w_avatar, w_rating = to_uid, to_name, to_avatar, to_rating
                b_uid, b_name, b_avatar, b_rating = from_uid, from_name, from_avatar, from_rating
            else:
                if random.random() < 0.5:
                    w_uid, w_name, w_avatar, w_rating = from_uid, from_name, from_avatar, from_rating
                    b_uid, b_name, b_avatar, b_rating = to_uid, to_name, to_avatar, to_rating
                else:
                    w_uid, w_name, w_avatar, w_rating = to_uid, to_name, to_avatar, to_rating
                    b_uid, b_name, b_avatar, b_rating = from_uid, from_name, from_avatar, from_rating

            cur.execute(
                """INSERT INTO online_games (white_user_id, white_username, white_avatar, white_rating, black_user_id, black_username, black_avatar, black_rating, time_control, opponent_type, is_bot_game, white_time, black_time)
                VALUES ('%s', '%s', '%s', %d, '%s', '%s', '%s', %d, '%s', 'friend', FALSE, %d, %d) RETURNING id"""
                % (esc(w_uid), esc(w_name), esc(w_avatar), w_rating,
                   esc(b_uid), esc(b_name), esc(b_avatar), b_rating,
                   esc(time_control), initial_time, initial_time)
            )
            game_id = cur.fetchone()[0]

            cur.execute(
                "UPDATE game_invites SET status = 'accepted', game_id = %d, updated_at = NOW() WHERE id = %d"
                % (game_id, int(invite_id))
            )
            conn.commit()

            accepter_color = 'white' if w_uid == to_uid else 'black'

            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({
                'status': 'accepted',
                'game_id': game_id,
                'player_color': accepter_color,
                'opponent_name': from_name,
                'opponent_rating': from_rating,
                'opponent_avatar': from_avatar,
                'time_control': time_control
            })}

        if action == 'decline':
            invite_id = body.get('invite_id', 0)
            user_id = body.get('user_id', '')

            if not invite_id or not user_id:
                return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'invite_id and user_id required'})}

            cur.execute(
                "UPDATE game_invites SET status = 'declined', updated_at = NOW() WHERE id = %d AND to_user_id = '%s' AND status = 'pending'"
                % (int(invite_id), esc(user_id))
            )
            conn.commit()

            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'status': 'declined'})}

        return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'unknown action'})}

    finally:
        cur.close()
        conn.close()