INSERT INTO site_settings (key, value, description) VALUES
  ('level_online_city', '500', 'Минимальный рейтинг для онлайн-игры по городу'),
  ('level_online_region', '500', 'Минимальный рейтинг для онлайн-игры по региону'),
  ('level_online_country', '1200', 'Минимальный рейтинг для онлайн-игры по стране')
ON CONFLICT (key) DO NOTHING;