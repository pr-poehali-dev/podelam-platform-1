import json
import os
import html
import time
import psycopg2

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 'public')
SITE = 'https://podelam.su'

_cache = {}
CACHE_TTL = 600

def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def esc(text):
    return html.escape(str(text or ''), quote=True)

def redirect_html(url):
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'text/html; charset=utf-8', 'Access-Control-Allow-Origin': '*'},
        'body': f'<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0;url={url}"></head><body><a href="{url}">Перейти</a></body></html>'
    }

def get_article(slug):
    now = time.time()
    if slug in _cache and now - _cache[slug]['ts'] < CACHE_TTL:
        return _cache[slug]['data']

    conn = get_conn()
    try:
        cur = conn.cursor()
        cur.execute(
            f'''SELECT title, summary, cover_url, meta_title, meta_description,
                       created_at, updated_at, reading_time
                FROM "{SCHEMA}".articles
                WHERE slug = %s AND is_published = TRUE''',
            [slug]
        )
        row = cur.fetchone()
    finally:
        conn.close()

    _cache[slug] = {'data': row, 'ts': now}
    if len(_cache) > 100:
        oldest = min(_cache, key=lambda k: _cache[k]['ts'])
        del _cache[oldest]

    return row

def handler(event: dict, context) -> dict:
    """Отдаёт HTML с Open Graph мета-тегами для превью статей в мессенджерах"""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type'}, 'body': ''}

    qs = event.get('queryStringParameters') or {}
    slug = qs.get('slug', '')
    ref = qs.get('ref', '')

    if not slug:
        return redirect_html(f'{SITE}/blog')

    row = get_article(slug)
    if not row:
        return redirect_html(f'{SITE}/blog')

    title, summary, cover_url, meta_title, meta_description, created_at, updated_at, reading_time = row
    og_title = esc(meta_title or title)
    og_desc = esc(meta_description or summary)
    og_image = esc(cover_url) if cover_url else ''
    ref_param = f'?ref={esc(ref)}' if ref else ''
    page_url = f'{SITE}/blog/{esc(slug)}{ref_param}'
    canonical = f'{SITE}/blog/{esc(slug)}'

    og_image_tags = ''
    if og_image:
        og_image_tags = f'''<meta property="og:image" content="{og_image}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="600">
    <meta name="twitter:image" content="{og_image}">'''

    page_html = f'''<!DOCTYPE html>
<html lang="ru" prefix="og: https://ogp.me/ns#">
<head>
    <meta charset="UTF-8">
    <title>{og_title}</title>
    <meta name="description" content="{og_desc}">
    <link rel="canonical" href="{canonical}">
    <meta property="og:type" content="article">
    <meta property="og:title" content="{og_title}">
    <meta property="og:description" content="{og_desc}">
    <meta property="og:url" content="{canonical}">
    <meta property="og:site_name" content="ПоДелам">
    <meta property="og:locale" content="ru_RU">
    {og_image_tags}
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{og_title}">
    <meta name="twitter:description" content="{og_desc}">
    <meta http-equiv="refresh" content="0;url={page_url}">
</head>
<body>
    <p><a href="{page_url}">{og_title}</a></p>
    <script>window.location.replace("{page_url}");</script>
</body>
</html>'''

    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'text/html; charset=utf-8',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'public, max-age=86400',
        },
        'body': page_html
    }
