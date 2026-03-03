import json
import os
import html
import psycopg2

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 'public')
SITE = 'https://podelam.su'

def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def esc(text):
    return html.escape(str(text or ''), quote=True)

def redirect_html(url):
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'text/html; charset=utf-8', 'Access-Control-Allow-Origin': '*'},
        'body': f'<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0;url={url}"></head><body><a href="{url}">Перейти</a><script>window.location.replace("{url}")</script></body></html>'
    }

def handler(event: dict, context) -> dict:
    """Отдаёт HTML с Open Graph мета-тегами для превью статей в мессенджерах"""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type'}, 'body': ''}

    qs = event.get('queryStringParameters') or {}
    slug = qs.get('slug', '')
    ref = qs.get('ref', '')

    if not slug:
        return redirect_html(f'{SITE}/blog')

    conn = get_conn()
    try:
        cur = conn.cursor()
        cur.execute(
            f'''SELECT title, summary, cover_url, meta_title, meta_description,
                       created_at, updated_at, reading_time, body
                FROM "{SCHEMA}".articles
                WHERE slug = %s AND is_published = TRUE''',
            [slug]
        )
        row = cur.fetchone()
    finally:
        conn.close()

    if not row:
        return redirect_html(f'{SITE}/blog')

    title, summary, cover_url, meta_title, meta_description, created_at, updated_at, reading_time, body = row
    og_title = esc(meta_title or title)
    og_desc = esc(meta_description or summary)
    og_image = esc(cover_url) if cover_url else ''
    ref_param = f'?ref={esc(ref)}' if ref else ''
    page_url = f'{SITE}/blog/{esc(slug)}{ref_param}'
    word_count = len((body or '').split())

    json_ld = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": meta_title or title,
        "description": meta_description or summary,
        "url": f'{SITE}/blog/{slug}',
        "datePublished": str(created_at) if created_at else None,
        "dateModified": str(updated_at or created_at) if (updated_at or created_at) else None,
        "author": {"@type": "Person", "name": "Анна Уварова", "url": "https://annauvarova.ru/"},
        "publisher": {"@type": "Organization", "name": "ПоДелам", "url": SITE},
        "mainEntityOfPage": {"@type": "WebPage", "@id": f'{SITE}/blog/{slug}'},
        "wordCount": word_count,
        "inLanguage": "ru",
    }
    if cover_url:
        json_ld["image"] = {"@type": "ImageObject", "url": cover_url}
    if reading_time:
        json_ld["timeRequired"] = f"PT{reading_time}M"
    json_ld = {k: v for k, v in json_ld.items() if v is not None}

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
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{og_title}</title>
    <meta name="description" content="{og_desc}">
    <link rel="canonical" href="{SITE}/blog/{esc(slug)}">

    <meta property="og:type" content="article">
    <meta property="og:title" content="{og_title}">
    <meta property="og:description" content="{og_desc}">
    <meta property="og:url" content="{page_url}">
    <meta property="og:site_name" content="ПоДелам">
    <meta property="og:locale" content="ru_RU">
    {og_image_tags}

    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{og_title}">
    <meta name="twitter:description" content="{og_desc}">

    <meta property="article:published_time" content="{esc(str(created_at or ''))}">
    <meta property="article:modified_time" content="{esc(str(updated_at or created_at or ''))}">
    <meta property="article:author" content="Анна Уварова">

    <script type="application/ld+json">{json.dumps(json_ld, ensure_ascii=False)}</script>

    <meta http-equiv="refresh" content="0;url={page_url}">
</head>
<body>
    <p>Перенаправление на <a href="{page_url}">{og_title}</a>...</p>
    <script>window.location.replace("{page_url}");</script>
</body>
</html>'''

    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'text/html; charset=utf-8',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'public, max-age=3600',
        },
        'body': page_html
    }