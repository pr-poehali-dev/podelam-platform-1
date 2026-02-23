import json
import os
import psycopg2

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 'public')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'admin2024')

def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def handler(event: dict, context) -> dict:
    """Статистика для админки: клиенты, платежи, общая сумма"""
    cors = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
    }

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors, 'body': ''}

    headers = event.get('headers') or {}
    token = headers.get('X-Admin-Token') or headers.get('x-admin-token', '')
    if token != ADMIN_PASSWORD:
        return {'statusCode': 403, 'headers': cors, 'body': json.dumps({'error': 'Доступ запрещён'})}

    if event.get('httpMethod') == 'DELETE':
        body = json.loads(event.get('body') or '{}')
        user_id = body.get('user_id')
        user_email = body.get('user_email')
        if not user_id or not user_email:
            return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'user_id и user_email обязательны'})}
        conn = get_conn()
        cur = conn.cursor()
        S = SCHEMA
        cur.execute(f'DELETE FROM "{S}".test_results WHERE user_id = %s', (user_id,))
        cur.execute(f'DELETE FROM "{S}".payments WHERE user_email = %s', (user_email,))
        cur.execute(f'DELETE FROM "{S}".users WHERE id = %s', (user_id,))
        conn.commit()
        conn.close()
        return {'statusCode': 200, 'headers': cors, 'body': json.dumps({'ok': True})}

    conn = get_conn()
    cur = conn.cursor()
    S = SCHEMA

    cur.execute(f'SELECT COUNT(*) FROM "{S}".users')
    total_users = cur.fetchone()[0]

    cur.execute(f"SELECT COUNT(*) FROM \"{S}\".payments WHERE status = 'paid'")
    total_payments = cur.fetchone()[0]

    cur.execute(f"SELECT COALESCE(SUM(amount), 0) FROM \"{S}\".payments WHERE status = 'paid'")
    total_revenue = cur.fetchone()[0]

    cur.execute(f"SELECT COUNT(*) FROM \"{S}\".payments WHERE status = 'paid' AND created_at >= NOW() - INTERVAL '30 days'")
    payments_month = cur.fetchone()[0]

    cur.execute(f"SELECT COALESCE(SUM(amount), 0) FROM \"{S}\".payments WHERE status = 'paid' AND created_at >= NOW() - INTERVAL '30 days'")
    revenue_month = cur.fetchone()[0]

    cur.execute(f"""
        SELECT u.id, u.name, u.email, u.created_at, u.last_login,
               COALESCE(SUM(CASE WHEN p.status = 'paid' THEN p.amount ELSE 0 END), 0) as total_paid,
               COUNT(CASE WHEN p.status = 'paid' THEN 1 END) as payments_count,
               u.balance, u.subscription_expires, u.paid_tools
        FROM "{S}".users u
        LEFT JOIN "{S}".payments p ON p.user_email = u.email
        GROUP BY u.id, u.name, u.email, u.created_at, u.last_login, u.balance, u.subscription_expires, u.paid_tools
        ORDER BY u.created_at DESC
        LIMIT 100
    """)
    cols = ['id', 'name', 'email', 'created_at', 'last_login', 'total_paid', 'payments_count', 'balance', 'subscription_expires', 'paid_tools']
    clients = []
    for row in cur.fetchall():
        clients.append({cols[i]: (str(row[i]) if row[i] is not None else None) for i in range(len(cols))})

    cur.execute(f"""
        SELECT p.id, p.user_name, p.user_email, p.amount, p.tariff, p.status, p.created_at
        FROM "{S}".payments p
        ORDER BY p.created_at DESC
        LIMIT 100
    """)
    pcols = ['id', 'user_name', 'user_email', 'amount', 'tariff', 'status', 'created_at']
    payments = []
    for row in cur.fetchall():
        payments.append({pcols[i]: (str(row[i]) if row[i] is not None else None) for i in range(len(pcols))})

    conn.close()

    return {
        'statusCode': 200,
        'headers': cors,
        'body': json.dumps({
            'stats': {
                'total_users': total_users,
                'total_payments': total_payments,
                'total_revenue': total_revenue,
                'payments_month': payments_month,
                'revenue_month': revenue_month,
            },
            'clients': clients,
            'payments': payments,
        })
    }