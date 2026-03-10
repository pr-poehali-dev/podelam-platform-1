import json
import os
import psycopg2
from datetime import datetime, timezone, timedelta

MSK = timezone(timedelta(hours=3))


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
    """Ежедневное снижение рейтинга всех игроков. Срабатывает раз в сутки после 00:00 МСК."""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token, X-Session-Id', 'Access-Control-Max-Age': '86400'}, 'body': ''}

    headers = {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'}

    if event.get('httpMethod') != 'POST':
        return {'statusCode': 405, 'headers': headers, 'body': json.dumps({'error': 'Method not allowed'})}

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    client_ip = get_client_ip(event)
    if check_rate_limit(cur, conn, client_ip, 'apply-daily-decay', 5, 60):
        cur.close()
        conn.close()
        return {'statusCode': 429, 'headers': headers, 'body': json.dumps({'error': 'Too many requests'})}
    cur.close()
    conn.close()

    now_msk = datetime.now(MSK)
    today_msk = now_msk.strftime('%Y-%m-%d')

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()

    cur.execute("SELECT key, value FROM rating_settings WHERE key IN ('daily_decay', 'min_rating', 'last_decay_date')")
    settings = {r[0]: r[1] for r in cur.fetchall()}

    last_decay_date = settings.get('last_decay_date', '2000-01-01')

    if last_decay_date >= today_msk:
        cur.close()
        conn.close()
        return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'applied': False, 'reason': 'already_applied_today', 'last_decay_date': last_decay_date, 'today': today_msk})}

    decay = abs(int(settings.get('daily_decay', '1')))
    min_rating = int(settings.get('min_rating', '500'))

    if decay == 0:
        cur.execute("UPDATE rating_settings SET value = '%s', updated_at = NOW() WHERE key = 'last_decay_date'" % today_msk)
        conn.commit()
        cur.close()
        conn.close()
        return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'applied': True, 'affected': 0, 'decay': 0})}

    cur.execute(
        """UPDATE users SET rating = GREATEST(rating - %d, %d), updated_at = NOW()
        WHERE rating > %d
          AND id NOT IN (
            SELECT DISTINCT user_id FROM game_history
            WHERE created_at >= TIMESTAMP '%s 00:00:00' AND created_at < TIMESTAMP '%s 00:00:00' + INTERVAL '1 day'
          )
        RETURNING id"""
        % (decay, min_rating, min_rating, today_msk, today_msk)
    )
    affected = len(cur.fetchall())

    cur.execute("UPDATE rating_settings SET value = '%s', updated_at = NOW() WHERE key = 'last_decay_date'" % today_msk)

    conn.commit()
    cur.close()
    conn.close()

    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({
            'applied': True,
            'affected': affected,
            'decay': decay,
            'min_rating': min_rating,
            'date': today_msk
        })
    }