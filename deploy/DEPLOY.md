# Развёртывание LigaChess на VPS

## Требования к серверу
- Ubuntu 22.04+ (или Debian 12+)
- Минимум: 2 ядра, 4 ГБ RAM, 40 ГБ SSD
- Для 5000 онлайн: рекомендую 4 ядра, 8 ГБ RAM

## Шаг 1: Подготовка VPS

```bash
# Подключаемся к серверу
ssh root@YOUR_SERVER_IP

# Обновляем систему
apt update && apt upgrade -y

# Устанавливаем Docker
curl -fsSL https://get.docker.com | sh
apt install -y docker-compose-plugin

# Устанавливаем Node.js (для сборки фронтенда)
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
npm install -g bun
```

## Шаг 2: DNS настройка (в панели reg.ru)

Добавьте A-записи для домена:
```
ligachess.ru      A    YOUR_SERVER_IP
www.ligachess.ru  A    YOUR_SERVER_IP
```

Подождите 5-30 минут пока DNS обновится.

## Шаг 3: Загрузка проекта

### Вариант A: Через GitHub
```bash
# Подключите GitHub в poehali.dev: Скачать -> Подключить GitHub
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git /opt/ligachess
cd /opt/ligachess
```

### Вариант B: Через архив
```bash
# В poehali.dev: Скачать -> Скачать код
# Загрузите архив на сервер:
scp ligachess.zip root@YOUR_SERVER_IP:/opt/
ssh root@YOUR_SERVER_IP
cd /opt && unzip ligachess.zip -d ligachess && cd ligachess
```

## Шаг 4: Подготовка файлов

```bash
cd /opt/ligachess

# Копируем функции бэкенда
bash deploy/backend/copy_functions.sh

# Заменяем api.ts для работы без poehali.dev
cp deploy/frontend/api.ts.example src/config/api.ts

# Собираем фронтенд
bun install
bun run build

# Копируем билд
mkdir -p deploy/frontend
cp -r dist deploy/frontend/
```

## Шаг 5: Настройка переменных окружения

```bash
cd /opt/ligachess/deploy

# Создаём .env из шаблона
cp .env.example .env
nano .env
```

Заполните значения:
```
DB_PASSWORD=ваш_надёжный_пароль_бд
SMTP_HOST=smtp.mail.ru
SMTP_PORT=465
SMTP_USER=ligachess.ru@mail.ru
SMTP_PASSWORD=ваш_пароль_почты
SMTP_FROM_EMAIL=ligachess.ru@mail.ru
```

## Шаг 6: Запуск

```bash
cd /opt/ligachess/deploy

# Первый запуск с получением SSL-сертификата
chmod +x init-ssl.sh
bash init-ssl.sh
```

Если SSL не нужен сразу (DNS ещё не обновился):
```bash
# Запуск без SSL (только HTTP)
docker compose up -d db backend nginx
```

## Шаг 7: Проверка

```bash
# Статус контейнеров
docker compose ps

# Логи бэкенда
docker compose logs backend

# Проверка API
curl http://localhost:8000/health

# Проверка через домен
curl https://ligachess.ru/api/site-settings
```

## Обновление сайта

```bash
cd /opt/ligachess

# Подтягиваем изменения (если через GitHub)
git pull

# Пересобираем
bash deploy/backend/copy_functions.sh
cp deploy/frontend/api.ts.example src/config/api.ts
bun run build
cp -r dist deploy/frontend/

# Перезапускаем
cd deploy
docker compose up -d --build backend
docker compose exec nginx nginx -s reload
```

## Структура deploy/

```
deploy/
├── .env.example          # Шаблон переменных окружения
├── docker-compose.yml    # Оркестрация контейнеров
├── init-ssl.sh          # Скрипт получения SSL
├── DEPLOY.md            # Эта инструкция
├── backend/
│   ├── Dockerfile       # Образ Python-бэкенда
│   ├── main.py          # FastAPI-сервер (адаптер)
│   ├── requirements.txt # Python-зависимости
│   ├── copy_functions.sh # Скрипт копирования функций
│   └── functions/       # Модули функций (после copy_functions.sh)
├── database/
│   └── init.sql         # Схема БД (13 таблиц + начальные данные)
├── frontend/
│   ├── api.ts.example   # Замена src/config/api.ts
│   └── dist/            # Собранный фронтенд (после bun run build)
└── nginx/
    ├── nginx.conf       # Основная конфигурация Nginx
    └── conf.d/
        └── ligachess.conf # Настройки домена + SSL + проксирование API
```

## Важно

- Админ email по умолчанию: `admin@ligachess.ru` (измените в `init.sql`)
- БД schema: `public` (без приставки как на poehali.dev)
- Все функции бэкенда работают через `/api/{function-name}`
- SSL-сертификаты обновляются автоматически (certbot в docker-compose)
- Для бэкапа БД: `docker compose exec db pg_dump -U ligachess ligachess > backup.sql`
