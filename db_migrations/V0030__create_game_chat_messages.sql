CREATE TABLE game_chat_messages (
  id SERIAL PRIMARY KEY,
  game_id INTEGER NOT NULL,
  sender_id VARCHAR(100) NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_game_chat_game_id ON game_chat_messages(game_id, id);
