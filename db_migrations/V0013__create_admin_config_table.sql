CREATE TABLE admin_config (
  id INTEGER PRIMARY KEY DEFAULT 1,
  email VARCHAR(255),
  password_hash VARCHAR(255) NOT NULL,
  reset_token VARCHAR(255),
  reset_token_expires TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
);

INSERT INTO admin_config (id, password_hash)
SELECT 1, encode(sha256(COALESCE('admin2024', '')::bytea), 'hex')
WHERE NOT EXISTS (SELECT 1 FROM admin_config WHERE id = 1);