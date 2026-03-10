
CREATE TABLE chat_messages (
    id SERIAL PRIMARY KEY,
    sender_id VARCHAR(64) NOT NULL,
    receiver_id VARCHAR(64) NOT NULL,
    text TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    read_at TIMESTAMP NULL
);

CREATE INDEX idx_chat_messages_sender ON chat_messages(sender_id, created_at DESC);
CREATE INDEX idx_chat_messages_receiver ON chat_messages(receiver_id, created_at DESC);
CREATE INDEX idx_chat_messages_pair ON chat_messages(
    LEAST(sender_id, receiver_id),
    GREATEST(sender_id, receiver_id),
    created_at DESC
);
