-- 1. ОЧИСТКА БАЗЫ (Сброс таблиц и типов)
DROP TABLE IF EXISTS order_returns, payments, orders_movements, orders_items, warehouse_stock, 
                     product_card, products, warehouse, orders, category, 
                     warehouse_manager, seller, administrator, customer, users CASCADE;

DROP TYPE IF EXISTS user_role_type CASCADE;
DROP TYPE IF EXISTS order_status_type CASCADE;
DROP TYPE IF EXISTS payment_status_type CASCADE;
DROP TYPE IF EXISTS return_status_type CASCADE;

-- 2. СОЗДАНИЕ ENUM ТИПОВ (Перечисления)
CREATE TYPE user_role_type AS ENUM ('admin', 'seller', 'customer', 'warehouse_manager');
CREATE TYPE order_status_type AS ENUM ('confirmed', 'packed', 'in_transit', 'delivered');
CREATE TYPE payment_status_type AS ENUM ('paid', 'waiting', 'reject');
CREATE TYPE return_status_type AS ENUM ('success', 'waiting', 'reject');

-- 3. БАЗОВЫЕ СПРАВОЧНИКИ
CREATE TABLE category (
    id SERIAL PRIMARY KEY,
    category_name VARCHAR(50) NOT NULL
);

-- 4. ПОЛЬЗОВАТЕЛИ И ПРОФИЛИ (Оптимизация 1:1)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    role user_role_type NOT NULL,
    user_name VARCHAR(25) UNIQUE NOT NULL,
    password_hash VARCHAR(256) NOT NULL,
    contact_phone VARCHAR(11) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Профили используют ID пользователя как собственный Primary Key
CREATE TABLE customer (
    id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE administrator (
    id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE seller (
    id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    inn VARCHAR(12) UNIQUE NOT NULL,
    company_name VARCHAR(50) NOT NULL
);

CREATE TABLE warehouse_manager (
    id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE
);

-- 5. КАТАЛОГ И СКЛАД
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    seller_id INTEGER REFERENCES seller(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES category(id) ON DELETE SET NULL,
    name VARCHAR(150) NOT NULL,
    price NUMERIC(12, 2) NOT NULL 
);

CREATE TABLE product_card (
    products_id INTEGER PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
    photo JSONB[], 
    description TEXT,
    type VARCHAR(30),
    brand VARCHAR(50),
    size VARCHAR(10)
);

CREATE TABLE warehouse (
    id SERIAL PRIMARY KEY,
    warehouse_manager_id INTEGER REFERENCES warehouse_manager(id) ON DELETE SET NULL,
    warehouse_address VARCHAR(100) NOT NULL
);

CREATE TABLE warehouse_stock (
    id SERIAL PRIMARY KEY,
    warehouse_id INTEGER REFERENCES warehouse(id) ON DELETE CASCADE,
    products_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 0,
    reserved_quantity INTEGER DEFAULT 0,
    CONSTRAINT unique_stock UNIQUE (warehouse_id, products_id)
);

-- 6. ЗАКАЗЫ И ЛОГИСТИКА
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customer(id) ON DELETE CASCADE,
    status order_status_type NOT NULL DEFAULT 'confirmed',
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_amount NUMERIC(12, 2) NOT NULL
);

CREATE TABLE orders_items (
    id SERIAL PRIMARY KEY,
    orders_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    products_id INTEGER REFERENCES products(id) ON DELETE RESTRICT
);

CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    orders_id INTEGER UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
    status payment_status_type NOT NULL DEFAULT 'waiting'
);

CREATE TABLE order_returns (
    id SERIAL PRIMARY KEY,
    orders_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    status return_status_type NOT NULL DEFAULT 'waiting'
);

CREATE TABLE orders_movements (
    id SERIAL PRIMARY KEY,
    warehouse_id INTEGER REFERENCES warehouse(id) ON DELETE CASCADE,
    orders_items_id INTEGER REFERENCES orders_items(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. ИНДЕКСЫ ДЛЯ ОПТИМИЗАЦИИ

-- Поиск товаров по названию
CREATE INDEX IF NOT EXISTS idx_products_name ON products USING btree (name);

-- Поиск товаров конкретного продавца
CREATE INDEX IF NOT EXISTS idx_products_seller ON products (seller_id);

-- Поиск товаров по категории
CREATE INDEX idx_products_category ON products(category_id);

-- История заказов покупателя
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders (customer_id);

-- Быстрый доступ к позициям заказа
CREATE INDEX IF NOT EXISTS idx_order_items_order ON orders_items (orders_id);

-- Проверка остатков конкретного товара
CREATE INDEX IF NOT EXISTS idx_warehouse_stock_product ON warehouse_stock (products_id);
-- Поиск по статусу заказа 
CREATE INDEX idx_orders_status ON orders(status);


--=================DATA==========================


-- КАТЕГОРИИ
INSERT INTO category (category_name) VALUES
('Electronics'),
('Clothing'),
('Home'),
('Books'),
('Sports');

-- USERS
INSERT INTO users (role,user_name,password_hash,contact_phone) VALUES
('admin','admin','hash1','79000000001'),
('seller','seller_tech','hash2','79000000002'),
('seller','seller_fashion','hash3','79000000003'),
('customer','customer_ivan','hash4','79000000004'),
('customer','customer_anna','hash5','79000000005'),
('warehouse_manager','manager_moscow','hash6','79000000006'),
('warehouse_manager','manager_spb','hash7','79000000007');


-- ===============================
-- PROFILES
-- ===============================

INSERT INTO administrator VALUES (1);

INSERT INTO seller VALUES
(2,'123456789012','Tech Store'),
(3,'987654321012','Fashion Market');

INSERT INTO customer VALUES
(4),
(5);

INSERT INTO warehouse_manager VALUES
(6),
(7);

-- PRODUCTS
INSERT INTO products (seller_id,category_id,name,price) VALUES
(2,1,'Laptop Lenovo',75000),
(2,1,'Wireless Mouse',1500),
(3,2,'Men T-shirt',1200),
(3,2,'Women Jacket',5400),
(2,4,'Programming Book',2500);

INSERT INTO product_card
(products_id, photo, description, type, brand, size)
VALUES
(1, ARRAY['{"url":"laptop.jpg"}'::jsonb], 'Gaming laptop', 'laptop', 'Lenovo', '15'),
(2, ARRAY['{"url":"mouse.jpg"}'::jsonb], 'Wireless mouse', 'mouse', 'Logitech', 'M'),
(3, ARRAY['{"url":"tshirt.jpg"}'::jsonb], 'Cotton t-shirt', 'clothes', 'Nike', 'L'),
(4, ARRAY['{"url":"jacket.jpg"}'::jsonb], 'Winter jacket', 'clothes', 'Adidas', 'XL'),
(5, ARRAY['{"url":"book.jpg"}'::jsonb], 'Learn programming', 'book', 'OReilly', '-');

-- WAREHOUSE
INSERT INTO warehouse (warehouse_manager_id,warehouse_address) VALUES
(6,'Moscow warehouse'),
(7,'Saint Petersburg warehouse');

-- STOCK
INSERT INTO warehouse_stock (warehouse_id,products_id,quantity,reserved_quantity) VALUES
(1,1,20,2),
(1,2,100,10),
(1,3,50,5),
(2,1,10,1),
(2,4,30,3),
(2,5,40,4);

-- ORDERS
INSERT INTO orders (customer_id,status,total_amount) VALUES
(4,'confirmed',76500),
(5,'packed',1200),
(4,'in_transit',5400),
(5,'delivered',2500);

-- ORDER ITEMS
INSERT INTO orders_items (orders_id,products_id) VALUES
(1,1),
(1,2),
(2,3),
(3,4),
(4,5);

-- PAYMENTS
INSERT INTO payments (orders_id,status) VALUES
(1,'paid'),
(2,'waiting'),
(3,'paid'),
(4,'paid');

-- RETURNS
INSERT INTO order_returns (orders_id,status) VALUES
(2,'waiting'),
(3,'reject'),
(4,'success');

-- ORDER MOVEMENTS
INSERT INTO orders_movements (warehouse_id,orders_items_id) VALUES
(1,1),
(1,2),
(1,3),
(2,4),
(2,5);