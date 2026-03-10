#!/bin/bash
# First-time SSL certificate setup for ligachess.ru
# Run AFTER DNS is pointed to your server IP

DOMAIN="ligachess.ru"
EMAIL="admin@ligachess.ru"

echo "=== Creating temporary nginx config (HTTP only) ==="

mkdir -p certbot/conf certbot/www nginx/conf.d

cat > nginx/conf.d/ligachess.conf << 'TEMP'
server {
    listen 80;
    server_name ligachess.ru www.ligachess.ru;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
TEMP

echo "=== Starting services without SSL ==="
docker compose up -d db backend nginx

echo "=== Waiting for nginx to start ==="
sleep 5

echo "=== Requesting SSL certificate ==="
docker compose run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    -d $DOMAIN \
    -d www.$DOMAIN

echo "=== Restoring full nginx config with SSL ==="
cat > nginx/conf.d/ligachess.conf << 'FULL'
server {
    listen 80;
    server_name ligachess.ru www.ligachess.ru;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name ligachess.ru www.ligachess.ru;

    ssl_certificate /etc/letsencrypt/live/ligachess.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ligachess.ru/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    root /usr/share/nginx/html;
    index index.html;

    location /api/ {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 30s;
        proxy_connect_timeout 10s;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2|woff|ttf)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
FULL

echo "=== Restarting with SSL ==="
docker compose up -d

echo "=== Done! Site should be available at https://$DOMAIN ==="
