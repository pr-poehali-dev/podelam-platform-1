-- LigaChess Database Schema
-- Run this on a fresh PostgreSQL database

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY NOT NULL,
    username VARCHAR(100) NOT NULL,
    avatar TEXT,
    rating INTEGER NOT NULL DEFAULT 500,
    games_played INTEGER NOT NULL DEFAULT 0,
    wins INTEGER NOT NULL DEFAULT 0,
    losses INTEGER NOT NULL DEFAULT 0,
    draws INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    email VARCHAR(255),
    city VARCHAR(200),
    last_online TIMESTAMP DEFAULT NOW(),
    user_code VARCHAR(20),
    active_device_token VARCHAR(64)
);

CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS otp_codes (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    code VARCHAR(6) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS game_history (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id),
    opponent_name VARCHAR(100) NOT NULL,
    opponent_type VARCHAR(20) NOT NULL DEFAULT 'bot',
    opponent_rating INTEGER,
    result VARCHAR(10) NOT NULL,
    user_color VARCHAR(5) NOT NULL,
    time_control VARCHAR(20) NOT NULL,
    difficulty VARCHAR(20),
    moves_count INTEGER NOT NULL DEFAULT 0,
    move_history TEXT,
    rating_before INTEGER NOT NULL,
    rating_after INTEGER NOT NULL,
    rating_change INTEGER NOT NULL,
    duration_seconds INTEGER,
    end_reason VARCHAR(30) NOT NULL DEFAULT 'checkmate',
    created_at TIMESTAMP DEFAULT NOW(),
    move_times TEXT
);

CREATE TABLE IF NOT EXISTS online_games (
    id SERIAL PRIMARY KEY,
    white_user_id VARCHAR(64) NOT NULL,
    white_username VARCHAR(100) NOT NULL,
    white_avatar TEXT,
    white_rating INTEGER NOT NULL DEFAULT 1200,
    black_user_id VARCHAR(64) NOT NULL,
    black_username VARCHAR(100) NOT NULL,
    black_avatar TEXT,
    black_rating INTEGER NOT NULL DEFAULT 1200,
    time_control VARCHAR(20) NOT NULL,
    opponent_type VARCHAR(20) NOT NULL,
    board_state TEXT NOT NULL DEFAULT 'initial',
    current_player VARCHAR(5) NOT NULL DEFAULT 'white',
    white_time INTEGER NOT NULL DEFAULT 600,
    black_time INTEGER NOT NULL DEFAULT 600,
    move_history TEXT NOT NULL DEFAULT '',
    status VARCHAR(20) NOT NULL DEFAULT 'playing',
    winner VARCHAR(64),
    end_reason VARCHAR(30),
    is_bot_game BOOLEAN NOT NULL DEFAULT FALSE,
    last_move_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    rematch_offered_by VARCHAR(64),
    rematch_status VARCHAR(20),
    rematch_game_id INTEGER,
    move_number INTEGER NOT NULL DEFAULT 0,
    rematch_offered_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS matchmaking_queue (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    username VARCHAR(100) NOT NULL,
    avatar TEXT,
    rating INTEGER NOT NULL DEFAULT 1200,
    opponent_type VARCHAR(20) NOT NULL,
    time_control VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    city VARCHAR(200) DEFAULT '',
    region VARCHAR(200) DEFAULT ''
);

CREATE TABLE IF NOT EXISTS friends (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    friend_id VARCHAR(64) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'confirmed'
);

CREATE TABLE IF NOT EXISTS chat_messages (
    id SERIAL PRIMARY KEY,
    sender_id VARCHAR(64) NOT NULL,
    receiver_id VARCHAR(64) NOT NULL,
    text TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    read_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS game_invites (
    id SERIAL PRIMARY KEY,
    from_user_id VARCHAR(120) NOT NULL,
    from_username VARCHAR(120) NOT NULL,
    from_avatar TEXT DEFAULT '',
    from_rating INTEGER DEFAULT 1200,
    to_user_id VARCHAR(120) NOT NULL,
    to_username VARCHAR(120) DEFAULT '',
    time_control VARCHAR(30) NOT NULL DEFAULT '10+0',
    color_choice VARCHAR(10) NOT NULL DEFAULT 'random',
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    game_id INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rate_limits (
    id SERIAL PRIMARY KEY,
    ip_address VARCHAR(64) NOT NULL,
    endpoint VARCHAR(100) NOT NULL,
    request_count INTEGER NOT NULL DEFAULT 1,
    window_start TIMESTAMP NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rating_settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS site_settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS webrtc_signals (
    id SERIAL PRIMARY KEY,
    game_id INTEGER NOT NULL,
    from_user_id VARCHAR(64) NOT NULL,
    to_user_id VARCHAR(64) NOT NULL,
    signal_type VARCHAR(20) NOT NULL,
    signal_data TEXT NOT NULL,
    consumed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Default rating settings
INSERT INTO rating_settings (key, value, description) VALUES
    ('win_points', '25', 'Баллы за победу'),
    ('loss_points', '10', 'Баллы за поражение (отнимаются)'),
    ('draw_points', '5', 'Баллы за ничью'),
    ('daily_decay', '10', 'Ежедневное снижение рейтинга (баллы)'),
    ('initial_rating', '500', 'Начальный рейтинг нового игрока'),
    ('rating_principles', 'Рейтинг определяется на основе результатов партий. За победу начисляются баллы, за поражение — снимаются. Ничья дает небольшой бонус обоим игрокам.', 'Текстовое описание принципов рейтинга'),
    ('min_rating', '500', 'Минимальный рейтинг (ниже не опускается)'),
    ('last_decay_date', '2000-01-01', 'Дата последнего ежедневного списания рейтинга (YYYY-MM-DD)')
ON CONFLICT DO NOTHING;

-- Default site settings
INSERT INTO site_settings (key, value, description) VALUES
    ('btn_play_online', 'true', 'Видимость кнопки Играть онлайн'),
    ('btn_play_offline', 'true', 'Видимость кнопки Играть офлайн'),
    ('btn_tournament', 'true', 'Видимость кнопки Онлайн турнир),
    ('level_play_online', '00', 'Минимальный рейтинг для Играть онлайн'),
    ('level_play_offline', '500', 'Минимальный рейтинг для Играть офлайн'),
    ('level_tournament', '1000', 'Минимальный рейтинг для Оплайн турнир'),
    ('level_online_city', '500', 'Минимальный рейтинг для онлайн-игры по городу'),
    ('level_online_region', '500', 'Минимальный рейтинг для онлайн-игры по региону'),
    ('level_online_country', '1200', 'Минимальный рейтинг для онлайн-игры по стране')
ON CONFLICT DO NOTHING;

-- Default admin (change email to yours!)
INSERT INTO admins (email) VALUES ('admin@ligachess.ru')
ON CONFLICT DO NOTHING;