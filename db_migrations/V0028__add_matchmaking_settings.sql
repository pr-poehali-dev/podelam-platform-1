INSERT INTO site_settings (key, value, description) VALUES
('mm_stage_duration', '5', 'Длительность каждой стадии поиска в секундах'),
('mm_heartbeat_timeout', '10', 'Таймаут пульса игрока в очереди (сек)'),
('mm_dead_record_ttl', '15', 'Удаление мёртвых записей из очереди (сек)'),
('mm_rating_range', '50', 'Диапазон рейтинга на стадии rating (±N)'),
('mm_poll_interval', '3', 'Интервал опроса сервера с фронтенда (сек)')
ON CONFLICT (key) DO NOTHING;
