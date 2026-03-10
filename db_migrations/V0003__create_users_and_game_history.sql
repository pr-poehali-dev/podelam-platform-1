
CREATE TABLE users (
    id VARCHAR(64) PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    avatar TEXT,
    rating INTEGER NOT NULL DEFAULT 1200,
    games_played INTEGER NOT NULL DEFAULT 0,
    wins INTEGER NOT NULL DEFAULT 0,
    losses INTEGER NOT NULL DEFAULT 0,
    draws INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE game_history (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id),
    opponent_name VARCHAR(100) NOT NULL,
    opponent_type VARCHAR(20) NOT NULL DEFAULT 'bot',
    opponent_rating INTEGER,
    result VARCHAR(10) NOT NULL CHECK (result IN ('win', 'loss', 'draw')),
    user_color VARCHAR(5) NOT NULL CHECK (user_color IN ('white', 'black')),
    time_control VARCHAR(20) NOT NULL,
    difficulty VARCHAR(20),
    moves_count INTEGER NOT NULL DEFAULT 0,
    move_history TEXT,
    rating_before INTEGER NOT NULL,
    rating_after INTEGER NOT NULL,
    rating_change INTEGER NOT NULL,
    duration_seconds INTEGER,
    end_reason VARCHAR(30) NOT NULL DEFAULT 'checkmate',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_game_history_user_id ON game_history(user_id);
CREATE INDEX idx_game_history_created_at ON game_history(created_at DESC);
