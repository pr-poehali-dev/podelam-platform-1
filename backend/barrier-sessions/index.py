import json
import os
import psycopg2

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 'public')

TOOL_LIMITS = {
    'diary': 0,
    'barrier-bot': 6,
    'psych-bot': 6,
    'career-test': 6,
    'income-bot': 6,
    'plan-bot': 6,
    'progress': 6,
}

def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def make_fingerprint(sd):
    date = sd.get('date', '')
    keys = sorted([k for k in sd.keys() if not k.startswith('_')])
    parts = [date]
    for k in keys[:4]:
        v = sd.get(k, '')
        if isinstance(v, list):
            v = ','.join(str(x) for x in v[:3])
        parts.append(str(v)[:50])
    return '|'.join(parts)

def handler(event: dict, context) -> dict:
    """Универсальная синхронизация результатов всех инструментов между устройствами"""
    cors = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    }

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors, 'body': ''}

    body = json.loads(event.get('body') or '{}')
    action = body.get('action')
    user_id = body.get('userId')
    tool_type = body.get('toolType', '')

    if not user_id:
        return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'userId required'})}
    if not tool_type:
        return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'toolType required'})}

    limit = TOOL_LIMITS.get(tool_type, 6)
    conn = get_conn()
    cur = conn.cursor()
    S = SCHEMA

    if action == 'load':
        cur.execute(
            f'SELECT id, session_data, created_at FROM "{S}".tool_sessions WHERE user_id = %s AND tool_type = %s ORDER BY created_at ASC',
            (user_id, tool_type)
        )
        rows = cur.fetchall()
        sessions = []
        for r in rows:
            sd = r[1] if isinstance(r[1], dict) else json.loads(r[1])
            sd['_server_id'] = r[0]
            sessions.append(sd)
        conn.close()
        return {'statusCode': 200, 'headers': cors, 'body': json.dumps({'sessions': sessions}, ensure_ascii=False)}

    elif action == 'save':
        session_data = body.get('sessionData')
        if not session_data:
            conn.close()
            return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'sessionData required'})}

        cur.execute(
            f'INSERT INTO "{S}".tool_sessions (user_id, tool_type, session_data) VALUES (%s, %s, %s) RETURNING id',
            (user_id, tool_type, json.dumps(session_data, ensure_ascii=False))
        )
        new_id = cur.fetchone()[0]

        if limit > 0:
            cur.execute(
                f'SELECT id FROM "{S}".tool_sessions WHERE user_id = %s AND tool_type = %s ORDER BY created_at DESC OFFSET %s',
                (user_id, tool_type, limit)
            )
            old_ids = [r[0] for r in cur.fetchall()]
            if old_ids:
                cur.execute(
                    f'DELETE FROM "{S}".tool_sessions WHERE id IN ({",".join(str(i) for i in old_ids)})'
                )

        conn.commit()
        conn.close()
        return {'statusCode': 200, 'headers': cors, 'body': json.dumps({'ok': True, 'id': new_id})}

    elif action == 'sync':
        local_sessions = body.get('sessions', [])

        cur.execute(
            f'SELECT id, session_data, created_at FROM "{S}".tool_sessions WHERE user_id = %s AND tool_type = %s ORDER BY created_at ASC',
            (user_id, tool_type)
        )
        server_rows = cur.fetchall()
        server_ids = set()
        server_fingerprints = set()
        server_sessions = []
        for r in server_rows:
            sd = r[1] if isinstance(r[1], dict) else json.loads(r[1])
            sd['_server_id'] = r[0]
            server_sessions.append(sd)
            server_ids.add(r[0])
            server_fingerprints.add(make_fingerprint(sd))

        new_count = 0
        for s in local_sessions:
            if s.get('_server_id') and s['_server_id'] in server_ids:
                continue
            clean = {k: v for k, v in s.items() if not k.startswith('_')}
            if make_fingerprint(clean) in server_fingerprints:
                continue
            cur.execute(
                f'INSERT INTO "{S}".tool_sessions (user_id, tool_type, session_data) VALUES (%s, %s, %s) RETURNING id',
                (user_id, tool_type, json.dumps(clean, ensure_ascii=False))
            )
            new_id = cur.fetchone()[0]
            clean['_server_id'] = new_id
            server_sessions.append(clean)
            new_count += 1

        if limit > 0 and len(server_sessions) > limit:
            to_keep = server_sessions[-limit:]
            to_remove = server_sessions[:-limit]
            remove_ids = [s['_server_id'] for s in to_remove if s.get('_server_id')]
            if remove_ids:
                cur.execute(
                    f'DELETE FROM "{S}".tool_sessions WHERE id IN ({",".join(str(i) for i in remove_ids)})'
                )
            server_sessions = to_keep

        if new_count > 0:
            conn.commit()

        conn.close()
        return {'statusCode': 200, 'headers': cors, 'body': json.dumps({'sessions': server_sessions, 'synced': new_count}, ensure_ascii=False)}

    conn.close()
    return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'Unknown action'})}
