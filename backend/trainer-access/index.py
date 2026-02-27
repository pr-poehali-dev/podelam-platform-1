import json
import os
import psycopg2
from datetime import datetime, timedelta

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 'public')
HEARTBEAT_TIMEOUT_SEC = 90

PLANS = {
    'basic': {'price': 990, 'days': 30, 'all': False},
    'advanced': {'price': 2490, 'days': 90, 'all': True},
    'yearly': {'price': 6990, 'days': 365, 'all': True},
}

def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def handler(event: dict, context) -> dict:
    """Управление подписками на тренажёры и блокировка одновременных сессий"""
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

            expires_at = datetime.now() + timedelta(days=plan['days'])
            cur.execute(
                f'''INSERT INTO "{S}".trainer_subscriptions (user_id, plan_id, trainer_id, all_trainers, expires_at)
                    VALUES (%s, %s, %s, %s, %s)
                    ON CONFLICT (user_id) DO UPDATE SET
                        plan_id = EXCLUDED.plan_id,
                        trainer_id = EXCLUDED.trainer_id,
                        all_trainers = EXCLUDED.all_trainers,
                        expires_at = EXCLUDED.expires_at''',
                (user_id, plan_id, trainer_id if not plan['all'] else None, plan['all'], expires_at)
            )
            conn.commit()

            sub = _get_sub(cur, S, user_id)
            return {'statusCode': 200, 'headers': cors, 'body': json.dumps({'ok': True, 'subscription': sub})}

        elif action == 'session_start':
            trainer_id = body.get('trainer_id', '')
            device_id = body.get('device_id', '')
            if not trainer_id or not device_id:
                return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'trainer_id and device_id required'})}

            sub = _get_sub(cur, S, user_id)
            if not sub:
                return {'statusCode': 403, 'headers': cors, 'body': json.dumps({'error': 'no_subscription'})}

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

        return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'unknown action'})}

    finally:
        conn.close()


def _get_sub(cur, schema, user_id):
    cur.execute(
        f'SELECT plan_id, trainer_id, all_trainers, expires_at FROM "{schema}".trainer_subscriptions WHERE user_id = %s',
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
    }
