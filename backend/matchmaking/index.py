import json
import os
import psycopg2
import random

BOT_NAMES = [
    'Бот Каспаров', 'Бот Карлсен', 'Бот Фишер', 'Бот Таль',
    'Бот Капабланка', 'Бот Алехин', 'Бот Корчной', 'Бот Петросян'
]

def get_initial_time(time_control):
    if '+' in time_control:
        parts = time_control.split('+')
        return int(parts[0]) * 60
    mapping = {'blitz': 180, 'rapid': 600, 'classic': 900}
    return mapping.get(time_control, 600)


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


def create_game(cur, conn, headers, user_id, username, avatar, user_rating, matched, time_control, opponent_type, is_bot=False):
    matched_uid, matched_name, matched_avatar, matched_rating = matched

    assign_white = random.random() < 0.5
    initial_time = get_initial_time(time_control)

    if assign_white:
        w_uid, w_name, w_avatar, w_rating = user_id, username, avatar, user_rating
        b_uid, b_name, b_avatar, b_rating = matched_uid, matched_name, matched_avatar or '', matched_rating
    else:
        w_uid, w_name, w_avatar, w_rating = matched_uid, matched_name, matched_avatar or '', matched_rating
        b_uid, b_name, b_avatar, b_rating = user_id, username, avatar, user_rating

    cur.execute(
        """INSERT INTO online_games (white_user_id, white_username, white_avatar, white_rating, black_user_id, black_username, black_avatar, black_rating, time_control, opponent_type, is_bot_game, white_time, black_time)
        VALUES ('%s', '%s', '%s', %d, '%s', '%s', '%s', %d, '%s', '%s', %s, %d, %d) RETURNING id"""
        % (esc(w_uid), esc(w_name), esc(w_avatar), w_rating,
           esc(b_uid), esc(b_name), esc(b_avatar), b_rating,
           esc(time_control), esc(opponent_type), 'TRUE' if is_bot else 'FALSE', initial_time, initial_time)
    )
    game_id = cur.fetchone()[0]
    conn.commit()

    player_color = 'white' if assign_white else 'black'
    status = 'bot_game' if is_bot else 'matched'
    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({
            'status': status,
            'game_id': game_id,
            'player_color': player_color,
            'opponent_name': matched_name,
            'opponent_rating': matched_rating,
            'opponent_avatar': matched_avatar or ''
        })
    }


def handler(event: dict, context) -> dict:
    """Матчмейкинг с каскадным поиском: город → регион → рейтинг ±50 → любой онлайн"""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token, X-Session-Id', 'Access-Control-Max-Age': '86400'}, 'body': ''}

    headers = {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'}

    client_ip = get_client_ip(event)
    if event.get('httpMethod') == 'POST':
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor()
        if check_rate_limit(cur, conn, client_ip, 'matchmaking', 20, 60):
            cur.close()
            conn.close()
            return {'statusCode': 429, 'headers': headers, 'body': json.dumps({'error': 'Too many requests'})}
        cur.close()
        conn.close()

    if event.get('httpMethod') == 'DELETE':
        body = json.loads(event.get('body', '{}'))
        user_id = body.get('user_id', '')
        if not user_id:
            return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'user_id required'})}
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor()
        cur.execute("DELETE FROM matchmaking_queue WHERE user_id = '%s'" % esc(user_id))
        conn.commit()
        cur.close()
        conn.close()
        return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'status': 'removed'})}

    if event.get('httpMethod') == 'GET':
        qs = event.get('queryStringParameters') or {}
        game_id = qs.get('game_id', '')
        user_id = qs.get('user_id', '')
        if game_id:
            conn = psycopg2.connect(os.environ['DATABASE_URL'])
            cur = conn.cursor()
            cur.execute("SELECT id, white_user_id, white_username, white_avatar, white_rating, black_user_id, black_username, black_avatar, black_rating, time_control, status, is_bot_game, current_player, white_time, black_time, move_history, board_state, winner, end_reason FROM online_games WHERE id = %d" % int(game_id))
            row = cur.fetchone()
            cur.close()
            conn.close()
            if not row:
                return {'statusCode': 404, 'headers': headers, 'body': json.dumps({'error': 'game not found'})}
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({
                'game': {
                    'id': row[0], 'white_user_id': row[1], 'white_username': row[2], 'white_avatar': row[3], 'white_rating': row[4],
                    'black_user_id': row[5], 'black_username': row[6], 'black_avatar': row[7], 'black_rating': row[8],
                    'time_control': row[9], 'status': row[10], 'is_bot_game': row[11], 'current_player': row[12],
                    'white_time': row[13], 'black_time': row[14], 'move_history': row[15], 'board_state': row[16],
                    'winner': row[17], 'end_reason': row[18]
                }
            })}
        if user_id:
            conn = psycopg2.connect(os.environ['DATABASE_URL'])
            cur = conn.cursor()
            cur.execute("SELECT id FROM matchmaking_queue WHERE user_id = '%s'" % esc(user_id))
            in_queue = cur.fetchone()
            # Проверяем, не была ли уже создана игра для этого пользователя (второй игрок)
            cur.execute(
                "SELECT id, white_user_id, black_user_id, time_control, is_bot_game, white_username, black_username, white_avatar, black_avatar, white_rating, black_rating FROM online_games WHERE (white_user_id = '%s' OR black_user_id = '%s') AND status = 'playing' AND created_at > NOW() - INTERVAL '30 seconds' ORDER BY created_at DESC LIMIT 1"
                % (esc(user_id), esc(user_id))
            )
            game_row = cur.fetchone()
            cur.close()
            conn.close()
            result = {'in_queue': bool(in_queue)}
            if game_row:
                game_id = game_row[0]
                is_white = game_row[1] == user_id
                player_color = 'white' if is_white else 'black'
                opp_name = game_row[6] if is_white else game_row[5]
                opp_avatar = game_row[8] if is_white else game_row[7]
                opp_rating = game_row[10] if is_white else game_row[9]
                result['active_game'] = {
                    'game_id': game_id,
                    'player_color': player_color,
                    'opponent_name': opp_name,
                    'opponent_rating': opp_rating,
                    'opponent_avatar': opp_avatar or '',
                    'time_control': game_row[3],
                    'is_bot_game': game_row[4]
                }
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps(result)}
        return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'game_id or user_id required'})}

    if event.get('httpMethod') != 'POST':
        return {'statusCode': 405, 'headers': headers, 'body': json.dumps({'error': 'Method not allowed'})}

    body = json.loads(event.get('body', '{}'))
    action = body.get('action', 'search')
    user_id = body.get('user_id', '')
    username = body.get('username', 'Player')
    avatar = body.get('avatar', '')
    user_rating = body.get('rating', 1200)
    opponent_type = body.get('opponent_type', 'country')
    time_control = body.get('time_control', 'rapid')
    city = body.get('city', '')
    region = body.get('region', '')
    search_stage = body.get('search_stage', 'city')

    if not user_id:
        return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'user_id required'})}

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()

    # Читаем настройки матчмейкинга из БД
    cur.execute("SELECT key, value FROM site_settings WHERE key LIKE 'mm_%'")
    mm_rows = cur.fetchall()
    mm_cfg = {r[0]: r[1] for r in mm_rows}
    HEARTBEAT_TIMEOUT = int(mm_cfg.get('mm_heartbeat_timeout', '10'))
    DEAD_RECORD_TTL = int(mm_cfg.get('mm_dead_record_ttl', '15'))
    RATING_RANGE = int(mm_cfg.get('mm_rating_range', '50'))

    if action == 'play_bot':
        cur.execute("DELETE FROM matchmaking_queue WHERE user_id = '%s'" % esc(user_id))
        bot_name = random.choice(BOT_NAMES)
        bot_rating = user_rating + random.randint(-30, 30)
        result = create_game(cur, conn, headers, user_id, username, avatar, user_rating,
                             ('bot', bot_name, '', bot_rating), time_control, opponent_type, is_bot=True)
        cur.close()
        conn.close()
        return result

    cur.execute("SELECT id FROM matchmaking_queue WHERE user_id = '%s'" % esc(user_id))
    already_in = cur.fetchone()

    match = None
    matched_stage = None

    HEARTBEAT_FILTER = "AND last_heartbeat > NOW() - INTERVAL '%d seconds'" % HEARTBEAT_TIMEOUT

    if search_stage == 'city' and city:
        cur.execute(
            "SELECT user_id, username, avatar, rating, time_control FROM matchmaking_queue WHERE user_id != '%s' AND time_control = '%s' AND city = '%s' %s ORDER BY ABS(rating - %d) LIMIT 1"
            % (esc(user_id), esc(time_control), esc(city), HEARTBEAT_FILTER, user_rating)
        )
        match = cur.fetchone()
        if match:
            matched_stage = 'city'

    if not match and search_stage in ('city', 'region') and region:
        cur.execute(
            "SELECT user_id, username, avatar, rating, time_control FROM matchmaking_queue WHERE user_id != '%s' AND time_control = '%s' AND region = '%s' %s ORDER BY ABS(rating - %d) LIMIT 1"
            % (esc(user_id), esc(time_control), esc(region), HEARTBEAT_FILTER, user_rating)
        )
        match = cur.fetchone()
        if match:
            matched_stage = 'region'

    if not match and search_stage in ('city', 'region', 'rating', 'any'):
        rating_min = user_rating - RATING_RANGE
        rating_max = user_rating + RATING_RANGE
        cur.execute(
            "SELECT user_id, username, avatar, rating, time_control FROM matchmaking_queue WHERE user_id != '%s' AND time_control = '%s' AND rating >= %d AND rating <= %d %s ORDER BY ABS(rating - %d) LIMIT 1"
            % (esc(user_id), esc(time_control), rating_min, rating_max, HEARTBEAT_FILTER, user_rating)
        )
        match = cur.fetchone()
        if match:
            matched_stage = 'rating'

    if not match and search_stage == 'any':
        cur.execute(
            "SELECT user_id, username, avatar, rating, time_control FROM matchmaking_queue WHERE user_id != '%s' %s ORDER BY ABS(rating - %d) LIMIT 1"
            % (esc(user_id), HEARTBEAT_FILTER, user_rating)
        )
        match = cur.fetchone()
        if match:
            matched_stage = 'any'

    # Чистим «мертвые» записи
    cur.execute("DELETE FROM matchmaking_queue WHERE last_heartbeat < NOW() - INTERVAL '%d seconds'" % DEAD_RECORD_TTL)
    conn.commit()

    if match:
        matched_uid, matched_name, matched_avatar, matched_rating, matched_tc = match

        cur.execute("DELETE FROM matchmaking_queue WHERE user_id IN ('%s', '%s')" % (esc(user_id), esc(matched_uid)))

        result = create_game(cur, conn, headers, user_id, username, avatar, user_rating,
                             (matched_uid, matched_name, matched_avatar, matched_rating),
                             time_control, opponent_type)
        resp = json.loads(result['body'])
        resp['matched_stage'] = matched_stage
        result['body'] = json.dumps(resp)
        cur.close()
        conn.close()
        return result

    if not already_in:
        cur.execute(
            "INSERT INTO matchmaking_queue (user_id, username, avatar, rating, opponent_type, time_control, city, region, last_heartbeat) VALUES ('%s', '%s', '%s', %d, '%s', '%s', '%s', '%s', NOW()) ON CONFLICT (user_id) DO UPDATE SET rating = %d, opponent_type = '%s', time_control = '%s', city = '%s', region = '%s', created_at = NOW(), last_heartbeat = NOW()"
            % (esc(user_id), esc(username), esc(avatar), user_rating,
               esc(opponent_type), esc(time_control), esc(city), esc(region),
               user_rating, esc(opponent_type), esc(time_control), esc(city), esc(region))
        )
        conn.commit()
    else:
        cur.execute("UPDATE matchmaking_queue SET last_heartbeat = NOW() WHERE user_id = '%s'" % esc(user_id))
        conn.commit()

    cur.execute("SELECT COUNT(*) FROM matchmaking_queue WHERE time_control = '%s'" % esc(time_control))
    queue_count = cur.fetchone()[0]

    cur.close()
    conn.close()

    return {'statusCode': 200, 'headers': headers, 'body': json.dumps({
        'status': 'searching',
        'search_stage': search_stage,
        'queue_count': queue_count
    })}