CREATE TABLE webrtc_signals (
    id SERIAL PRIMARY KEY,
    game_id INTEGER NOT NULL,
    from_user_id VARCHAR(64) NOT NULL,
    to_user_id VARCHAR(64) NOT NULL,
    signal_type VARCHAR(20) NOT NULL,
    signal_data TEXT NOT NULL,
    consumed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_webrtc_signals_game_to ON webrtc_signals (game_id, to_user_id, consumed);
CREATE INDEX idx_webrtc_signals_created ON webrtc_signals (created_at);