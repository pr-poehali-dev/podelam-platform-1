CREATE TABLE IF NOT EXISTS t_p13403005_podelam_platform_1.barrier_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  session_data JSONB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_barrier_sessions_user_id ON t_p13403005_podelam_platform_1.barrier_sessions (user_id);
CREATE INDEX idx_barrier_sessions_created_at ON t_p13403005_podelam_platform_1.barrier_sessions (user_id, created_at DESC);