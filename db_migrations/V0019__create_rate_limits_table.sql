CREATE TABLE rate_limits (
    id SERIAL PRIMARY KEY,
    ip_address VARCHAR(64) NOT NULL,
    endpoint VARCHAR(100) NOT NULL,
    request_count INT NOT NULL DEFAULT 1,
    window_start TIMESTAMP NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_rate_limits_ip_endpoint ON rate_limits (ip_address, endpoint);
CREATE INDEX idx_rate_limits_window ON rate_limits (window_start);