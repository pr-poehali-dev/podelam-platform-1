import json
import os
import psycopg2
from datetime import datetime, timedelta

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 'public')
HEARTBEAT_TIMEOUT_SEC = 90

PLANS = {
    'basic': {'price': 990, 'days': 30, 'all': False, 'sessions': 4},
    'advanced': {'price': 2490, 'days': 90, 'all': True, 'sessions': 0},
    'yearly': {'price': 6990, 'days': 365, 'all': True, 'sessions': 0},
}

def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def handler(event: dict, context) -> dict:
    """Управление подписками на тренажеры, пакетный лимит сессий и блокировка одновременных сессий"""
    cors = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token, X-Session-Id',
        'Access-Control-Max-Age': '86400',
    }

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors, 'body': ''}

    body = json.loads(event.get('body') or '{}')
    action = body.get('action')
    email = (body.get('email') or '').strip().lower()

    if not email:
        return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'email required'})}

    conn = get_conn()
    try:
        cur = conn.cursor()
        S = SCHEMA

        cur.execute(f'SELECT id FROM "{S}".users WHERE email = %s', (email,))
        row = cur.fetchone()
        if not row:
            return {'statusCode': 404, 'headers': cors, 'body': json.dumps({'error': 'user not found'})}
        user_id = row[0]

        if action == 'get_subscription':
            sub = _get_sub(cur, S, user_id)
            return {'statusCode': 200, 'headers': cors, 'body': json.dumps({'subscription': sub})}

        elif action == 'activate':
            plan_id = body.get('plan_id', '')
            trainer_id = body.get('trainer_id')
            plan = PLANS.get(plan_id)
            if not plan:
                return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'invalid plan'})}

            now = datetime.now()
            expires_at = now + timedelta(days=plan['days'])
            sessions_total = plan['sessions']
            cur.execute(
                f'''INSERT INTO "{S}".trainer_subscriptions
                    (user_id, plan_id, trainer_id, all_trainers, expires_at, started_at, sessions_total, sessions_used)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, 0)
                    ON CONFLICT (user_id) DO UPDATE SET
                        plan_id = EXCLUDED.plan_id,
                        trainer_id = EXCLUDED.trainer_id,
                        all_trainers = EXCLUDED.all_trainers,
                        expires_at = EXCLUDED.expires_at,
                        started_at = EXCLUDED.started_at,
                        sessions_total = EXCLUDED.sessions_total,
                        sessions_used = 0''',
                (user_id, plan_id, trainer_id if not plan['all'] else None, plan['all'], expires_at, now, sessions_total)
            )
            conn.commit()

            sub = _get_sub(cur, S, user_id)
            return {'statusCode': 200, 'headers': cors, 'body': json.dumps({'ok': True, 'subscription': sub})}

        elif action == 'get_limit':
            sub = _get_sub(cur, S, user_id)
            if not sub or sub.get('all_trainers'):
                return {'statusCode': 200, 'headers': cors, 'body': json.dumps({
                    'limited': False, 'used': 0, 'total': 0, 'remaining': 999
                })}
            return {'statusCode': 200, 'headers': cors, 'body': json.dumps({
                'limited': sub['sessions_used'] >= sub['sessions_total'],
                'used': sub['sessions_used'],
                'total': sub['sessions_total'],
                'remaining': max(0, sub['sessions_total'] - sub['sessions_used']),
            })}

        elif action == 'session_start':
            trainer_id = body.get('trainer_id', '')
            device_id = body.get('device_id', '')
            if not trainer_id or not device_id:
                return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'trainer_id and device_id required'})}

            sub = _get_sub(cur, S, user_id)
            if not sub:
                return {'statusCode': 403, 'headers': cors, 'body': json.dumps({'error': 'no_subscription'})}

            if not sub.get('all_trainers') and sub['sessions_used'] >= sub['sessions_total']:
                return {'statusCode': 403, 'headers': cors, 'body': json.dumps({'error': 'session_limit_reached', 'used': sub['sessions_used'], 'total': sub['sessions_total']})}

            cutoff = datetime.now() - timedelta(seconds=HEARTBEAT_TIMEOUT_SEC)
            cur.execute(
                f'SELECT device_id, trainer_id, last_heartbeat FROM "{S}".trainer_active_sessions WHERE user_id = %s',
                (user_id,)
            )
            active = cur.fetchone()

            if active and active[0] != device_id and active[2] > cutoff:
                return {
                    'statusCode': 409,
                    'headers': cors,
                    'body': json.dumps({
                        'error': 'session_active_other_device',
                        'trainer_id': active[1],
                        'last_heartbeat': str(active[2]),
                    })
                }

            cur.execute(
                f'''INSERT INTO "{S}".trainer_active_sessions (user_id, trainer_id, device_id, last_heartbeat, started_at)
                    VALUES (%s, %s, %s, now(), now())
                    ON CONFLICT (user_id) DO UPDATE SET
                        trainer_id = EXCLUDED.trainer_id,
                        device_id = EXCLUDED.device_id,
                        last_heartbeat = now(),
                        started_at = now()''',
                (user_id, trainer_id, device_id)
            )
            conn.commit()
            return {'statusCode': 200, 'headers': cors, 'body': json.dumps({'ok': True})}

        elif action == 'heartbeat':
            device_id = body.get('device_id', '')
            if not device_id:
                return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'device_id required'})}

            cutoff = datetime.now() - timedelta(seconds=HEARTBEAT_TIMEOUT_SEC)
            cur.execute(
                f'SELECT device_id, trainer_id, last_heartbeat FROM "{S}".trainer_active_sessions WHERE user_id = %s',
                (user_id,)
            )
            active = cur.fetchone()

            if active and active[0] != device_id and active[2] > cutoff:
                return {
                    'statusCode': 409,
                    'headers': cors,
                    'body': json.dumps({
                        'error': 'session_active_other_device',
                        'trainer_id': active[1],
                    })
                }

            cur.execute(
                f'''UPDATE "{S}".trainer_active_sessions SET last_heartbeat = now()
                    WHERE user_id = %s AND device_id = %s''',
                (user_id, device_id)
            )
            conn.commit()
            return {'statusCode': 200, 'headers': cors, 'body': json.dumps({'ok': True})}

        elif action == 'session_end':
            device_id = body.get('device_id', '')
            cur.execute(
                f'DELETE FROM "{S}".trainer_active_sessions WHERE user_id = %s AND device_id = %s',
                (user_id, device_id)
            )
            conn.commit()
            return {'statusCode': 200, 'headers': cors, 'body': json.dumps({'ok': True})}

        elif action == 'check_device':
            device_id = body.get('device_id', '')
            if not device_id:
                return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'device_id required'})}

            cutoff = datetime.now() - timedelta(seconds=HEARTBEAT_TIMEOUT_SEC)
            cur.execute(
                f'SELECT device_id, trainer_id, last_heartbeat FROM "{S}".trainer_active_sessions WHERE user_id = %s',
                (user_id,)
            )
            active = cur.fetchone()

            if active and active[0] != device_id and active[2] > cutoff:
                return {
                    'statusCode': 200,
                    'headers': cors,
                    'body': json.dumps({
                        'blocked': True,
                        'trainer_id': active[1],
                    })
                }
            return {'statusCode': 200, 'headers': cors, 'body': json.dumps({'blocked': False})}

        elif action == 'save_session':
            trainer_id = body.get('trainer_id', '')
            session_id = body.get('session_id', '')
            started_at = body.get('started_at')
            completed_at = body.get('completed_at')
            scores = body.get('scores', {})
            result = body.get('result')
            answers = body.get('answers', {})

            if not trainer_id or not session_id:
                return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'trainer_id and session_id required'})}

            cur.execute(
                f'SELECT id, completed_at FROM "{S}".trainer_sessions WHERE user_id = %s AND session_id = %s',
                (user_id, session_id)
            )
            existing = cur.fetchone()
            was_completed = existing and existing[1] is not None

            cur.execute(
                f'''INSERT INTO "{S}".trainer_sessions (user_id, trainer_id, session_id, started_at, completed_at, scores, result, answers)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (user_id, session_id) DO UPDATE SET
                        completed_at = EXCLUDED.completed_at,
                        scores = EXCLUDED.scores,
                        result = EXCLUDED.result,
                        answers = EXCLUDED.answers''',
                (user_id, trainer_id, session_id,
                 started_at or datetime.now().isoformat(),
                 completed_at,
                 json.dumps(scores),
                 json.dumps(result) if result else None,
                 json.dumps(answers))
            )

            if completed_at and not was_completed:
                cur.execute(
                    f'''UPDATE "{S}".trainer_subscriptions
                        SET sessions_used = sessions_used + 1
                        WHERE user_id = %s AND NOT all_trainers''',
                    (user_id,)
                )

            conn.commit()

            cur.execute(
                f'SELECT sessions_total, sessions_used FROM "{S}".trainer_subscriptions WHERE user_id = %s',
                (user_id,)
            )
            sub_row = cur.fetchone()
            sessions_used = sub_row[1] if sub_row else 0
            sessions_total = sub_row[0] if sub_row else 4

            return {'statusCode': 200, 'headers': cors, 'body': json.dumps({
                'ok': True,
                'sessions_used': sessions_used,
                'sessions_total': sessions_total,
            })}

        elif action == 'get_sessions':
            trainer_id = body.get('trainer_id')
            if trainer_id:
                cur.execute(
                    f'''SELECT session_id, trainer_id, started_at, completed_at, scores, result
                        FROM "{S}".trainer_sessions
                        WHERE user_id = %s AND trainer_id = %s
                        ORDER BY started_at DESC LIMIT 50''',
                    (user_id, trainer_id)
                )
            else:
                cur.execute(
                    f'''SELECT session_id, trainer_id, started_at, completed_at, scores, result
                        FROM "{S}".trainer_sessions
                        WHERE user_id = %s
                        ORDER BY started_at DESC LIMIT 100''',
                    (user_id,)
                )
            rows = cur.fetchall()
            sessions = []
            for r in rows:
                s = {
                    'session_id': r[0],
                    'trainer_id': r[1],
                    'started_at': str(r[2]) if r[2] else None,
                    'completed_at': str(r[3]) if r[3] else None,
                    'scores': r[4] if r[4] else {},
                    'result': r[5] if r[5] else None,
                }
                sessions.append(s)
            return {'statusCode': 200, 'headers': cors, 'body': json.dumps({'sessions': sessions})}

        elif action == 'get_session_count':
            trainer_id = body.get('trainer_id', '')
            if not trainer_id:
                return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'trainer_id required'})}

            cur.execute(
                f'SELECT sessions_used, sessions_total FROM "{S}".trainer_subscriptions WHERE user_id = %s',
                (user_id,)
            )
            sub_row = cur.fetchone()
            if sub_row:
                return {'statusCode': 200, 'headers': cors, 'body': json.dumps({
                    'count': sub_row[0],
                    'total': sub_row[1],
                    'trainer_id': trainer_id,
                })}
            else:
                cur.execute(
                    f'''SELECT COUNT(*) FROM "{S}".trainer_sessions
                        WHERE user_id = %s AND trainer_id = %s AND completed_at IS NOT NULL''',
                    (user_id, trainer_id)
                )
                count = cur.fetchone()[0]
                return {'statusCode': 200, 'headers': cors, 'body': json.dumps({'count': count, 'trainer_id': trainer_id})}

        return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'unknown action'})}

    finally:
        conn.close()


def _get_sub(cur, schema, user_id):
    cur.execute(
        f'''SELECT plan_id, trainer_id, all_trainers, expires_at, started_at, sessions_total, sessions_used
            FROM "{schema}".trainer_subscriptions WHERE user_id = %s''',
        (user_id,)
    )
    row = cur.fetchone()
    if not row:
        return None
    expires = row[3]
    if expires and expires < datetime.now():
        return None
    return {
        'plan_id': row[0],
        'trainer_id': row[1],
        'all_trainers': row[2],
        'expires_at': str(expires) if expires else None,
        'started_at': str(row[4]) if row[4] else None,
        'sessions_total': row[5] or 4,
        'sessions_used': row[6] or 0,
    }
