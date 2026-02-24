CREATE TABLE IF NOT EXISTS "t_p13403005_podelam_platform_1".password_reset_codes (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    code VARCHAR(6) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '15 minutes',
    used BOOLEAN DEFAULT FALSE
);