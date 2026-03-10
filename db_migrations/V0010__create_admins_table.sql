
CREATE TABLE IF NOT EXISTS t_p52389855_chess_online_platfor.admins (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO t_p52389855_chess_online_platfor.admins (email) VALUES ('dimanadym@yandex.ru');
