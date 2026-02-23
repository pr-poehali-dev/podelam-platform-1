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
            'body': json.dumps({'user': {'id': row[0], 'name': row[1], 'email': row[2], 'created_at': str(row[3])}})
        }

    elif action == 'login':
        email = body.get('email', '').strip().lower()
        password = body.get('password', '')
        pw_hash = hash_password(password)

        cur.execute(f'SELECT id, name, email FROM "{S}".users WHERE email = %s AND password_hash = %s', (email, pw_hash))
        row = cur.fetchone()
        if not row:
            conn.close()
            return {'statusCode': 401, 'headers': cors, 'body': json.dumps({'error': 'Неверный email или пароль'})}

        cur.execute(f'UPDATE "{S}".users SET last_login = %s WHERE id = %s', (datetime.now(), row[0]))
        conn.commit()
        conn.close()
        return {
            'statusCode': 200,
            'headers': cors,
            'body': json.dumps({'user': {'id': row[0], 'name': row[1], 'email': row[2]}})
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