-- 1. СВЯЗЫВАНИЕ ПОЛЬЗОВАТЕЛЕЙ С ПРОФИЛЯМИ
-- =====================================================

-- Администратор (users_id = 1)
INSERT INTO administrator (users_id)
SELECT id FROM users WHERE user_name = 'admin_user'
ON CONFLICT (users_id) DO NOTHING;

-- Продавцы
INSERT INTO seller (users_id, inn, company_name)
SELECT id, '123456789012', 'ООО Найк Раша'
FROM users WHERE user_name = 'seller_pro'
ON CONFLICT (users_id) DO NOTHING;

-- Покупатели
INSERT INTO customer (users_id)
SELECT id FROM users WHERE user_name = 'john_doe'
ON CONFLICT (users_id) DO NOTHING;

INSERT INTO customer (users_id)
SELECT id FROM users WHERE user_name = 'jane_smith'
ON CONFLICT (users_id) DO NOTHING;

-- Менеджер склада
INSERT INTO warehouse_manager (users_id)
SELECT id FROM users WHERE user_name = 'warehouse_mgr'
ON CONFLICT (users_id) DO NOTHING;

-- 2. СПРАВОЧНИКИ
-- =====================================================

INSERT INTO brand (name) VALUES ('Nike'), ('Adidas'), ('Puma')
ON CONFLICT (name) DO NOTHING;

INSERT INTO size (name) VALUES ('42'), ('43'), ('M'), ('XL')
ON CONFLICT (name) DO NOTHING;

INSERT INTO category (category_name) VALUES ('Обувь'), ('Одежда')
ON CONFLICT (category_name) DO NOTHING;

INSERT INTO orders_status (name) VALUES
    ('PENDING'), ('CONFIRMED'), ('DELIVERED'), ('CANCELLED')
ON CONFLICT (name) DO NOTHING;

INSERT INTO payments_status (name) VALUES ('PENDING'), ('SUCCESS')
ON CONFLICT (name) DO NOTHING;

INSERT INTO movements_status (name) VALUES ('PENDING'), ('SHIPPED')
ON CONFLICT (name) DO NOTHING;

-- 3. ТОВАРЫ
-- =====================================================

DO $$
DECLARE
    v_seller_id INTEGER;
    v_cat_shoes_id INTEGER;
    v_brand_nike_id INTEGER;
    v_size_42_id INTEGER;
    v_size_43_id INTEGER;
BEGIN
    -- Получаем ID продавца (seller_pro)
    SELECT s.id INTO v_seller_id
    FROM seller s
    WHERE s.users_id = (SELECT id FROM users WHERE user_name = 'seller_pro')
    LIMIT 1;

    -- Получаем ID категории
    SELECT id INTO v_cat_shoes_id
    FROM category WHERE category_name = 'Обувь' LIMIT 1;

    -- Получаем ID бренда
    SELECT id INTO v_brand_nike_id
    FROM brand WHERE name = 'Nike' LIMIT 1;

    -- Получаем ID размеров
    SELECT id INTO v_size_42_id
    FROM size WHERE name = '42' LIMIT 1;

    SELECT id INTO v_size_43_id
    FROM size WHERE name = '43' LIMIT 1;

    -- Родительский товар
    INSERT INTO products (seller_id, category_id, parent_id, name, price)
    VALUES (v_seller_id, v_cat_shoes_id, NULL, 'Кроссовки Air Max', 12000.00)
    ON CONFLICT DO NOTHING;

    -- Товары с размерами
    INSERT INTO products (seller_id, category_id, parent_id, name, price)
    SELECT v_seller_id, v_cat_shoes_id, p.id, p.name  || ' (42 размер)', p.price
    FROM products p
    WHERE p.name = 'Кроссовки Air Max' AND p.parent_id IS NULL
    ON CONFLICT DO NOTHING;

    INSERT INTO products (seller_id, category_id, parent_id, name, price)
    SELECT v_seller_id, v_cat_shoes_id, p.id, p.name  || ' (43 размер)', p.price + 500
    FROM products p
    WHERE p.name = 'Кроссовки Air Max' AND p.parent_id IS NULL
    ON CONFLICT DO NOTHING;

    -- Карточки товаров
    INSERT INTO product_card (products_id, brand_id, size_id, description, type, is_active, photo)
    SELECT p.id, v_brand_nike_id, v_size_42_id, 'Кроссовки Air Max 42 размер', 'Оригинал', true, '[]'::jsonb
    FROM products p
    WHERE p.name LIKE '%42 размер%'
    ON CONFLICT DO NOTHING;

    INSERT INTO product_card (products_id, brand_id, size_id, description, type, is_active, photo)
    SELECT p.id, v_brand_nike_id, v_size_43_id, 'Кроссовки Air Max 43 размер', 'Оригинал', true, '[]'::jsonb
    FROM products p
    WHERE p.name LIKE '%43 размер%'
    ON CONFLICT DO NOTHING;
END $$;

-- 4. СКЛАД И ОСТАТКИ
-- =====================================================
DO $$
DECLARE
    v_manager_id INTEGER;
    v_warehouse_id INTEGER;
BEGIN
    -- Получаем ID менеджера склада
    SELECT wm.id INTO v_manager_id
    FROM warehouse_manager wm
    WHERE wm.users_id = (SELECT id FROM users WHERE user_name = 'warehouse_mgr')
    LIMIT 1;

    -- Создаем склад
    INSERT INTO warehouse (warehouse_manager_id, warehouse_address)
    VALUES (v_manager_id, 'Москва, ул. Складская, д. 10')
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_warehouse_id;

    -- Остатки на складе
    INSERT INTO warehouse_stock (warehouse_id, products_id, quantity, reserved_quantity, sold_quantity)
    SELECT v_warehouse_id, p.id, 50, 0, 0
    FROM products p
    WHERE p.name LIKE '%42 размер%'
    ON CONFLICT DO NOTHING;

    INSERT INTO warehouse_stock (warehouse_id, products_id, quantity, reserved_quantity, sold_quantity)
    SELECT v_warehouse_id, p.id, 30, 0, 0
    FROM products p
    WHERE p.name LIKE '%43 размер%'
    ON CONFLICT DO NOTHING;
END $$;

-- 5. ТЕСТОВЫЙ ЗАКАЗ
-- =====================================================

DO $$
DECLARE
    v_customer_id INTEGER;
    v_product_id INTEGER;
    v_order_id INTEGER;
    v_amount DECIMAL := 12000.00;
    v_commission DECIMAL := 1200.00;
BEGIN
    -- Получаем ID покупателя (john_doe)
    SELECT c.id INTO v_customer_id
    FROM customer c
    WHERE c.users_id = (SELECT id FROM users WHERE user_name = 'john_doe')
    LIMIT 1;

    -- Получаем ID товара (42 размер)
    SELECT p.id INTO v_product_id
    FROM products p
    WHERE p.name LIKE '%42 размер%'
    LIMIT 1;

    -- Создаем заказ
    INSERT INTO orders (customer_id, orders_status_id, total_amount)
    VALUES (v_customer_id,
            (SELECT id FROM orders_status WHERE name = 'PENDING' LIMIT 1),
            v_amount)
    RETURNING id INTO v_order_id;

    -- Добавляем позицию заказа
    INSERT INTO orders_items (orders_id, products_id, is_ordered, amount, seller_commission, net_payout)
    VALUES (v_order_id, v_product_id, true, v_amount, v_commission, v_amount - v_commission);

    -- Платеж
    INSERT INTO payments (payments_status_id, orders_items_id)
    VALUES ((SELECT id FROM payments_status WHERE name = 'PENDING' LIMIT 1),
            (SELECT id FROM orders_items ORDER BY id DESC LIMIT 1));

    -- Движение заказа
    INSERT INTO orders_movements (warehouse_id, orders_items_id, movements_status_id)
    VALUES ((SELECT id FROM warehouse LIMIT 1),
            (SELECT id FROM orders_items ORDER BY id DESC LIMIT 1),
            (SELECT id FROM movements_status WHERE name = 'PENDING' LIMIT 1));
END $$;