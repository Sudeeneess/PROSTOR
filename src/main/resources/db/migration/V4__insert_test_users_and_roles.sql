-- Вставка ролей (если ещё не существуют)
INSERT INTO roles (name) VALUES
    ('admin'),
    ('customer'),
    ('seller'),
    ('warehouse_manager')
ON CONFLICT (name) DO NOTHING;

-- Вставка тестовых пользователей
-- Администратор
INSERT INTO users (role_id, user_name, password_hash, contact_phone, created_at)
VALUES (
    (SELECT id FROM roles WHERE name = 'admin'),
    'admin_user',
    'admin123',      -- для теста (рекомендуется хранить хеш)
    '11111111111',
    CURRENT_TIMESTAMP
) ON CONFLICT (user_name) DO NOTHING;

-- Покупатель 1
INSERT INTO users (role_id, user_name, password_hash, contact_phone, created_at)
VALUES (
    (SELECT id FROM roles WHERE name = 'customer'),
    'john_doe',
    'cust123',
    '22222222222',
    CURRENT_TIMESTAMP
) ON CONFLICT (user_name) DO NOTHING;

-- Покупатель 2
INSERT INTO users (role_id, user_name, password_hash, contact_phone, created_at)
VALUES (
    (SELECT id FROM roles WHERE name = 'customer'),
    'jane_smith',
    'cust456',
    '33333333333',
    CURRENT_TIMESTAMP
) ON CONFLICT (user_name) DO NOTHING;

-- Продавец
INSERT INTO users (role_id, user_name, password_hash, contact_phone, created_at)
VALUES (
    (SELECT id FROM roles WHERE name = 'seller'),
    'seller_pro',
    'seller123',
    '44444444444',
    CURRENT_TIMESTAMP
) ON CONFLICT (user_name) DO NOTHING;

-- Складской менеджер
INSERT INTO users (role_id, user_name, password_hash, contact_phone, created_at)
VALUES (
    (SELECT id FROM roles WHERE name = 'warehouse_manager'),
    'warehouse_mgr',
    'ware123',
    '55555555555',
    CURRENT_TIMESTAMP
) ON CONFLICT (user_name) DO NOTHING;