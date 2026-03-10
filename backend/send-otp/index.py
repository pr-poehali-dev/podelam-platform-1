import json
import os
import random
import string
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
import psycopg2


def get_client_ip(event):
    hdrs = event.get('headers') or {}
    ip = hdrs.get('X-Forwarded-For', hdrs.get('x-forwarded-for', ''))
    if ip:
        ip = ip.split(',')[0].strip()
    if not ip:
        ip = hdrs.get('X-Real-Ip', hdrs.get('x-real-ip', ''))
    if not ip:
        rc = event.get('requestContext') or {}
        ip = (rc.get('identity') or {}).get('sourceIp', 'unknown')
    return ip or 'unknown'


def check_rate_limit(cur, conn, ip, endpoint, max_requests, window_seconds):
    try:
        cur.execute(
            "SELECT id, request_count FROM rate_limits WHERE ip_address = '%s' AND endpoint = '%s' AND window_start > NOW() - INTERVAL '%d seconds' LIMIT 1"
            % (ip.replace("'", "''"), endpoint.replace("'", "''"), window_seconds)
        )
        row = cur.fetchone()
        if row and row[1] >= max_requests:
            return True
        if row:
            cur.execute("UPDATE rate_limits SET request_count = request_count + 1 WHERE id = %d" % row[0])
        else:
            cur.execute(
                "INSERT INTO rate_limits (ip_address, endpoint, request_count, window_start) VALUES ('%s', '%s', 1, NOW())"
                % (ip.replace("'", "''"), endpoint.replace("'", "''"))
            )
        conn.commit()
        return False
    except Exception:
        try:
            conn.rollback()
        except Exception:
            pass
        return False


def handler(event, context):
    """Отправка одноразового кода подтверждения на email пользователя"""
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token, X-Session-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }

    headers = {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'}

    if event.get('httpMethod') != 'POST':
        return {'statusCode': 405, 'headers': headers, 'body': json.dumps({'error': 'Method not allowed'})}

    dsn = os.environ['DATABASE_URL']
    schema = os.environ.get('MAIN_DB_SCHEMA', 'public')
    conn = psycopg2.connect(dsn)
    cur = conn.cursor()

    client_ip = get_client_ip(event)
    if check_rate_limit(cur, conn, client_ip, 'send-otp', 3, 300):
        cur.close()
        conn.close()
        return {'statusCode': 429, 'headers': headers, 'body': json.dumps({'error': 'Too many requests. Try again in 5 minutes.'})}

    raw_body = event.get('body') or '{}'
    body = json.loads(raw_body) if isinstance(raw_body, str) and raw_body.strip() else {}
    email = body.get('email', '').strip().lower()

    if not email or '@' not in email:
        return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Invalid email'})}

    code = ''.join(random.choices(string.digits, k=6))
    expires_at = datetime.utcnow() + timedelta(minutes=10)

    cur.execute(
        "UPDATE {schema}.otp_codes SET used = true WHERE email = '{email}' AND used = false".format(
            schema=schema, email=email.replace("'", "''")
        )
    )

    cur.execute(
        "INSERT INTO {schema}.otp_codes (email, code, expires_at) VALUES ('{email}', '{code}', '{expires_at}')".format(
            schema=schema,
            email=email.replace("'", "''"),
            code=code,
            expires_at=expires_at.strftime('%Y-%m-%d %H:%M:%S')
        )
    )
    conn.commit()

    smtp_host = os.environ.get('SMTP_HOST', 'smtp.mail.ru')
    smtp_port = int(os.environ.get('SMTP_PORT', '465'))
    smtp_user = os.environ.get('SMTP_USER', '')
    smtp_password = os.environ.get('SMTP_PASSWORD', '')
    from_email = os.environ.get('SMTP_FROM_EMAIL', smtp_user)

    msg = MIMEMultipart('alternative')
    msg['Subject'] = 'Код подтверждения - ЛигаШахмат'
    msg['From'] = from_email
    msg['To'] = email

    html_body = """
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #f59e0b;">
            <h1 style="color: #d97706; font-size: 24px; margin: 0;">Лига Шахмат</h1>
        </div>
        <div style="padding: 30px 0; text-align: center;">
            <p style="color: #374151; font-size: 16px; margin-bottom: 24px;">Ваш код подтверждения:</p>
            <div style="background: #fef3c7; border: 2px solid #f59e0b; border-radius: 12px; padding: 20px; display: inline-block;">
                <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #92400e;">{code}</span>
            </div>
            <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">Код действителен 10 минут</p>
        </div>
        <div style="border-top: 1px solid #e5e7eb; padding-top: 16px; text-align: center;">
            <p style="color: #9ca3af; font-size: 12px;">Если вы не запрашивали код, просто проигнорируйте это письмо.</p>
        </div>
    </div>
    """.format(code=code)

    text_body = "Ваш код подтверждения для Лига Шахмат: {code}\nКод действителен 10 минут.".format(code=code)

    msg.attach(MIMEText(text_body, 'plain', 'utf-8'))
    msg.attach(MIMEText(html_body, 'html', 'utf-8'))

    try:
        if smtp_port == 465:
            server = smtplib.SMTP_SSL(smtp_host, smtp_port, timeout=10)
        else:
            server = smtplib.SMTP(smtp_host, smtp_port, timeout=10)
            server.starttls()

        server.login(smtp_user, smtp_password)
        server.sendmail(from_email, email, msg.as_string())
        server.quit()
    except Exception as e:
        cur.close()
        conn.close()
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': 'Failed to send email', 'details': str(e)})
        }

    cur.close()
    conn.close()

    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({'success': True, 'message': 'Code sent'})
    }