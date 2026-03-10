ALTER TABLE matchmaking_queue ADD COLUMN IF NOT EXISTS last_heartbeat TIMESTAMP DEFAULT NOW();
UPDATE matchmaking_queue SET last_heartbeat = NOW();
