CREATE TABLE IF NOT EXISTS t_p13403005_podelam_platform_1.tool_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  tool_type VARCHAR(50) NOT NULL,
  session_data JSONB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tool_sessions_user_tool ON t_p13403005_podelam_platform_1.tool_sessions (user_id, tool_type);
CREATE INDEX idx_tool_sessions_created ON t_p13403005_podelam_platform_1.tool_sessions (user_id, tool_type, created_at DESC);

INSERT INTO t_p13403005_podelam_platform_1.tool_sessions (user_id, tool_type, session_data, created_at)
SELECT user_id, 'barrier-bot', session_data, created_at
FROM t_p13403005_podelam_platform_1.barrier_sessions;