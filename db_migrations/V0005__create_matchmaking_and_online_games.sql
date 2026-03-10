
CREATE TABLE matchmaking_queue (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    username VARCHAR(100) NOT NULL,
    avatar TEXT,
    rating INTEGER NOT NULL DEFAULT 1200,
    opponent_type VARCHAR(20) NOT NULL,
    time_control VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE TABLE online_games (
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
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_matchmaking_queue_rating ON matchmaking_queue(rating);
CREATE INDEX idx_matchmaking_queue_opponent_type ON matchmaking_queue(opponent_type);
CREATE INDEX idx_online_games_white_user ON online_games(white_user_id);
CREATE INDEX idx_online_games_black_user ON online_games(black_user_id);
CREATE INDEX idx_online_games_status ON online_games(status);
