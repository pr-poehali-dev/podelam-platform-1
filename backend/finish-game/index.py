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
    """Завершение партии: обновление рейтинга игрока и запись в историю"""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token, X-Session-Id', 'Access-Control-Max-Age': '86400'}, 'body': ''}

    headers = {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'}

    if event.get('httpMethod') != 'POST':
        return {'statusCode': 405, 'headers': headers, 'body': json.dumps({'error': 'Method not allowed'})}

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    client_ip = get_client_ip(event)
    if check_rate_limit(cur, conn, client_ip, 'finish-game', 10, 60):
        cur.close()
        conn.close()
        return {'statusCode': 429, 'headers': headers, 'body': json.dumps({'error': 'Too many requests'})}
    cur.close()
    conn.close()

    body = json.loads(event.get('body', '{}'))
    user_id = body.get('user_id', '')
    username = body.get('username', 'Player')
    avatar = body.get('avatar', '')
    result = body.get('result', '')
    opponent_name = body.get('opponent_name', '')
    opponent_type = body.get('opponent_type', 'bot')
    opponent_rating = body.get('opponent_rating')
    user_color = body.get('user_color', 'white')
    time_control = body.get('time_control', '10+0')
    difficulty = body.get('difficulty')
    moves_count = body.get('moves_count', 0)
    move_history = body.get('move_history', '')
    move_times = body.get('move_times', '')
    duration_seconds = body.get('duration_seconds')
    end_reason = body.get('end_reason', 'checkmate')

    if not user_id or result not in ('win', 'loss', 'draw'):
        return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'user_id and valid result required'})}

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()

    cur.execute("SELECT id, rating, games_played, wins, losses, draws FROM users WHERE id = '%s'" % user_id.replace("'", "''"))
    user = cur.fetchone()

    cur.execute("SELECT key, value FROM rating_settings")
    settings_rows = cur.fetchall()
    settings = {r[0]: r[1] for r in settings_rows}

    win_points = int(settings.get('win_points', '25'))
    loss_points = int(settings.get('loss_points', '15'))
    draw_points = int(settings.get('draw_points', '5'))
    initial_rating = int(settings.get('initial_rating', '1200'))
    min_rating = int(settings.get('min_rating', '500'))

    if not user:
        cur.execute(
            "INSERT INTO users (id, username, avatar, rating, games_played, wins, losses, draws) VALUES ('%s', '%s', '%s', %d, 0, 0, 0, 0)"
            % (user_id.replace("'", "''"), username.replace("'", "''"), avatar.replace("'", "''"), initial_rating)
        )
        conn.commit()
        current_rating = initial_rating
        games_played = 0
        wins = 0
        losses = 0
        draws = 0
    else:
        current_rating = user[1]
        games_played = user[2]
        wins = user[3]
        losses = user[4]
        draws = user[5]

    if result == 'win':
        rating_change = win_points
        wins += 1
    elif result == 'loss':
        rating_change = -loss_points
        losses += 1
    else:
        rating_change = draw_points
        draws += 1

    new_rating = current_rating + rating_change
    if new_rating < min_rating:
        new_rating = min_rating
        rating_change = new_rating - current_rating

    games_played += 1

    cur.execute(
        "UPDATE users SET rating = %d, games_played = %d, wins = %d, losses = %d, draws = %d, updated_at = NOW() WHERE id = '%s'"
        % (new_rating, games_played, wins, losses, draws, user_id.replace("'", "''"))
    )

    move_history_escaped = move_history.replace("'", "''") if move_history else ''
    move_times_escaped = move_times.replace("'", "''") if move_times else ''
    opponent_name_escaped = opponent_name.replace("'", "''")
    difficulty_val = "'%s'" % difficulty.replace("'", "''") if difficulty else 'NULL'
    opponent_rating_val = str(opponent_rating) if opponent_rating else 'NULL'
    duration_val = str(duration_seconds) if duration_seconds else 'NULL'

    cur.execute(
        """INSERT INTO game_history 
        (user_id, opponent_name, opponent_type, opponent_rating, result, user_color, time_control, difficulty, moves_count, move_history, move_times, rating_before, rating_after, rating_change, duration_seconds, end_reason)
        VALUES ('%s', '%s', '%s', %s, '%s', '%s', '%s', %s, %d, '%s', '%s', %d, %d, %d, %s, '%s')
        RETURNING id"""
        % (
            user_id.replace("'", "''"),
            opponent_name_escaped,
            opponent_type.replace("'", "''"),
            opponent_rating_val,
            result,
            user_color,
            time_control.replace("'", "''"),
            difficulty_val,
            moves_count,
            move_history_escaped,
            move_times_escaped,
            current_rating,
            new_rating,
            rating_change,
            duration_val,
            end_reason.replace("'", "''")
        )
    )
    game_id = cur.fetchone()[0]

    conn.commit()
    cur.close()
    conn.close()

    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({
            'game_id': game_id,
            'rating_before': current_rating,
            'rating_after': new_rating,
            'rating_change': rating_change,
            'games_played': games_played,
            'wins': wins,
            'losses': losses,
            'draws': draws
        })
    }