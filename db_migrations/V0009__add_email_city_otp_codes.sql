
ALTER TABLE t_p52389855_chess_online_platfor.users
  ADD COLUMN IF NOT EXISTS email character varying(255) NULL,
  ADD COLUMN IF NOT EXISTS city character varying(200) NULL;

CREATE TABLE IF NOT EXISTS t_p52389855_chess_online_platfor.otp_codes (
  id SERIAL PRIMARY KEY,
  email character varying(255) NOT NULL,
  code character varying(6) NOT NULL,
  created_at timestamp without time zone DEFAULT now(),
  expires_at timestamp without time zone NOT NULL,
  used boolean DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_otp_codes_email ON t_p52389855_chess_online_platfor.otp_codes(email);

ALTER TABLE t_p52389855_chess_online_platfor.users
  ALTER COLUMN rating SET DEFAULT 500;
