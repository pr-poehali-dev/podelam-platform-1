ALTER TABLE articles ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;
UPDATE articles SET published_at = updated_at WHERE is_published = TRUE AND published_at IS NULL;