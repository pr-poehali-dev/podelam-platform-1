import json
import os
import psycopg2
import time as time_module


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
    """Ходы и состояние онлайн-партии: отправка хода, получение состояния, завершение игры"""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token, X-Session-Id', 'Access-Control-Max-Age': '86400'}, 'body': ''}

    headers = {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'}

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()

    client_ip = get_client_ip(event)
    if event.get('httpMethod') == 'POST':
        if check_rate_limit(cur, conn, client_ip, 'online-move', 60, 60):
            cur.close()
            conn.close()
            return {'statusCode': 429, 'headers': headers, 'body': json.dumps({'error': 'Too many requests'})}

    if event.get('httpMethod') == 'GET':
        qs = event.get('queryStringParameters') or {}
        game_id = qs.get('game_id', '')
        if not game_id:
            cur.close()
            conn.close()
            return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'game_id required'})}

        # Быстрый режим — только сигналы, без состояния игры
        if qs.get('signals_only') == '1':
            req_user_id = qs.get('user_id', '')
            signals = []
            if req_user_id:
                safe_uid = req_user_id.replace("'", "''")
                cur.execute(
                    "SELECT id, from_user_id, signal_type, signal_data FROM webrtc_signals WHERE game_id = %d AND to_user_id = '%s' AND consumed = FALSE ORDER BY id ASC LIMIT 20"
                    % (int(game_id), safe_uid)
                )
                sig_rows = cur.fetchall()
                if sig_rows:
                    sig_ids = ','.join(str(r[0]) for r in sig_rows)
                    cur.execute("UPDATE webrtc_signals SET consumed = TRUE WHERE id IN (%s)" % sig_ids)
                    conn.commit()
                    signals = [{'from': r[1], 'type': r[2], 'data': r[3]} for r in sig_rows]
            cur.close()
            conn.close()
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'signals': signals})}

        cur.execute(
            """SELECT id, white_user_id, white_username, white_avatar, white_rating,
                      black_user_id, black_username, black_avatar, black_rating,
                      time_control, status, is_bot_game, current_player,
                      white_time, black_time, move_history, board_state,
                      winner, end_reason,
                      EXTRACT(EPOCH FROM (NOW() - last_move_at))::int as seconds_since_move,
                      move_number,
                      rematch_offered_by, rematch_status, rematch_game_id,
                      draw_offered_by
            FROM online_games WHERE id = %d""" % int(game_id)
        )
        row = cur.fetchone()

        if not row:
            cur.close()
            conn.close()
            return {'statusCode': 404, 'headers': headers, 'body': json.dumps({'error': 'game not found'})}

        seconds_since_move = row[19] or 0
        status = row[10]
        current_player = row[12]
        white_time = row[13]
        black_time = row[14]
        move_number = row[20] or 0

        if status == 'playing' and seconds_since_move > 0:
            if current_player == 'white':
                white_time = max(0, white_time - seconds_since_move)
            else:
                black_time = max(0, black_time - seconds_since_move)

        signals = []
        req_user_id = qs.get('user_id', '')
        if req_user_id:
            safe_uid = req_user_id.replace("'", "''")
            cur.execute(
                "SELECT id, from_user_id, signal_type, signal_data FROM webrtc_signals WHERE game_id = %d AND to_user_id = '%s' AND consumed = FALSE ORDER BY id ASC LIMIT 20"
                % (int(game_id), safe_uid)
            )
            sig_rows = cur.fetchall()
            if sig_rows:
                sig_ids = ','.join(str(r[0]) for r in sig_rows)
                cur.execute("UPDATE webrtc_signals SET consumed = TRUE WHERE id IN (%s)" % sig_ids)
                conn.commit()
                signals = [{'from': r[1], 'type': r[2], 'data': r[3]} for r in sig_rows]

        cur.close()
        conn.close()

        return {'statusCode': 200, 'headers': headers, 'body': json.dumps({
            'game': {
                'id': row[0],
                'white_user_id': row[1], 'white_username': row[2], 'white_avatar': row[3], 'white_rating': row[4],
                'black_user_id': row[5], 'black_username': row[6], 'black_avatar': row[7], 'black_rating': row[8],
                'time_control': row[9], 'status': status, 'is_bot_game': row[11],
                'current_player': current_player,
                'white_time': white_time, 'black_time': black_time,
                'move_history': row[15], 'board_state': row[16],
                'winner': row[17], 'end_reason': row[18],
                'move_number': move_number,
                'seconds_since_move': seconds_since_move,
                'rematch_offered_by': row[21], 'rematch_status': row[22], 'rematch_game_id': row[23],
                'draw_offered_by': row[24]
            },
            'signals': signals
        })}

    if event.get('httpMethod') != 'POST':
        cur.close()
        conn.close()
        return {'statusCode': 405, 'headers': headers, 'body': json.dumps({'error': 'Method not allowed'})}

    body = json.loads(event.get('body', '{}'))
    action = body.get('action', 'move')
    game_id = body.get('game_id')
    user_id = body.get('user_id', '')

    if not game_id or not user_id:
        cur.close()
        conn.close()
        return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'game_id and user_id required'})}

    cur.execute(
        """SELECT id, white_user_id, black_user_id, current_player, status,
                  white_time, black_time, move_history, is_bot_game, time_control,
                  EXTRACT(EPOCH FROM (NOW() - last_move_at))::int as seconds_since_move,
                  move_number
        FROM online_games WHERE id = %d""" % int(game_id)
    )
    game = cur.fetchone()

    if not game:
        cur.close()
        conn.close()
        return {'statusCode': 404, 'headers': headers, 'body': json.dumps({'error': 'game not found'})}

    g_id, white_uid, black_uid, current_player, status, white_time, black_time, move_hist, is_bot, tc, secs_since, db_move_number = game
    db_move_number = db_move_number or 0

    if user_id != white_uid and user_id != black_uid:
        cur.close()
        conn.close()
        return {'statusCode': 403, 'headers': headers, 'body': json.dumps({'error': 'not a player in this game'})}

    player_color = 'white' if user_id == white_uid else 'black'

    def esc(val):
        return str(val).replace("'", "''")

    if action == 'chat':
        text = body.get('text', '').strip()[:500]
        if not text:
            cur.close(); conn.close()
            return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'text required'})}
        to_user = black_uid if user_id == white_uid else white_uid
        import json as _json
        cur.execute(
            "INSERT INTO webrtc_signals (game_id, from_user_id, to_user_id, signal_type, signal_data) VALUES (%d, '%s', '%s', 'chat', '%s')"
            % (g_id, esc(user_id), esc(to_user), esc(_json.dumps({'text': text})))
        )
        conn.commit()
        cur.close(); conn.close()
        return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'status': 'sent'})}

    if action == 'reconnect':
        # Сбрасываем last_move_at только если сейчас ход соперника (не наш)
        # Это предотвращает срабатывание таймера бездействия у ожидающего
        if status == 'playing' and player_color != current_player:
            cur.execute("UPDATE online_games SET last_move_at = NOW() WHERE id = %d" % g_id)
            conn.commit()
        cur.close(); conn.close()
        return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'status': 'ok'})}


    if action == 'signal':
        signal_type = body.get('signal_type', '')
        signal_data = body.get('signal_data', '')
        if not signal_type or not signal_data:
            cur.close()
            conn.close()
            return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'signal_type and signal_data required'})}
        to_user = black_uid if user_id == white_uid else white_uid
        cur.execute(
            "INSERT INTO webrtc_signals (game_id, from_user_id, to_user_id, signal_type, signal_data) VALUES (%d, '%s', '%s', '%s', '%s')"
            % (g_id, esc(user_id), esc(to_user), esc(signal_type), esc(signal_data))
        )
        conn.commit()
        cur.close()
        conn.close()
        return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'status': 'signal_sent'})}

    if action == 'rematch_offer':
        cur.execute(
            "UPDATE online_games SET rematch_offered_by = '%s', rematch_status = 'pending', rematch_offered_at = NOW(), updated_at = NOW() WHERE id = %d"
            % (esc(user_id), g_id)
        )
        conn.commit()
        cur.close()
        conn.close()
        return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'status': 'rematch_offered'})}

    if action in ('rematch_decline', 'rematch_expired'):
        new_rs = 'expired' if action == 'rematch_expired' else 'declined'
        cur.execute(
            "UPDATE online_games SET rematch_status = '%s', updated_at = NOW() WHERE id = %d" % (new_rs, g_id)
        )
        conn.commit()
        cur.close()
        conn.close()
        return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'status': 'rematch_' + new_rs})}

    if action == 'rematch_accept':
        cur.execute(
            """SELECT white_user_id, white_username, white_avatar, white_rating,
                      black_user_id, black_username, black_avatar, black_rating,
                      time_control, opponent_type
            FROM online_games WHERE id = %d""" % g_id
        )
        old = cur.fetchone()
        if not old:
            cur.close()
            conn.close()
            return {'statusCode': 404, 'headers': headers, 'body': json.dumps({'error': 'game not found'})}

        ow_uid, ow_name, ow_avatar, ow_rating = old[0], old[1], old[2] or '', old[3]
        ob_uid, ob_name, ob_avatar, ob_rating = old[4], old[5], old[6] or '', old[7]
        otc, oop = old[8], old[9]

        def get_initial_time(tc):
            if '+' in tc:
                return int(tc.split('+')[0]) * 60
            return {'blitz': 180, 'rapid': 600, 'classic': 900}.get(tc, 600)

        init_time = get_initial_time(otc)

        cur.execute(
            """INSERT INTO online_games (white_user_id, white_username, white_avatar, white_rating,
                black_user_id, black_username, black_avatar, black_rating,
                time_control, opponent_type, is_bot_game, white_time, black_time)
            VALUES ('%s', '%s', '%s', %d, '%s', '%s', '%s', %d, '%s', '%s', FALSE, %d, %d) RETURNING id"""
            % (esc(ob_uid), esc(ob_name), esc(ob_avatar), ob_rating,
               esc(ow_uid), esc(ow_name), esc(ow_avatar), ow_rating,
               esc(otc), esc(oop), init_time, init_time)
        )
        new_game_id = cur.fetchone()[0]

        cur.execute(
            "UPDATE online_games SET rematch_status = 'accepted', rematch_game_id = %d, updated_at = NOW() WHERE id = %d"
            % (new_game_id, g_id)
        )
        conn.commit()
        cur.close()
        conn.close()
        return {'statusCode': 200, 'headers': headers, 'body': json.dumps({
            'status': 'rematch_accepted',
            'new_game_id': new_game_id,
            'old_white': ow_uid,
            'old_black': ob_uid
        })}

    if action == 'draw_offer':
        cur.execute(
            "UPDATE online_games SET draw_offered_by = '%s', updated_at = NOW() WHERE id = %d AND status = 'playing'"
            % (user_id.replace("'", "''"), g_id)
        )
        conn.commit()
        cur.close()
        conn.close()
        return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'status': 'draw_offered'})}

    if action == 'draw_decline':
        cur.execute(
            "UPDATE online_games SET draw_offered_by = NULL, updated_at = NOW() WHERE id = %d" % g_id
        )
        conn.commit()
        cur.close()
        conn.close()
        return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'status': 'draw_declined'})}

    if action == 'resign':
        winner = black_uid if player_color == 'white' else white_uid
        cur.execute(
            "UPDATE online_games SET status = 'finished', winner = '%s', end_reason = 'resign', updated_at = NOW() WHERE id = %d"
            % (winner.replace("'", "''"), g_id)
        )
        conn.commit()
        cur.close()
        conn.close()
        return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'status': 'finished', 'winner': winner, 'end_reason': 'resign'})}

    if action == 'draw':
        cur.execute(
            "UPDATE online_games SET status = 'finished', end_reason = 'draw', draw_offered_by = NULL, updated_at = NOW() WHERE id = %d" % g_id
        )
        conn.commit()
        cur.close()
        conn.close()
        return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'status': 'finished', 'end_reason': 'draw'})}

    if action == 'timeout':
        loser_color = body.get('loser_color', '')
        winner = white_uid if loser_color == 'black' else black_uid
        cur.execute(
            "UPDATE online_games SET status = 'finished', winner = '%s', end_reason = 'timeout', updated_at = NOW() WHERE id = %d"
            % (winner.replace("'", "''"), g_id)
        )
        conn.commit()
        cur.close()
        conn.close()
        return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'status': 'finished', 'winner': winner, 'end_reason': 'timeout'})}

    if status != 'playing':
        cur.close()
        conn.close()
        return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'game is not active'})}

    if player_color != current_player:
        cur.close()
        conn.close()
        return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'not your turn'})}

    move = body.get('move', '')
    board_state = body.get('board_state', '')
    game_status = body.get('game_status', 'playing')
    winner_id = body.get('winner_id', '')
    client_move_number = body.get('move_number', -1)

    if not move:
        cur.close()
        conn.close()
        return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'move required'})}

    if client_move_number >= 0 and client_move_number != db_move_number:
        cur.close()
        conn.close()
        return {'statusCode': 409, 'headers': headers, 'body': json.dumps({'error': 'move_number mismatch', 'expected': db_move_number, 'got': client_move_number})}

    increment = 0
    if '+' in tc:
        parts = tc.split('+')
        increment = int(parts[1]) if len(parts) > 1 else 0
    elif tc == 'blitz':
        increment = 2
    elif tc == 'rapid':
        increment = 5
    elif tc == 'classic':
        increment = 10

    elapsed = secs_since if secs_since and secs_since > 0 else 0

    if current_player == 'white':
        white_time = max(0, white_time - elapsed + increment)
        new_white_time = white_time
        new_black_time = black_time
    else:
        black_time = max(0, black_time - elapsed + increment)
        new_white_time = white_time
        new_black_time = black_time

    new_move_hist = (move_hist + ',' + move) if move_hist else move
    next_player = 'black' if current_player == 'white' else 'white'
    new_move_number = db_move_number + 1

    new_status = 'playing'
    winner_val = 'NULL'
    end_reason_val = 'NULL'

    if game_status in ('checkmate', 'stalemate', 'finished'):
        new_status = 'finished'
        if game_status == 'checkmate' and winner_id:
            winner_val = "'%s'" % winner_id.replace("'", "''")
            end_reason_val = "'checkmate'"
        elif game_status == 'stalemate':
            end_reason_val = "'stalemate'"
        else:
            end_reason_val = "'%s'" % game_status.replace("'", "''")

    cur.execute(
        """UPDATE online_games SET
            current_player = '%s',
            white_time = %d,
            black_time = %d,
            move_history = '%s',
            board_state = '%s',
            status = '%s',
            winner = %s,
            end_reason = %s,
            move_number = %d,
            last_move_at = NOW(),
            updated_at = NOW()
        WHERE id = %d AND move_number = %d"""
        % (next_player, new_white_time, new_black_time,
           new_move_hist.replace("'", "''"),
           board_state.replace("'", "''") if board_state else 'initial',
           new_status, winner_val, end_reason_val, new_move_number, g_id, db_move_number)
    )

    rows_updated = cur.rowcount
    conn.commit()
    cur.close()
    conn.close()

    if rows_updated == 0:
        return {'statusCode': 409, 'headers': headers, 'body': json.dumps({'error': 'concurrent move detected, retry'})}

    return {'statusCode': 200, 'headers': headers, 'body': json.dumps({
        'status': new_status,
        'current_player': next_player,
        'move_number': new_move_number,
        'white_time': new_white_time,
        'black_time': new_black_time
    })}