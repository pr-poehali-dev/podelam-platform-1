import json
import base64
from urllib.request import urlopen
from urllib.parse import unquote


def handler(event, context):
    """Прокси для загрузки изображений с CDN (обход CORS)"""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '86400'}, 'body': ''}

    cors = {'Access-Control-Allow-Origin': '*'}

    params = event.get('queryStringParameters') or {}
    url = params.get('url', '')

    if not url or 'cdn.poehali.dev' not in url:
        return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'Invalid URL'})}

    url = unquote(url)
    resp = urlopen(url)
    data = resp.read()
    b64 = base64.b64encode(data).decode('utf-8')

    ct = resp.headers.get('Content-Type', 'image/jpeg')
    data_url = f"data:{ct};base64,{b64}"

    return {
        'statusCode': 200,
        'headers': {**cors, 'Content-Type': 'application/json'},
        'body': json.dumps({'dataUrl': data_url})
    }
