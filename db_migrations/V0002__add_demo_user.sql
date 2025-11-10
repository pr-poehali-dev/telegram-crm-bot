-- Вставка демо пользователя
INSERT INTO users (telegram_id, username, full_name) 
VALUES (123456789, 'demo_user', 'Demo User') 
ON CONFLICT (telegram_id) DO NOTHING;
