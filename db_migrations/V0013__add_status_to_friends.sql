
ALTER TABLE t_p52389855_chess_online_platfor.friends 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'confirmed';
