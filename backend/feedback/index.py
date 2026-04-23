import json
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


def handler(event: dict, context) -> dict:
    """Получение пожеланий и запросов от пользователей со страницы 'Об Анне'. Отправляет письмо на почту."""

    cors_headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    }

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors_headers, "body": ""}

    if event.get("httpMethod") != "POST":
        return {"statusCode": 405, "headers": cors_headers, "body": json.dumps({"error": "Method not allowed"})}

    try:
        body = json.loads(event.get("body") or "{}")
    except Exception:
        return {"statusCode": 400, "headers": cors_headers, "body": json.dumps({"error": "Invalid JSON"})}

    name = (body.get("name") or "").strip()
    contact = (body.get("contact") or "").strip()
    message = (body.get("message") or "").strip()

    if not message:
        return {"statusCode": 400, "headers": cors_headers, "body": json.dumps({"error": "Сообщение обязательно"})}

    smtp_host = os.environ.get("SMTP_HOST", "smtp.mail.ru")
    smtp_user = os.environ.get("SMTP_USER", "")
    smtp_password = os.environ.get("SMTP_PASSWORD", "")
    to_email = smtp_user

    html_body = f"""
    <h2>Новый запрос с сайта ПоДелам</h2>
    <p><b>Имя:</b> {name or '(не указано)'}</p>
    <p><b>Контакт:</b> {contact or '(не указан)'}</p>
    <p><b>Сообщение:</b></p>
    <p style="background:#f5f5f5;padding:12px;border-radius:8px;">{message}</p>
    """

    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"Запрос с сайта ПоДелам — {name or 'Аноним'}"
    msg["From"] = smtp_user
    msg["To"] = to_email
    msg.attach(MIMEText(html_body, "html", "utf-8"))

    with smtplib.SMTP_SSL(smtp_host, 465) as server:
        server.login(smtp_user, smtp_password)
        server.sendmail(smtp_user, [to_email], msg.as_string())

    return {
        "statusCode": 200,
        "headers": cors_headers,
        "body": json.dumps({"ok": True}),
    }
