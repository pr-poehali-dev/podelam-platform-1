
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE articles (
  id SERIAL PRIMARY KEY,
  category_id INT REFERENCES categories(id),
  slug VARCHAR(300) UNIQUE NOT NULL,
  title VARCHAR(120) NOT NULL,
  summary VARCHAR(300) NOT NULL,
  cover_url TEXT,
  body TEXT NOT NULL DEFAULT '',
  video_url TEXT,
  meta_title VARCHAR(200),
  meta_description VARCHAR(400),
  meta_keywords VARCHAR(300),
  reading_time INT DEFAULT 3,
  is_published BOOLEAN DEFAULT FALSE,
  views_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_articles_published ON articles(is_published, created_at DESC);
CREATE INDEX idx_articles_category ON articles(category_id);
CREATE INDEX idx_articles_slug ON articles(slug);

INSERT INTO categories (slug, name, sort_order) VALUES
  ('career', 'Карьера', 1),
  ('psychology', 'Психология', 2),
  ('motivation', 'Мотивация', 3),
  ('development', 'Саморазвитие', 4);
