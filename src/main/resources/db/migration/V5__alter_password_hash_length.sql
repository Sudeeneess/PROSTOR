-- Изменяем тип колонки password_hash на VARCHAR(60)
ALTER TABLE users ALTER COLUMN password_hash TYPE VARCHAR(60);