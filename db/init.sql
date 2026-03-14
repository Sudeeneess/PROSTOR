-- 1. УДАЛЕНИЕ СУЩЕСТВУЮЩИХ ТАБЛИЦ (для чистого перезапуска, если нужно)
DROP TABLE IF EXISTS orders_movements, payments, orders_items, order_returns, orders CASCADE;
DROP TABLE IF EXISTS movements_status, payments_status, order_returns_status, orders_status CASCADE;
DROP TABLE IF EXISTS warehouse_stock, warehouse CASCADE;
DROP TABLE IF EXISTS product_card, products, category, size, brand CASCADE;
DROP TABLE IF EXISTS warehouse_manager, seller, administrator, customer, users, roles CASCADE;

-- 2. СОЗДАНИЕ ТАБЛИЦ ПОЛЬЗОВАТЕЛЕЙ И РОЛЕЙ

CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    roles_id INTEGER NOT NULL REFERENCES roles(id),
    password_hash VARCHAR(256) NOT NULL,
    user_name VARCHAR(25) NOT NULL,
    contact_phone VARCHAR(11) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE customer (
    id SERIAL PRIMARY KEY, 
    users_id INTEGER UNIQUE NOT NULL REFERENCES users(id)
);

CREATE TABLE administrator (
    id SERIAL PRIMARY KEY, 
    users_id INTEGER UNIQUE NOT NULL REFERENCES users(id)
);

CREATE TABLE seller (
    id SERIAL PRIMARY KEY, 
    users_id INTEGER UNIQUE NOT NULL REFERENCES users(id),
    inn VARCHAR(12) UNIQUE NOT NULL,
    company_name VARCHAR(50) NOT NULL
);

CREATE TABLE warehouse_manager (
    id SERIAL PRIMARY KEY, 
    users_id INTEGER UNIQUE NOT NULL REFERENCES users(id)
);

-- 3. СОЗДАНИЕ СПРАВОЧНИКОВ И ТОВАРОВ

CREATE TABLE brand (
    id SERIAL PRIMARY KEY, 
    name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE size (
    id SERIAL PRIMARY KEY, 
    name VARCHAR(30) UNIQUE NOT NULL
);

CREATE TABLE category (
    id SERIAL PRIMARY KEY, 
    category_name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    seller_id INTEGER NOT NULL REFERENCES seller(id),
    category_id INTEGER NOT NULL REFERENCES category(id),
    parent_id INTEGER REFERENCES products(id), -- Nullable для иерархии
    name VARCHAR(150) NOT NULL,
    price DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE product_card (
    id SERIAL PRIMARY KEY,
    products_id INTEGER NOT NULL REFERENCES products(id),
    brand_id INTEGER REFERENCES brand(id),
    size_id INTEGER REFERENCES size(id),
    photo_json VARCHAR(1000),
    description TEXT NOT NULL,
    type VARCHAR(30) NOT NULL,
    is_active BOOLEAN DEFAULT true
);

-- 4. СКЛАДСКАЯ ИНФРАСТРУКТУРА

CREATE TABLE warehouse (
    id SERIAL PRIMARY KEY,
    warehouse_manager_id INTEGER NOT NULL REFERENCES warehouse_manager(id),
    warehouse_address VARCHAR(100) NOT NULL
);

CREATE TABLE warehouse_stock (
    id SERIAL PRIMARY KEY,
    warehouse_id INTEGER NOT NULL REFERENCES warehouse(id),
    products_id INTEGER NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL DEFAULT 0,
    reserved_quantity INTEGER NOT NULL DEFAULT 0,
    sold_quantity INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. СТАТУСЫ (СПРАВОЧНИКИ)

CREATE TABLE orders_status (id SERIAL PRIMARY KEY, name VARCHAR(50) UNIQUE NOT NULL);
CREATE TABLE order_returns_status (id SERIAL PRIMARY KEY, name VARCHAR(30) UNIQUE NOT NULL);
CREATE TABLE payments_status (id SERIAL PRIMARY KEY, name VARCHAR(30) UNIQUE NOT NULL);
CREATE TABLE movements_status (id SERIAL PRIMARY KEY, name VARCHAR(30) UNIQUE NOT NULL);

-- 6. ЗАКАЗЫ, ЛОГИСТИКА И ФИНАНСЫ

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customer(id),
    orders_status_id INTEGER NOT NULL REFERENCES orders_status(id),
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0
);

CREATE TABLE order_returns (
    id SERIAL PRIMARY KEY,
    order_returns_status_id INTEGER NOT NULL REFERENCES order_returns_status(id),
    return_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders_items (
    id SERIAL PRIMARY KEY,
    orders_id INTEGER NOT NULL REFERENCES orders(id),
    order_returns_id INTEGER REFERENCES order_returns(id),
    products_id INTEGER NOT NULL REFERENCES products(id),
    is_ordered BOOLEAN DEFAULT false,
    is_finalized BOOLEAN DEFAULT false,
    amount DECIMAL(12, 2) NOT NULL,
    seller_commission DECIMAL(12, 2) NOT NULL,
    net_payout DECIMAL(12, 2) NOT NULL,
    sold_at TIMESTAMP
);

CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    payments_status_id INTEGER NOT NULL REFERENCES payments_status(id),
    orders_items_id INTEGER NOT NULL REFERENCES orders_items(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders_movements (
    id SERIAL PRIMARY KEY,
    warehouse_id INTEGER NOT NULL REFERENCES warehouse(id),
    orders_items_id INTEGER NOT NULL REFERENCES orders_items(id),
    movements_status_id INTEGER NOT NULL REFERENCES movements_status(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. ЗАПОЛНЕНИЕ ДАННЫМИ (DML)

INSERT INTO roles (name) VALUES ('admin'), ('seller'), ('customer'), ('warehouse_manager');
INSERT INTO orders_status (name) VALUES ('confirmed'), ('packed'), ('in_transit'), ('delivered');
INSERT INTO payments_status (name) VALUES ('success'), ('waiting'), ('reject');
INSERT INTO order_returns_status (name) VALUES ('success'), ('waiting'), ('reject');
INSERT INTO movements_status (name) VALUES ('pending'), ('processing'), ('in_transit'), ('delivered'), ('lost'), ('returned');

-- 8. ТРИГГЕРЫ ДЛЯ АВТОМАТИЗАЦИИ СТОКА

CREATE OR REPLACE FUNCTION fn_manage_stock_logic()
RETURNS TRIGGER AS $$
BEGIN
    -- 1. ЛОГИКА РЕЗЕРВИРОВАНИЯ (Товар добавлен в заказ)
    -- Срабатывает при INSERT (is_ordered = true) или UPDATE (false -> true)
    IF (TG_OP = 'INSERT' AND NEW.is_ordered = true) OR 
       (TG_OP = 'UPDATE' AND OLD.is_ordered = false AND NEW.is_ordered = true) THEN
        UPDATE warehouse_stock 
        SET quantity = quantity - 1, 
            reserved_quantity = reserved_quantity + 1
        WHERE products_id = NEW.products_id;

    -- 2. ЛОГИКА ОТМЕНЫ БРОНИ (Заказ отменен до продажи)
    -- Срабатывает при UPDATE (true -> false), если товар еще не был продан
    ELSIF (TG_OP = 'UPDATE' AND OLD.is_ordered = true AND NEW.is_ordered = false AND NEW.is_finalized = false) THEN
        UPDATE warehouse_stock 
        SET reserved_quantity = reserved_quantity - 1, 
            quantity = quantity + 1
        WHERE products_id = NEW.products_id;

    -- 3. ЛОГИКА ПОДТВЕРЖДЕНИЯ ПРОДАЖИ (Товар оплачен и выдан)
    -- Срабатывает при UPDATE (is_finalized: false -> true)
    ELSIF (TG_OP = 'UPDATE' AND OLD.is_finalized = false AND NEW.is_finalized = true) THEN
        UPDATE warehouse_stock 
        SET reserved_quantity = reserved_quantity - 1, 
            sold_quantity = sold_quantity + 1
        WHERE products_id = NEW.products_id;

    -- 4. ЛОГИКА ВОЗВРАТА (Товар вернули после продажи)
    -- Срабатывает при UPDATE (is_finalized: true -> false)
    ELSIF (TG_OP = 'UPDATE' AND OLD.is_finalized = true AND NEW.is_finalized = false) THEN
        UPDATE warehouse_stock 
        SET sold_quantity = sold_quantity - 1, 
            quantity = quantity + 1
        WHERE products_id = NEW.products_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Создание триггера на таблицу orders_items
DROP TRIGGER IF EXISTS trg_stock_update ON orders_items;
CREATE TRIGGER trg_stock_update
AFTER INSERT OR UPDATE ON orders_items
FOR EACH ROW EXECUTE FUNCTION fn_manage_stock_logic();