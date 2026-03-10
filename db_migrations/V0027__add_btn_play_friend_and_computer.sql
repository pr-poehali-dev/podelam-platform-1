INSERT INTO site_settings (key, value, description) VALUES
('btn_play_friend', 'true', 'Видимость кнопки Играть с другом'),
('btn_play_computer', 'true', 'Видимость кнопки Играть с компьютером')
ON CONFLICT (key) DO NOTHING;
