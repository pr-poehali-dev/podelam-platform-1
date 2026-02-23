import json
import os
import hashlib
import psycopg2
import psycopg2.extras
from datetime import datetime

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 'public')

def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def handler(event: dict, context) -> dict:
    """Регистрация и вход пользователей"""
    cors = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    }

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors, 'body': ''}

    body = json.loads(event.get('body') or '{}')
    action = body.get('action')

    conn = get_conn()
    cur = conn.cursor()
    S = SCHEMA

    if action == 'register':
        name = body.get('name', '').strip()
        email = body.get('email', '').strip().lower()
        password = body.get('password', '')

        if not name or not email or not password:
            conn.close()
            return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'Заполните все поля'})}

        cur.execute(f'SELECT id FROM "{S}".users WHERE email = %s', (email,))
        if cur.fetchone():
            conn.close()
            return {'statusCode': 409, 'headers': cors, 'body': json.dumps({'error': 'Email уже зарегистрирован'})}

        pw_hash = hash_password(password)
        cur.execute(
            f'INSERT INTO "{S}".users (name, email, password_hash) VALUES (%s, %s, %s) RETURNING id, name, email, created_at',
            (name, email, pw_hash)
        )
        row = cur.fetchone()
        conn.commit()
        conn.close()
        return {
            'statusCode': 200,
            'headers': cors,
            'body': json.dumps({
                'user': {'id': row[0], 'name': row[1], 'email': row[2], 'created_at': str(row[3])},
                'test_results': [],
                'balance': 0,
                'subscription_expires': None,
                'paid_tools': [],
            })
        }

    elif action == 'login':
        email = body.get('email', '').strip().lower()
        password = body.get('password', '')
        pw_hash = hash_password(password)

        cur.execute(f'SELECT id, name, email, balance, subscription_expires, paid_tools FROM "{S}".users WHERE email = %s AND password_hash = %s', (email, pw_hash))
        row = cur.fetchone()
        if not row:
            conn.close()
            return {'statusCode': 401, 'headers': cors, 'body': json.dumps({'error': 'Неверный email или пароль'})}

        user_id = row[0]
        balance = row[3] or 0
        sub_expires = str(row[4]) if row[4] else None
        paid_tools = [t.strip() for t in (row[5] or '').split(',') if t.strip()]

        cur.execute(f'UPDATE "{S}".users SET last_login = %s WHERE id = %s', (datetime.now(), user_id))
        conn.commit()

        cur.execute(
            f'SELECT test_type, score, result_data, created_at FROM "{S}".test_results WHERE user_id = %s ORDER BY created_at DESC',
            (user_id,)
        )
        results = []
        for r in cur.fetchall():
            results.append({
                'test_type': r[0],
                'score': r[1],
                'result_data': r[2] if isinstance(r[2], dict) else json.loads(r[2]) if r[2] else {},
                'created_at': str(r[3]) if r[3] else None,
            })

        conn.close()
        return {
            'statusCode': 200,
            'headers': cors,
            'body': json.dumps({
                'user': {'id': user_id, 'name': row[1], 'email': row[2]},
                'test_results': results,
                'balance': balance,
                'subscription_expires': sub_expires,
                'paid_tools': paid_tools,
            })
        }

    elif action == 'save_test_result':
        user_id = body.get('userId')
        test_type = body.get('testType', '')
        result_data = body.get('resultData', {})
        score = result_data.get('topSegScore', 0) if isinstance(result_data, dict) else 0

        if not user_id:
            conn.close()
            return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'userId required'})}

        cur.execute(
            f'DELETE FROM "{S}".test_results WHERE user_id = %s AND test_type = %s',
            (user_id, test_type)
        )
        cur.execute(
            f'INSERT INTO "{S}".test_results (user_id, test_type, score, result_data) VALUES (%s, %s, %s, %s)',
            (user_id, test_type, score, json.dumps(result_data, ensure_ascii=False))
        )
        conn.commit()
        conn.close()
        return {'statusCode': 200, 'headers': cors, 'body': json.dumps({'ok': True})}

    conn.close()
    return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'Неизвестное действие'})}
