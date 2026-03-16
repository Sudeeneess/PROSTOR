DELETE FROM users;


ALTER SEQUENCE users_id_seq RESTART WITH 1;


ALTER TABLE users DROP CONSTRAINT IF EXISTS users_password_hash_key;


UPDATE roles SET name = 'ADMIN' WHERE name = 'admin';
UPDATE roles SET name = 'CUSTOMER' WHERE name = 'customer';
UPDATE roles SET name = 'SELLER' WHERE name = 'seller';
UPDATE roles SET name = 'WAREHOUSE_MANAGER' WHERE name = 'warehouse_manager';


CREATE INDEX IF NOT EXISTS idx_users_user_name ON users(user_name);
