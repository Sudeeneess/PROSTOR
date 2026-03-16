DROP TABLE IF EXISTS orders_movements, payments, orders_items, order_returns, orders CASCADE;
DROP TABLE IF EXISTS movements_status, payments_status, order_returns_status, orders_status CASCADE;
DROP TABLE IF EXISTS warehouse_stock, warehouse CASCADE;
DROP TABLE IF EXISTS product_card, products, category, size, brand CASCADE;
DROP TABLE IF EXISTS warehouse_manager, seller, administrator, customer, users, roles CASCADE;

CREATE TABLE IF NOT EXISTS customer (
    id SERIAL PRIMARY KEY, 
    users_id INTEGER UNIQUE NOT NULL REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS administrator (
    id SERIAL PRIMARY KEY, 
    users_id INTEGER UNIQUE NOT NULL REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS seller (
    id SERIAL PRIMARY KEY, 
    users_id INTEGER UNIQUE NOT NULL REFERENCES users(id),
    inn VARCHAR(12) UNIQUE NOT NULL,
    company_name VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS warehouse_manager (
    id SERIAL PRIMARY KEY, 
    users_id INTEGER UNIQUE NOT NULL REFERENCES users(id)
);

-- 3. КАТАЛОГ ТОВАРОВ
CREATE TABLE IF NOT EXISTS brand (id SERIAL PRIMARY KEY, name VARCHAR(50) UNIQUE NOT NULL);
CREATE TABLE IF NOT EXISTS size (id SERIAL PRIMARY KEY, name VARCHAR(30) UNIQUE NOT NULL);
CREATE TABLE IF NOT EXISTS category (id SERIAL PRIMARY KEY, category_name VARCHAR(50) UNIQUE NOT NULL);

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    seller_id INTEGER NOT NULL REFERENCES seller(id),
    category_id INTEGER NOT NULL REFERENCES category(id),
    parent_id INTEGER REFERENCES products(id),
    name VARCHAR(150) NOT NULL,
    price DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS product_card (
    id SERIAL PRIMARY KEY,
    products_id INTEGER NOT NULL REFERENCES products(id),
    brand_id INTEGER REFERENCES brand(id),
    size_id INTEGER REFERENCES size(id),
    photo JSONB NOT NULL DEFAULT '[]'::jsonb,
    description TEXT NOT NULL,
    type VARCHAR(30) NOT NULL,
    is_active BOOLEAN DEFAULT true
);

-- 4. СКЛАДСКАЯ ИНФРАСТРУКТУРА
CREATE TABLE IF NOT EXISTS warehouse (
    id SERIAL PRIMARY KEY,
    warehouse_manager_id INTEGER NOT NULL REFERENCES warehouse_manager(id),
    warehouse_address VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS warehouse_stock (
    id SERIAL PRIMARY KEY,
    warehouse_id INTEGER NOT NULL REFERENCES warehouse(id),
    products_id INTEGER NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL DEFAULT 0,
    reserved_quantity INTEGER NOT NULL DEFAULT 0,
    sold_quantity INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. СИСТЕМА СТАТУСОВ И ЗАКАЗОВ
CREATE TABLE IF NOT EXISTS orders_status (id SERIAL PRIMARY KEY, name VARCHAR(50) UNIQUE NOT NULL);
CREATE TABLE IF NOT EXISTS order_returns_status (id SERIAL PRIMARY KEY, name VARCHAR(30) UNIQUE NOT NULL);
CREATE TABLE IF NOT EXISTS payments_status (id SERIAL PRIMARY KEY, name VARCHAR(30) UNIQUE NOT NULL);
CREATE TABLE IF NOT EXISTS movements_status (id SERIAL PRIMARY KEY, name VARCHAR(30) UNIQUE NOT NULL);

CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customer(id),
    orders_status_id INTEGER NOT NULL REFERENCES orders_status(id),
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS order_returns (
    id SERIAL PRIMARY KEY,
    order_returns_status_id INTEGER NOT NULL REFERENCES order_returns_status(id),
    return_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders_items (
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

CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    payments_status_id INTEGER NOT NULL REFERENCES payments_status(id),
    orders_items_id INTEGER NOT NULL REFERENCES orders_items(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders_movements (
    id SERIAL PRIMARY KEY,
    warehouse_id INTEGER NOT NULL REFERENCES warehouse(id),
    orders_items_id INTEGER NOT NULL REFERENCES orders_items(id),
    movements_status_id INTEGER NOT NULL REFERENCES movements_status(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. СКЛАДСКАЯ ЛОГИКА (ТРИГГЕР)
CREATE OR REPLACE FUNCTION fn_manage_stock_logic()
RETURNS TRIGGER AS $$
DECLARE
    current_stock INTEGER;
BEGIN
    IF (TG_OP = 'INSERT' AND NEW.is_ordered = true) OR 
       (TG_OP = 'UPDATE' AND OLD.is_ordered = false AND NEW.is_ordered = true) THEN
        SELECT quantity INTO current_stock FROM warehouse_stock WHERE products_id = NEW.products_id;
        IF current_stock <= 0 OR current_stock IS NULL THEN
            RAISE EXCEPTION 'Ошибка: Товар с ID % отсутствует на складе', NEW.products_id;
        END IF;
        UPDATE warehouse_stock SET quantity = quantity - 1, reserved_quantity = reserved_quantity + 1 WHERE products_id = NEW.products_id;
    ELSIF (TG_OP = 'UPDATE' AND OLD.is_ordered = true AND NEW.is_ordered = false AND NEW.is_finalized = false) THEN
        UPDATE warehouse_stock SET reserved_quantity = reserved_quantity - 1, quantity = quantity + 1 WHERE products_id = NEW.products_id;
    ELSIF (TG_OP = 'UPDATE' AND OLD.is_finalized = false AND NEW.is_finalized = true) THEN
        UPDATE warehouse_stock SET reserved_quantity = reserved_quantity - 1, sold_quantity = sold_quantity + 1 WHERE products_id = NEW.products_id;
    ELSIF (TG_OP = 'UPDATE' AND OLD.is_finalized = true AND NEW.is_finalized = false) THEN
        UPDATE warehouse_stock SET sold_quantity = sold_quantity - 1, quantity = quantity + 1 WHERE products_id = NEW.products_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_stock_update ON orders_items;
CREATE TRIGGER trg_stock_update
AFTER INSERT OR UPDATE ON orders_items
FOR EACH ROW EXECUTE FUNCTION fn_manage_stock_logic();

-- 8. ИНДЕКСЫ
CREATE INDEX IF NOT EXISTS idx_users_roles_id ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_users_user_name ON users(user_name);
CREATE INDEX IF NOT EXISTS idx_customer_users_id ON customer(users_id);
CREATE INDEX IF NOT EXISTS idx_administrator_users_id ON administrator(users_id);
CREATE INDEX IF NOT EXISTS idx_seller_users_id ON seller(users_id);
CREATE INDEX IF NOT EXISTS idx_warehouse_manager_users_id ON warehouse_manager(users_id);

CREATE INDEX IF NOT EXISTS idx_products_seller_id ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_parent_id ON products(parent_id);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_product_card_products_id ON product_card(products_id);
CREATE INDEX IF NOT EXISTS idx_product_card_brand_id ON product_card(brand_id);
CREATE INDEX IF NOT EXISTS idx_product_card_size_id ON product_card(size_id);
CREATE INDEX IF NOT EXISTS idx_product_card_photo_gin ON product_card USING GIN (photo);

CREATE INDEX IF NOT EXISTS idx_warehouse_warehouse_manager_id ON warehouse(warehouse_manager_id);
CREATE INDEX IF NOT EXISTS idx_warehouse_stock_warehouse_id ON warehouse_stock(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_warehouse_stock_products_id ON warehouse_stock(products_id);
CREATE INDEX IF NOT EXISTS idx_warehouse_stock_quantity ON warehouse_stock(quantity);

CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_orders_status_id ON orders(orders_status_id);
CREATE INDEX IF NOT EXISTS idx_order_returns_order_returns_status_id ON order_returns(order_returns_status_id);
CREATE INDEX IF NOT EXISTS idx_orders_items_orders_id ON orders_items(orders_id);
CREATE INDEX IF NOT EXISTS idx_orders_items_order_returns_id ON orders_items(order_returns_id);
CREATE INDEX IF NOT EXISTS idx_orders_items_products_id ON orders_items(products_id);
CREATE INDEX IF NOT EXISTS idx_orders_items_sold_at ON orders_items(sold_at);
CREATE INDEX IF NOT EXISTS idx_payments_payments_status_id ON payments(payments_status_id);
CREATE INDEX IF NOT EXISTS idx_payments_orders_items_id ON payments(orders_items_id);
CREATE INDEX IF NOT EXISTS idx_orders_movements_warehouse_id ON orders_movements(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_orders_movements_orders_items_id ON orders_movements(orders_items_id);
CREATE INDEX IF NOT EXISTS idx_orders_movements_movements_status_id ON orders_movements(movements_status_id);