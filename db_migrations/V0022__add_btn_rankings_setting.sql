INSERT INTO site_settings (key, value, description)
VALUES ('btn_rankings', 'true', 'Видимость рейтинговых карточек на главной')
ON CONFLICT (key) DO NOTHING;