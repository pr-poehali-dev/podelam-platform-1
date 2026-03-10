INSERT INTO site_settings (key, value, description)
VALUES ('rankings_mode', 'demo', 'Режим рейтинговых карточек: demo — фейковые данные, real — реальные игроки')
ON CONFLICT (key) DO NOTHING;