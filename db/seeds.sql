-- 1. Создаем пользователей для каждой роли
-- (Предположим, роли с ID 1-4 уже созданы основным скриптом: admin, seller, customer, warehouse_manager)
INSERT INTO users (roles_id, password_hash, user_name, contact_phone) VALUES 
(1, 'hash_admin_123', 'Artem_Admin', '79001112233'),
(2, 'hash_seller_456', 'Nike_Official', '79004445566'),
(3, 'hash_cust_789', 'Ivan_Ivanov', '79007778899'),
(4, 'hash_wh_000', 'Oleg_Sklad', '79000001122');

-- 2. Распределяем пользователей по профилям
INSERT INTO administrator (users_id) VALUES (1);
INSERT INTO seller (users_id, inn, company_name) VALUES (2, '123456789012', 'ООО Найк Раша');
INSERT INTO customer (users_id) VALUES (3);
INSERT INTO warehouse_manager (users_id) VALUES (4);

-- 3. Заполняем справочники товаров
INSERT INTO brand (name) VALUES ('Nike'), ('Adidas'), ('Puma');
INSERT INTO size (name) VALUES ('42'), ('43'), ('XL'), ('M');
INSERT INTO category (category_name) VALUES ('Обувь'), ('Одежда'), ('Аксессуары');

-- 4. Создаем товары (Products)
-- Сначала базовый товар, затем его под-товары (размеры/цвета) через parent_id
INSERT INTO products (seller_id, category_id, parent_id, name, price) VALUES 
(1, 1, NULL, 'Кроссовки Air Max', 12000.00); -- ID 1

INSERT INTO products (seller_id, category_id, parent_id, name, price) VALUES 
(1, 1, 1, 'Кроссовки Air Max (42 размер)', 12000.00), -- ID 2
(1, 1, 1, 'Кроссовки Air Max (43 размер)', 12500.00); -- ID 3

-- 5. Описываем карточки товаров
INSERT INTO product_card (products_id, brand_id, size_id, description, type, is_active) VALUES 
(2, 1, 1, 'Классические кроссовки Air Max, 42 размер, черный цвет', 'Оригинал', true),
(3, 1, 2, 'Классические кроссовки Air Max, 43 размер, черный цвет', 'Оригинал', true);

-- 6. Создаем склад и выставляем остатки
INSERT INTO warehouse (warehouse_manager_id, warehouse_address) VALUES 
(1, 'Москва, ул. Складская, д. 10');

INSERT INTO warehouse_stock (warehouse_id, products_id, quantity, reserved_quantity, sold_quantity) VALUES 
(1, 2, 50, 0, 0), -- На складе 50 пар 42 размера
(1, 3, 30, 0, 0); -- На складе 30 пар 43 размера

-- 7. Создаем тестовый заказ
-- Статусы: 1-Confirmed, 2-Packed, 3-In Transit, 4-Delivered
INSERT INTO orders (customer_id, orders_status_id, total_amount) VALUES 
(1, 1, 12000.00); -- Заказ №1

-- 8. Добавляем позицию в заказ (Здесь сработает ТРИГГЕР на уменьшение остатка!)
INSERT INTO orders_items (orders_id, products_id, is_ordered, amount, seller_commission, net_payout) VALUES 
(1, 2, true, 12000.00, 1200.00, 10800.00);

-- 9. Эмулируем логистику (движение заказа)
-- Статус 1 - Pending
INSERT INTO orders_movements (warehouse_id, orders_items_id, movements_status_id) VALUES 
(1, 1, 1);

-- 10. Оплата
-- Статус 1 - Success
INSERT INTO payments (payments_status_id, orders_items_id) VALUES 
(1, 1);

-- 11. Завершение продажи (Здесь сработает ТРИГГЕР на списание из резерва в Sold!)
UPDATE orders_items SET is_finalized = true, sold_at = NOW() WHERE id = 1;