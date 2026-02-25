import json
import os
import hashlib
import psycopg2
import smtplib
import random
import string
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.utils import formataddr, formatdate, make_msgid

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 'public')
ADMIN_PASSWORD_ENV = os.environ.get('ADMIN_PASSWORD', 'admin2024')

def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def hash_pw(password):
    return hashlib.sha256(password.encode()).hexdigest()

def verify_admin(token):
    if token == ADMIN_PASSWORD_ENV:
        return True
    conn = get_conn()
    cur = conn.cursor()
    S = SCHEMA
    cur.execute(f'SELECT password_hash FROM "{S}".admin_config WHERE id = 1')
    row = cur.fetchone()
    conn.close()
    if row and row[0]:
        return hash_pw(token) == row[0]
    return False

def generate_code():
    return ''.join(random.choices(string.digits, k=6))

def send_reset_email(to_email, code):
    smtp_host = os.environ.get('SMTP_HOST', '')
    smtp_port = int(os.environ.get('SMTP_PORT', '465'))
    smtp_user = os.environ.get('SMTP_USER', '')
    smtp_password = os.environ.get('SMTP_PASSWORD', '')

    msg = MIMEMultipart('alternative')
    msg['Subject'] = 'Сброс пароля администратора'
    msg['From'] = formataddr(('ПоДелам', smtp_user))
    msg['To'] = to_email
    msg['Date'] = formatdate(localtime=True)
    msg['Message-ID'] = make_msgid(domain='mail.ru')

    html = f"""
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
      <h2 style="color: #7c3aed; margin-bottom: 8px;">ПоДелам — Админ-панель</h2>
      <p style="color: #374151; font-size: 16px; margin-bottom: 24px;">
        Запрошен сброс пароля администратора. Введите код:
      </p>
      <div style="background: #f5f3ff; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
        <span style="font-size: 40px; font-weight: 900; color: #7c3aed; letter-spacing: 12px;">{code}</span>
      </div>
      <p style="color: #6b7280; font-size: 14px;">
        Код действителен 15 минут. Если вы не запрашивали сброс — проигнорируйте это письмо.
      </p>
    </div>
    """
    msg.attach(MIMEText(html, 'html'))

    with smtplib.SMTP_SSL(smtp_host, smtp_port) as server:
        server.login(smtp_user, smtp_password)
        server.sendmail(smtp_user, to_email, msg.as_string())

def handler(event, context):
    """Настройки админа: смена пароля, привязка email, восстановление доступа"""
    cors = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
    }

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors, 'body': ''}

    body = json.loads(event.get('body') or '{}')
    action = body.get('action', '')

    conn = get_conn()
    cur = conn.cursor()
    S = SCHEMA

    if action == 'reset_request':
        cur.execute(f'SELECT email FROM "{S}".admin_config WHERE id = 1')
        row = cur.fetchone()
        if not row or not row[0]:
            conn.close()
            return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'Email не привязан к админ-панели. Обратитесь к разработчику.'})}

        admin_email = row[0]
        code = generate_code()
        code_hash = hash_pw(code)

        cur.execute(
            f"UPDATE \"{S}\".admin_config SET reset_token = %s, reset_token_expires = NOW() + INTERVAL '15 minutes' WHERE id = 1",
            (code_hash,)
        )
        conn.commit()
        conn.close()

        send_reset_email(admin_email, code)

        masked = admin_email[:3] + '***' + admin_email[admin_email.index('@'):]
        return {'statusCode': 200, 'headers': cors, 'body': json.dumps({'ok': True, 'masked_email': masked})}

    if action == 'reset_confirm':
        code = body.get('code', '').strip()
        new_password = body.get('new_password', '')

        if not code or not new_password:
            conn.close()
            return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'Введите код и новый пароль'})}
        if len(new_password) < 6:
            conn.close()
            return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'Пароль должен быть не менее 6 символов'})}

        code_hash = hash_pw(code)
        cur.execute(f'SELECT reset_token, reset_token_expires FROM "{S}".admin_config WHERE id = 1')
        row = cur.fetchone()
        if not row or row[0] != code_hash:
            conn.close()
            return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'Неверный код'})}

        cur.execute(f"SELECT 1 FROM \"{S}\".admin_config WHERE id = 1 AND reset_token_expires > NOW()")
        if not cur.fetchone():
            conn.close()
            return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'Код истёк, запросите новый'})}

        new_hash = hash_pw(new_password)
        cur.execute(
            f"UPDATE \"{S}\".admin_config SET password_hash = %s, reset_token = NULL, reset_token_expires = NULL, updated_at = NOW() WHERE id = 1",
            (new_hash,)
        )
        conn.commit()
        conn.close()
        return {'statusCode': 200, 'headers': cors, 'body': json.dumps({'ok': True})}

    headers = event.get('headers') or {}
    token = headers.get('X-Admin-Token') or headers.get('x-admin-token', '')
    if not verify_admin(token):
        conn.close()
        return {'statusCode': 403, 'headers': cors, 'body': json.dumps({'error': 'Доступ запрещён'})}

    if action == 'get_config':
        cur.execute(f'SELECT email FROM "{S}".admin_config WHERE id = 1')
        row = cur.fetchone()
        email = row[0] if row else None
        conn.close()
        return {'statusCode': 200, 'headers': cors, 'body': json.dumps({'email': email})}

    if action == 'set_email':
        email = body.get('email', '').strip().lower()
        if not email or '@' not in email:
            conn.close()
            return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'Некорректный email'})}

        cur.execute(
            f"UPDATE \"{S}\".admin_config SET email = %s, updated_at = NOW() WHERE id = 1",
            (email,)
        )
        conn.commit()
        conn.close()
        return {'statusCode': 200, 'headers': cors, 'body': json.dumps({'ok': True, 'email': email})}

    if action == 'change_password':
        old_password = body.get('old_password', '')
        new_password = body.get('new_password', '')

        if not old_password or not new_password:
            conn.close()
            return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'Заполните оба поля'})}
        if len(new_password) < 6:
            conn.close()
            return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'Новый пароль должен быть не менее 6 символов'})}

        if not verify_admin(old_password):
            conn.close()
            return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'Неверный текущий пароль'})}

        new_hash = hash_pw(new_password)
        cur.execute(
            f"UPDATE \"{S}\".admin_config SET password_hash = %s, updated_at = NOW() WHERE id = 1",
            (new_hash,)
        )
        conn.commit()
        conn.close()
        return {'statusCode': 200, 'headers': cors, 'body': json.dumps({'ok': True})}

    conn.close()
    return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'Неизвестное действие'})}