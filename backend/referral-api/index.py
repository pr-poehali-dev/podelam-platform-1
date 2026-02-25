import json
import os
import psycopg2
import psycopg2.extras

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 'public')

def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def handler(event: dict, context) -> dict:
    """Реферальная программа: получить данные, историю начислений, списать бонусы"""
    cors = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    }

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors, 'body': ''}

    params = event.get('queryStringParameters') or {}
    body = {}
    if event.get('body'):
        body = json.loads(event['body'])

    action = params.get('action') or body.get('action', '')
    user_email = (params.get('email') or body.get('email', '')).strip().lower()

    if not user_email:
        return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'email required'})}

    conn = get_conn()
    cur = conn.cursor()
    S = SCHEMA

    cur.execute(
        f'SELECT id, ref_code, ref_balance, partner_rules_accepted FROM "{S}".users WHERE email = %s',
        (user_email,)
    )
    user = cur.fetchone()
    if not user:
        conn.close()
        return {'statusCode': 404, 'headers': cors, 'body': json.dumps({'error': 'user not found'})}

    user_id, ref_code, ref_balance, rules_accepted = user

    if action == 'info':
        cur.execute(
            f'SELECT COUNT(*) FROM "{S}".users WHERE referred_by = %s',
            (user_id,)
        )
        referrals_count = cur.fetchone()[0]

        cur.execute(
            f'SELECT COALESCE(SUM(amount), 0) FROM "{S}".referral_transactions WHERE referrer_id = %s',
            (user_id,)
        )
        total_earned = cur.fetchone()[0]

        cur.execute(
            f'''SELECT rt.amount, rt.created_at, u.name, p.tariff
            FROM "{S}".referral_transactions rt
            JOIN "{S}".users u ON u.id = rt.referred_id
            JOIN "{S}".payments p ON p.id = rt.payment_id
            WHERE rt.referrer_id = %s
            ORDER BY rt.created_at DESC LIMIT 50''',
            (user_id,)
        )
        history = []
        for row in cur.fetchall():
            history.append({
                'amount': row[0],
                'date': str(row[1]),
                'referral_name': row[2],
                'tariff': row[3],
            })

        conn.close()
        return {
            'statusCode': 200,
            'headers': cors,
            'body': json.dumps({
                'ref_code': ref_code,
                'ref_balance': ref_balance,
                'referrals_count': referrals_count,
                'total_earned': total_earned,
                'history': history,
                'rules_accepted': bool(rules_accepted),
            })
        }

    elif action == 'accept_rules':
        cur.execute(
            f'UPDATE "{S}".users SET partner_rules_accepted = TRUE WHERE id = %s',
            (user_id,)
        )
        conn.commit()
        conn.close()
        return {
            'statusCode': 200,
            'headers': cors,
            'body': json.dumps({'ok': True, 'rules_accepted': True})
        }

    elif action == 'use_bonus':
        amount = body.get('amount', 0)
        if not amount or amount <= 0:
            conn.close()
            return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'invalid amount'})}

        if amount > ref_balance:
            conn.close()
            return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'insufficient ref_balance'})}

        cur.execute(
            f'UPDATE "{S}".users SET ref_balance = ref_balance - %s, balance = balance + %s WHERE id = %s RETURNING balance, ref_balance',
            (amount, amount, user_id)
        )
        new_balance, new_ref = cur.fetchone()
        conn.commit()
        conn.close()
        return {
            'statusCode': 200,
            'headers': cors,
            'body': json.dumps({
                'ok': True,
                'balance': new_balance,
                'ref_balance': new_ref,
            })
        }

    conn.close()
    return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'unknown action'})}