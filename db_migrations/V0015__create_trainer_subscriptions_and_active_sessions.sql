
CREATE TABLE IF NOT EXISTS "t_p13403005_podelam_platform_1".trainer_subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES "t_p13403005_podelam_platform_1".users(id),
    plan_id VARCHAR(20) NOT NULL,
    trainer_id VARCHAR(50),
    all_trainers BOOLEAN NOT NULL DEFAULT false,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS "t_p13403005_podelam_platform_1".trainer_active_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES "t_p13403005_podelam_platform_1".users(id),
    trainer_id VARCHAR(50) NOT NULL,
    device_id VARCHAR(64) NOT NULL,
    last_heartbeat TIMESTAMP NOT NULL DEFAULT now(),
    started_at TIMESTAMP NOT NULL DEFAULT now(),
    UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_trainer_sub_user ON "t_p13403005_podelam_platform_1".trainer_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_trainer_active_user ON "t_p13403005_podelam_platform_1".trainer_active_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_trainer_active_heartbeat ON "t_p13403005_podelam_platform_1".trainer_active_sessions(last_heartbeat);
