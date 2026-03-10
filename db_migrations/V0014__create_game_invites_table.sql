CREATE TABLE game_invites (
    id SERIAL PRIMARY KEY,
    from_user_id VARCHAR(120) NOT NULL,
    from_username VARCHAR(120) NOT NULL,
    from_avatar TEXT DEFAULT '',
    from_rating INT DEFAULT 1200,
    to_user_id VARCHAR(120) NOT NULL,
    to_username VARCHAR(120) DEFAULT '',
    time_control VARCHAR(30) NOT NULL DEFAULT '10+0',
    color_choice VARCHAR(10) NOT NULL DEFAULT 'random',
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    game_id INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_game_invites_to_user ON game_invites(to_user_id, status);
CREATE INDEX idx_game_invites_from_user ON game_invites(from_user_id, status);