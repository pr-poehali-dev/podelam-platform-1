import json
import os
import re
import base64
import hashlib
import boto3
import psycopg2

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 'public')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'admin2024')

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
}

def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def ok(data, status=200):
    return {'statusCode': status, 'headers': CORS, 'body': json.dumps(data, default=str)}

def err(msg, status=400):
    return {'statusCode': status, 'headers': CORS, 'body': json.dumps({'error': msg})}

def is_admin(event):
    headers = event.get('headers') or {}
    token = headers.get('X-Admin-Token') or headers.get('x-admin-token', '')
    return token == ADMIN_PASSWORD

def slugify(text):
    text = text.lower().strip()
    tr = str.maketrans('абвгдежзийклмнопрстуфхцчшщъыьэюя', 'abvgdezhziyklmnoprstufhcchshshhyeyuya'.ljust(32, '_'))
    text = text.translate(tr)
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[-\s]+', '-', text).strip('-')
    return text[:100] or 'article'

def upload_cover(b64_data, content_type='image/jpeg'):
    s3 = boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
    )
    ext = 'jpg' if 'jpeg' in content_type else content_type.split('/')[-1]
    data = base64.b64decode(b64_data)
    file_hash = hashlib.md5(data).hexdigest()[:12]
    key = f'articles/covers/{file_hash}.{ext}'
    s3.put_object(Bucket='files', Key=key, Body=data, ContentType=content_type)
    cdn = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"
    return cdn

def handler(event: dict, context) -> dict:
    """API для управления статьями блога"""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    qs = event.get('queryStringParameters') or {}
    action = qs.get('action', 'list')

    if method == 'GET' and action == 'list':
        return handle_list(qs)
    if method == 'GET' and action == 'detail':
        return handle_detail(qs)
    if method == 'GET' and action == 'categories':
        return handle_categories()

    if not is_admin(event):
        return err('Доступ запрещён', 403)

    body = json.loads(event.get('body') or '{}')

    if method == 'GET' and action == 'admin_list':
        return handle_admin_list()
    if method == 'POST' and action == 'upload_cover':
        return handle_upload_cover(body)
    if method == 'POST' and action == 'save':
        return handle_save(body)
    if method == 'POST' and action == 'toggle_publish':
        return handle_toggle_publish(body)

    return err('Unknown action')

def handle_list(qs):
    page = int(qs.get('page', '1'))
    category = qs.get('category', '')
    limit = 6
    offset = (page - 1) * limit

    conn = get_conn()
    cur = conn.cursor()
    S = SCHEMA

    where = f'WHERE a.is_published = TRUE'
    params = []
    if category:
        where += f' AND c.slug = %s'
        params.append(category)

    cur.execute(f"""
        SELECT COUNT(*) FROM "{S}".articles a
        LEFT JOIN "{S}".categories c ON c.id = a.category_id
        {where}
    """, params)
    total = cur.fetchone()[0]

    cur.execute(f"""
        SELECT a.id, a.slug, a.title, a.summary, a.cover_url, a.reading_time,
               a.views_count, a.created_at, c.name as category_name, c.slug as category_slug
        FROM "{S}".articles a
        LEFT JOIN "{S}".categories c ON c.id = a.category_id
        {where}
        ORDER BY a.created_at DESC
        LIMIT %s OFFSET %s
    """, params + [limit, offset])

    cols = ['id', 'slug', 'title', 'summary', 'cover_url', 'reading_time', 'views_count', 'created_at', 'category_name', 'category_slug']
    articles = []
    for row in cur.fetchall():
        articles.append({cols[i]: row[i] for i in range(len(cols))})

    conn.close()
    return ok({'articles': articles, 'total': total, 'page': page, 'pages': max(1, -(-total // limit))})

def handle_detail(qs):
    slug = qs.get('slug', '')
    if not slug:
        return err('slug required')

    conn = get_conn()
    cur = conn.cursor()
    S = SCHEMA

    cur.execute(f"""
        SELECT a.id, a.slug, a.title, a.summary, a.cover_url, a.body, a.video_url,
               a.reading_time, a.views_count, a.created_at, a.updated_at,
               a.meta_title, a.meta_description, a.meta_keywords,
               c.name as category_name, c.slug as category_slug
        FROM "{S}".articles a
        LEFT JOIN "{S}".categories c ON c.id = a.category_id
        WHERE a.slug = %s AND a.is_published = TRUE
    """, [slug])
    row = cur.fetchone()
    if not row:
        conn.close()
        return err('Статья не найдена', 404)

    cols = ['id', 'slug', 'title', 'summary', 'cover_url', 'body', 'video_url',
            'reading_time', 'views_count', 'created_at', 'updated_at',
            'meta_title', 'meta_description', 'meta_keywords',
            'category_name', 'category_slug']
    article = {cols[i]: row[i] for i in range(len(cols))}

    cur.execute(f'UPDATE "{S}".articles SET views_count = views_count + 1 WHERE id = %s', [article['id']])
    conn.commit()
    conn.close()
    return ok(article)

def handle_categories():
    conn = get_conn()
    cur = conn.cursor()
    S = SCHEMA
    cur.execute(f"""
        SELECT c.id, c.slug, c.name,
               COUNT(a.id) FILTER (WHERE a.is_published = TRUE) as article_count
        FROM "{S}".categories c
        LEFT JOIN "{S}".articles a ON a.category_id = c.id
        GROUP BY c.id, c.slug, c.name, c.sort_order
        ORDER BY c.sort_order
    """)
    cats = []
    for row in cur.fetchall():
        cats.append({'id': row[0], 'slug': row[1], 'name': row[2], 'count': row[3]})
    conn.close()
    return ok({'categories': cats})

def handle_admin_list():
    conn = get_conn()
    cur = conn.cursor()
    S = SCHEMA
    cur.execute(f"""
        SELECT a.id, a.slug, a.title, a.summary, a.cover_url, a.is_published,
               a.views_count, a.created_at, a.updated_at,
               c.name as category_name
        FROM "{S}".articles a
        LEFT JOIN "{S}".categories c ON c.id = a.category_id
        ORDER BY a.created_at DESC
    """)
    cols = ['id', 'slug', 'title', 'summary', 'cover_url', 'is_published', 'views_count', 'created_at', 'updated_at', 'category_name']
    articles = []
    for row in cur.fetchall():
        articles.append({cols[i]: row[i] for i in range(len(cols))})
    conn.close()
    return ok({'articles': articles})

def handle_upload_cover(body):
    b64 = body.get('image', '')
    ct = body.get('content_type', 'image/jpeg')
    if not b64:
        return err('image required')
    url = upload_cover(b64, ct)
    return ok({'url': url})

def handle_save(body):
    article_id = body.get('id')
    title = (body.get('title') or '')[:120]
    summary = (body.get('summary') or '')[:300]
    article_body = body.get('body', '')
    slug = body.get('slug') or slugify(title)
    category_id = body.get('category_id')
    cover_url = body.get('cover_url')
    video_url = body.get('video_url')
    meta_title = (body.get('meta_title') or '')[:200]
    meta_description = (body.get('meta_description') or '')[:400]
    meta_keywords = (body.get('meta_keywords') or '')[:300]
    reading_time = body.get('reading_time', 3)
    is_published = body.get('is_published', False)

    if not title or not summary:
        return err('title and summary required')

    conn = get_conn()
    cur = conn.cursor()
    S = SCHEMA

    if article_id:
        cur.execute(f"""
            UPDATE "{S}".articles SET
                title=%s, summary=%s, body=%s, slug=%s, category_id=%s,
                cover_url=%s, video_url=%s, meta_title=%s, meta_description=%s,
                meta_keywords=%s, reading_time=%s, is_published=%s, updated_at=NOW()
            WHERE id=%s RETURNING id
        """, [title, summary, article_body, slug, category_id, cover_url, video_url,
              meta_title, meta_description, meta_keywords, reading_time, is_published, article_id])
    else:
        cur.execute(f"""
            INSERT INTO "{S}".articles
                (title, summary, body, slug, category_id, cover_url, video_url,
                 meta_title, meta_description, meta_keywords, reading_time, is_published)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id
        """, [title, summary, article_body, slug, category_id, cover_url, video_url,
              meta_title, meta_description, meta_keywords, reading_time, is_published])

    row = cur.fetchone()
    conn.commit()
    conn.close()
    return ok({'id': row[0], 'slug': slug})

def handle_toggle_publish(body):
    article_id = body.get('id')
    if not article_id:
        return err('id required')

    conn = get_conn()
    cur = conn.cursor()
    S = SCHEMA
    cur.execute(f'UPDATE "{S}".articles SET is_published = NOT is_published, updated_at = NOW() WHERE id = %s RETURNING is_published', [article_id])
    row = cur.fetchone()
    conn.commit()
    conn.close()
    return ok({'id': article_id, 'is_published': row[0]})
