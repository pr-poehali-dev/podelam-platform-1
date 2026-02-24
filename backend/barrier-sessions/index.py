import json
import os
import psycopg2

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 'public')

def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def handler(event: dict, context) -> dict:
    """Сохранение и загрузка сессий барьер-бота для синхронизации между устройствами"""
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

    if not user_id:
        return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'userId required'})}

    conn = get_conn()
    cur = conn.cursor()
    S = SCHEMA

    if action == 'load':
        cur.execute(
            f'SELECT id, session_data, created_at FROM "{S}".barrier_sessions WHERE user_id = %s ORDER BY created_at ASC',
            (user_id,)
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
            f'INSERT INTO "{S}".barrier_sessions (user_id, session_data) VALUES (%s, %s) RETURNING id',
            (user_id, json.dumps(session_data, ensure_ascii=False))
        )
        new_id = cur.fetchone()[0]
        conn.commit()
        conn.close()
        return {'statusCode': 200, 'headers': cors, 'body': json.dumps({'ok': True, 'id': new_id})}

    elif action == 'sync':
        local_sessions = body.get('sessions', [])

        cur.execute(
            f'SELECT id, session_data, created_at FROM "{S}".barrier_sessions WHERE user_id = %s ORDER BY created_at ASC',
            (user_id,)
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
            fp = f"{sd.get('date')}|{sd.get('context')}|{sd.get('profile')}|{sd.get('mainWeakness')}"
            server_fingerprints.add(fp)

        new_count = 0
        for s in local_sessions:
            if s.get('_server_id') and s['_server_id'] in server_ids:
                continue
            clean = {k: v for k, v in s.items() if not k.startswith('_')}
            fp = f"{clean.get('date')}|{clean.get('context')}|{clean.get('profile')}|{clean.get('mainWeakness')}"
            if fp in server_fingerprints:
                continue
            cur.execute(
                f'INSERT INTO "{S}".barrier_sessions (user_id, session_data) VALUES (%s, %s) RETURNING id',
                (user_id, json.dumps(clean, ensure_ascii=False))
            )
            new_id = cur.fetchone()[0]
            clean['_server_id'] = new_id
            server_sessions.append(clean)
            new_count += 1

        if new_count > 0:
            conn.commit()

        conn.close()
        return {'statusCode': 200, 'headers': cors, 'body': json.dumps({'sessions': server_sessions, 'synced': new_count}, ensure_ascii=False)}

    elif action == 'delete':
        session_id = body.get('sessionId')
        if session_id:
            cur.execute(
                f'DELETE FROM "{S}".barrier_sessions WHERE id = %s AND user_id = %s',
                (session_id, user_id)
            )
        conn.commit()
        conn.close()
        return {'statusCode': 200, 'headers': cors, 'body': json.dumps({'ok': True})}

    conn.close()
    return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'Unknown action'})}