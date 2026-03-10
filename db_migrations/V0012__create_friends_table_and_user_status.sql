
CREATE TABLE IF NOT EXISTS t_p52389855_chess_online_platfor.friends (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    friend_id VARCHAR(64) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, friend_id)
);

CREATE INDEX IF NOT EXISTS idx_friends_user_id ON t_p52389855_chess_online_platfor.friends(user_id);
CREATE INDEX IF NOT EXISTS idx_friends_friend_id ON t_p52389855_chess_online_platfor.friends(friend_id);

ALTER TABLE t_p52389855_chess_online_platfor.users 
ADD COLUMN IF NOT EXISTS last_online TIMESTAMP DEFAULT NOW();

ALTER TABLE t_p52389855_chess_online_platfor.users 
ADD COLUMN IF NOT EXISTS user_code VARCHAR(20) UNIQUE;
