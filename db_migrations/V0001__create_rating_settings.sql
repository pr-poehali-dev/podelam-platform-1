
CREATE TABLE rating_settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO rating_settings (key, value, description) VALUES
    ('win_points', '25', 'Баллы за победу'),
    ('loss_points', '15', 'Баллы за поражение (отнимаются)'),
    ('draw_points', '5', 'Баллы за ничью'),
    ('daily_decay', '1', 'Ежедневное снижение рейтинга (баллы)'),
    ('initial_rating', '1200', 'Начальный рейтинг нового игрока'),
    ('rating_principles', 'Рейтинг определяется на основе результатов партий. За победу начисляются баллы, за поражение — снимаются. Ничья дает небольшой бонус обоим игрокам. Ежедневно рейтинг всех игроков снижается на фиксированное значение для стимуляции активной игры.', 'Текстовое описание принципов рейтинга');
