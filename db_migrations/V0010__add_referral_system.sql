
ALTER TABLE users ADD COLUMN ref_code VARCHAR(12) UNIQUE;
ALTER TABLE users ADD COLUMN referred_by INTEGER REFERENCES users(id);
ALTER TABLE users ADD COLUMN ref_balance INTEGER NOT NULL DEFAULT 0;

CREATE TABLE referral_transactions (
  id SERIAL PRIMARY KEY,
  referrer_id INTEGER NOT NULL REFERENCES users(id),
  referred_id INTEGER NOT NULL REFERENCES users(id),
  payment_id INTEGER NOT NULL REFERENCES payments(id),
  amount INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ref_transactions_referrer ON referral_transactions(referrer_id);
CREATE INDEX idx_ref_transactions_referred ON referral_transactions(referred_id);
CREATE INDEX idx_users_ref_code ON users(ref_code);
