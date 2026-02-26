ALTER TABLE payments ADD COLUMN IF NOT EXISTS yookassa_id VARCHAR(100) NULL;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS description TEXT NULL;
CREATE INDEX IF NOT EXISTS idx_payments_yookassa_id ON payments(yookassa_id);