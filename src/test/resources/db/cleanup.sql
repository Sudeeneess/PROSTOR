-- Отключаем проверку внешних ключей для быстрой очистки
SET session_replication_role = 'replica';

-- Полная очистка всех таблиц
TRUNCATE TABLE
    orders_movements,
    payments,
    orders_items,
    order_returns,
    orders,
    warehouse_stock,
    warehouse,
    product_card,
    products,
    brand,
    size,
    category,
    seller,
    customer,
    administrator,
    warehouse_manager,
    users,
    roles
CASCADE;

-- Включаем проверку внешних ключей обратно
SET session_replication_role = 'origin';

-- Восстанавливаем справочник ролей
INSERT INTO roles (name) VALUES
    ('ADMIN'),
    ('CUSTOMER'),
    ('SELLER'),
    ('WAREHOUSE_MANAGER')
ON CONFLICT (name) DO NOTHING;

-- Восстанавливаем базовых пользователей (хеши временные, перезаписываются в @BeforeEach)
INSERT INTO users (role_id, user_name, password_hash, contact_phone, created_at)
SELECT r.id, 'admin_user', 'temp', '11111111111', CURRENT_TIMESTAMP
FROM roles r WHERE r.name = 'ADMIN'
ON CONFLICT (user_name) DO NOTHING;

INSERT INTO users (role_id, user_name, password_hash, contact_phone, created_at)
SELECT r.id, 'john_doe', 'temp', '22222222222', CURRENT_TIMESTAMP
FROM roles r WHERE r.name = 'CUSTOMER'
ON CONFLICT (user_name) DO NOTHING;

INSERT INTO users (role_id, user_name, password_hash, contact_phone, created_at)
SELECT r.id, 'seller_pro', 'temp', '33333333333', CURRENT_TIMESTAMP
FROM roles r WHERE r.name = 'SELLER'
ON CONFLICT (user_name) DO NOTHING;

-- Создаём связанные записи
INSERT INTO customer (users_id)
SELECT id FROM users WHERE user_name = 'john_doe'
ON CONFLICT (users_id) DO NOTHING;

INSERT INTO seller (users_id, inn, company_name)
SELECT id, '123456789012', 'ООО Продавец'
FROM users WHERE user_name = 'seller_pro'
ON CONFLICT (users_id) DO NOTHING;

INSERT INTO administrator (users_id)
SELECT id FROM users WHERE user_name = 'admin_user'
ON CONFLICT (users_id) DO NOTHING;