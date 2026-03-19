import os
import re
import html
import psycopg2
from datetime import timezone
from email.utils import format_datetime
from datetime import datetime

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 'public')
SITE_URL = 'https://podelam.su'
SITE_TITLE = 'ПоДелам — найди своё дело'
SITE_DESCRIPTION = 'Блог о профориентации, карьере и финансовой независимости'
SITE_LANG = 'ru'

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
}


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def strip_html(text: str) -> str:
    text = re.sub(r'<[^>]+>', ' ', text or '')
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def truncate(text: str, max_len: int = 500) -> str:
    if len(text) <= max_len:
        return text
    return text[:max_len].rsplit(' ', 1)[0] + '…'


def to_rfc822(dt_val) -> str:
    if dt_val is None:
        return format_datetime(datetime.now(timezone.utc))
    if isinstance(dt_val, str):
        try:
            dt_val = datetime.fromisoformat(dt_val.replace('Z', '+00:00'))
        except Exception:
            return format_datetime(datetime.now(timezone.utc))
    if dt_val.tzinfo is None:
        dt_val = dt_val.replace(tzinfo=timezone.utc)
    return format_datetime(dt_val)


def build_turbo_content(body: str, cover_url, summary: str) -> str:
    parts = ['<![CDATA[<html><head><meta charset="utf-8"/></head><body>']
    if cover_url:
        parts.append(f'<figure><img src="{html.escape(cover_url)}" /></figure>')
    if summary:
        clean = strip_html(summary)
        if clean:
            parts.append(f'<p><b>{html.escape(clean)}</b></p>')
    if body:
        body = body.strip()
        if not body.startswith('<'):
            body = '<p>' + body.replace('\n\n', '</p><p>').replace('\n', '<br/>') + '</p>'
        parts.append(body)
    parts.append('</body></html>]]>')
    return ''.join(parts)


def handler(event: dict, context) -> dict:
    """RSS-лента для Яндекс.Дзен в формате Turbo RSS"""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    limit = min(int((event.get('queryStringParameters') or {}).get('limit', '50')), 100)

    conn = get_conn()
    try:
        cur = conn.cursor()
        S = SCHEMA
        cur.execute(f"""
            SELECT
                a.slug,
                a.title,
                a.summary,
                a.body,
                a.cover_url,
                COALESCE(a.published_at, a.created_at) as pub_date,
                a.meta_description,
                c.name as category_name
            FROM "{S}".articles a
            LEFT JOIN "{S}".categories c ON c.id = a.category_id
            WHERE a.is_published = TRUE
            ORDER BY COALESCE(a.published_at, a.created_at) DESC
            LIMIT %s
        """, (limit,))
        rows = cur.fetchall()
    finally:
        conn.close()

    items_xml = []
    for row in rows:
        slug, title, summary, body, cover_url, pub_date, meta_desc, category_name = row

        article_url = f'{SITE_URL}/blog/{slug}'
        description_text = truncate(strip_html(meta_desc or summary or ''))
        turbo_content = build_turbo_content(body, cover_url, summary)
        pub_rfc = to_rfc822(pub_date)

        item_parts = [
            '    <item>',
            f'      <title>{html.escape(title or "")}</title>',
            f'      <link>{article_url}</link>',
            f'      <pubDate>{pub_rfc}</pubDate>',
            f'      <description><![CDATA[{description_text}]]></description>',
        ]
        if cover_url:
            item_parts.append(f'      <enclosure url="{html.escape(cover_url)}" type="image/jpeg" length="0"/>')
        if category_name:
            item_parts.append(f'      <category>{html.escape(category_name)}</category>')
        item_parts.append(f'      <turbo:content>{turbo_content}</turbo:content>')
        item_parts.append('    </item>')
        items_xml.append('\n'.join(item_parts))

    now_rfc = to_rfc822(datetime.now(timezone.utc))

    rss = f"""<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:turbo="http://turbo.yandex.ru"
  xmlns:media="http://search.yahoo.com/mrss/"
  xmlns:yandex="http://news.yandex.ru"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>{html.escape(SITE_TITLE)}</title>
    <link>{SITE_URL}</link>
    <description>{html.escape(SITE_DESCRIPTION)}</description>
    <language>{SITE_LANG}</language>
    <lastBuildDate>{now_rfc}</lastBuildDate>
    <turbo:analytics type="Yandex" id="107022183"/>
{chr(10).join(items_xml)}
  </channel>
</rss>"""

    return {
        'statusCode': 200,
        'headers': {
            **CORS,
            'Content-Type': 'application/rss+xml; charset=utf-8',
            'Cache-Control': 'public, max-age=3600',
        },
        'body': rss,
    }
