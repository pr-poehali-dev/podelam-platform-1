
CREATE TABLE site_settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(100) NOT NULL UNIQUE,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO site_settings (key, value, description) VALUES
('btn_play_online', 'true', 'Видимость кнопки Играть онлайн'),
('btn_play_offline', 'true', 'Видимость кнопки Играть офлайн'),
('btn_tournament', 'true', 'Видимость кнопки Оплайн турнир'),
('level_play_online', '0', 'Минимальный рейтинг для Играть онлайн'),
('level_play_offline', '0', 'Минимальный рейтинг для Играть офлайн'),
('level_tournament', '0', 'Минимальный рейтинг для Участвовать в турнире');