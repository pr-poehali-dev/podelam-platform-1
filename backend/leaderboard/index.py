import json
import os
import psycopg2


def handler(event, context):
    """Рейтинг игроков: топ по стране, региону и городу"""
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }

    headers = {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'}
    dsn = os.environ['DATABASE_URL']
    schema = os.environ.get('MAIN_DB_SCHEMA', 'public')
    conn = psycopg2.connect(dsn)
    cur = conn.cursor()

    qs = event.get('queryStringParameters') or {}
    city = qs.get('city', '')
    region = qs.get('region', '')
    limit = min(int(qs.get('limit', '10')), 50)

    def fetch_top(where_clause=''):
        sql = "SELECT username, rating, city, avatar FROM {s}.users".format(s=schema)
        if where_clause:
            sql += " WHERE " + where_clause
        sql += " ORDER BY rating DESC LIMIT %d" % limit
        cur.execute(sql)
        rows = cur.fetchall()
        result = []
        for i, row in enumerate(rows):
            avatar = row[3] or ''
            if not avatar:
                seed = row[0].replace(' ', '')
                avatar = 'https://api.dicebear.com/7.x/avataaars/svg?seed=%s' % seed
            result.append({
                'rank': i + 1,
                'name': row[0],
                'rating': row[1],
                'city': row[2] or '',
                'avatar': avatar
            })
        return result

    top_country = fetch_top()

    top_region = []
    if region:
        top_region = fetch_top("city IS NOT NULL")

    top_city = []
    if city:
        safe_city = city.replace("'", "''")
        top_city = fetch_top("city = '%s'" % safe_city)

    cur.close()
    conn.close()

    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({
            'country': top_country,
            'region': top_region,
            'city': top_city
        })
    }