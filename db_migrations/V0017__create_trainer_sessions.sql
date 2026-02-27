
CREATE TABLE trainer_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    trainer_id VARCHAR(50) NOT NULL,
    session_id VARCHAR(100) NOT NULL,
    started_at TIMESTAMP NOT NULL DEFAULT now(),
    completed_at TIMESTAMP NULL,
    scores JSONB DEFAULT '{}',
    result JSONB NULL,
    answers JSONB DEFAULT '{}',
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_trainer_sessions_user_trainer ON trainer_sessions(user_id, trainer_id);
CREATE INDEX idx_trainer_sessions_completed ON trainer_sessions(user_id, trainer_id, completed_at);
CREATE UNIQUE INDEX idx_trainer_sessions_unique ON trainer_sessions(user_id, session_id);
