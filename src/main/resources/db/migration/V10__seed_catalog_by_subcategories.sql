DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM users WHERE user_name = 'seller_pro') THEN
        RAISE EXCEPTION 'Пользователь seller_pro не найден, V10 не может быть применена';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM users WHERE user_name = 'warehouse_mgr') THEN
        RAISE EXCEPTION 'Пользователь warehouse_mgr не найден, V10 не может быть применена';
    END IF;
END $$;

INSERT INTO seller (users_id, inn, company_name)
SELECT id, '123456789012', 'ООО Найк Раша'
FROM users
WHERE user_name = 'seller_pro'
ON CONFLICT (users_id) DO NOTHING;

INSERT INTO warehouse_manager (users_id)
SELECT id
FROM users
WHERE user_name = 'warehouse_mgr'
ON CONFLICT (users_id) DO NOTHING;


DELETE FROM orders_movements om
USING orders_items oi
WHERE om.orders_items_id = oi.id;

DELETE FROM payments p
USING orders_items oi
WHERE p.orders_items_id = oi.id;

DELETE FROM orders_items;

DELETE FROM orders o
WHERE NOT EXISTS (
    SELECT 1
    FROM orders_items oi
    WHERE oi.orders_id = o.id
);

DELETE FROM warehouse_stock;
DELETE FROM product_card;
DELETE FROM products;


INSERT INTO category (category_name) VALUES
    ('Верх'),
    ('Низ'),
    ('Обувь'),
    ('Верхняя одежда'),
    ('Остальное')
ON CONFLICT (category_name) DO NOTHING;

INSERT INTO brand (name) VALUES
    ('Nike'),
    ('Adidas'),
    ('Puma'),
    ('Reebok'),
    ('New Balance'),
    ('Levi''s'),
    ('Zara'),
    ('H&M')
ON CONFLICT (name) DO NOTHING;

INSERT INTO size (name) VALUES
    ('XS'),
    ('S'),
    ('M'),
    ('L'),
    ('XL'),
    ('XXL'),
    ('39'),
    ('40'),
    ('41'),
    ('42'),
    ('43'),
    ('44'),
    ('45'),
    ('ONE_SIZE')
ON CONFLICT (name) DO NOTHING;


CREATE TEMP TABLE tmp_seed_subcategories (
    category_name VARCHAR(50) NOT NULL,
    subcategory VARCHAR(30) NOT NULL,
    base_name VARCHAR(80) NOT NULL,
    brand_name VARCHAR(50) NOT NULL,
    size_name VARCHAR(30) NOT NULL,
    base_price NUMERIC(12, 2) NOT NULL
) ON COMMIT DROP;

INSERT INTO tmp_seed_subcategories (category_name, subcategory, base_name, brand_name, size_name, base_price) VALUES
    ('Верх', 'Футболки', 'Базовая футболка', 'Nike', 'M', 1890.00),
    ('Верх', 'Рубашки', 'Повседневная рубашка', 'Zara', 'L', 2690.00),
    ('Верх', 'Свитеры', 'Теплый свитер', 'H&M', 'XL', 3190.00),

    ('Низ', 'Джинсы', 'Прямые джинсы', 'Levi''s', 'L', 4590.00),
    ('Низ', 'Брюки', 'Классические брюки', 'Zara', 'M', 3990.00),
    ('Низ', 'Шорты', 'Летние шорты', 'Adidas', 'M', 2290.00),

    ('Обувь', 'Кроссовки', 'Городские кроссовки', 'New Balance', '42', 6790.00),
    ('Обувь', 'Ботинки', 'Демисезонные ботинки', 'Reebok', '43', 7490.00),
    ('Обувь', 'Легкая обувь', 'Легкие слипоны', 'Puma', '41', 3590.00),

    ('Верхняя одежда', 'Куртки', 'Ветровка', 'Nike', 'L', 5290.00),
    ('Верхняя одежда', 'Пальто', 'Классическое пальто', 'Zara', 'XL', 8990.00),
    ('Верхняя одежда', 'Пуховики', 'Теплый пуховик', 'Adidas', 'XL', 10990.00),

    ('Остальное', 'Платья', 'Повседневное платье', 'H&M', 'M', 3990.00),
    ('Остальное', 'Аксессуары', 'Аксессуар', 'Puma', 'ONE_SIZE', 1290.00);


CREATE TEMP TABLE tmp_catalog_products (
    seller_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    brand_id INTEGER NOT NULL,
    size_id INTEGER NOT NULL,
    subcategory VARCHAR(30) NOT NULL,
    product_name VARCHAR(150) NOT NULL,
    product_price NUMERIC(12, 2) NOT NULL,
    photo_url VARCHAR(255) NOT NULL
) ON COMMIT DROP;

INSERT INTO tmp_catalog_products (
    seller_id,
    category_id,
    brand_id,
    size_id,
    subcategory,
    product_name,
    product_price,
    photo_url
)
SELECT
    s.id AS seller_id,
    c.id AS category_id,
    b.id AS brand_id,
    sz.id AS size_id,
    seed.subcategory,
    LEFT(seed.base_name || ' ' || seed.subcategory || ' #' || gs.n::text, 150) AS product_name,
    (seed.base_price + ((gs.n - 1) * 180))::NUMERIC(12, 2) AS product_price,
    CASE seed.subcategory
        WHEN 'Футболки' THEN '/images/products/top-tshirts.jpg'
        WHEN 'Рубашки' THEN '/images/products/top-shirts.jpg'
        WHEN 'Свитеры' THEN '/images/products/top-sweaters.jpeg'
        WHEN 'Джинсы' THEN '/images/products/bottom-jeans.jpg'
        WHEN 'Брюки' THEN '/images/products/bottom-trousers.jpg'
        WHEN 'Шорты' THEN '/images/products/bottom-shorts.jpg'
        WHEN 'Кроссовки' THEN '/images/products/shoes-sneakers.jpg'
        WHEN 'Ботинки' THEN '/images/products/shoes-boots.jpeg'
        WHEN 'Легкая обувь' THEN '/images/products/shoes-light.jpeg'
        WHEN 'Куртки' THEN '/images/products/outer-jackets.jpeg'
        WHEN 'Пальто' THEN '/images/products/outer-coats.jpg'
        WHEN 'Пуховики' THEN '/images/products/outer-down.jpg'
        WHEN 'Платья' THEN '/images/products/misc-dresses.jpeg'
        WHEN 'Аксессуары' THEN '/images/products/misc-accessories.jpg'
        ELSE '/images/products/default.svg'
    END AS photo_url
FROM tmp_seed_subcategories seed
JOIN category c ON c.category_name = seed.category_name
JOIN brand b ON b.name = seed.brand_name
JOIN size sz ON sz.name = seed.size_name
JOIN seller s ON s.users_id = (SELECT id FROM users WHERE user_name = 'seller_pro' LIMIT 1)
CROSS JOIN generate_series(1, 5) AS gs(n);

INSERT INTO products (seller_id, category_id, parent_id, name, price)
SELECT
    cp.seller_id,
    cp.category_id,
    NULL,
    cp.product_name,
    cp.product_price
FROM tmp_catalog_products cp;

CREATE TEMP TABLE tmp_inserted_products AS
SELECT
    p.id AS product_id,
    cp.brand_id,
    cp.size_id,
    cp.subcategory,
    cp.product_name,
    cp.photo_url
FROM products p
JOIN tmp_catalog_products cp
    ON cp.seller_id = p.seller_id
    AND cp.product_name = p.name;


INSERT INTO product_card (products_id, brand_id, size_id, description, type, is_active, photo)
SELECT
    ip.product_id,
    ip.brand_id,
    ip.size_id,
    'Подкатегория: ' || ip.subcategory || '. Модель: ' || ip.product_name || '. Материал и детали уточняются в характеристиках.',
    ip.subcategory,
    true,
    jsonb_build_array(
        jsonb_build_object(
            'url', ip.photo_url,
            'alt', ip.product_name
        )
    )
FROM tmp_inserted_products ip;


DO $$
DECLARE
    v_warehouse_id INTEGER;
    v_manager_id INTEGER;
BEGIN
    SELECT w.id
    INTO v_warehouse_id
    FROM warehouse w
    ORDER BY w.id
    LIMIT 1;

    IF v_warehouse_id IS NULL THEN
        SELECT wm.id
        INTO v_manager_id
        FROM warehouse_manager wm
        JOIN users u ON u.id = wm.users_id
        WHERE u.user_name = 'warehouse_mgr'
        LIMIT 1;

        IF v_manager_id IS NULL THEN
            RAISE EXCEPTION 'warehouse_mgr не найден, невозможно создать склад для сидов V10';
        END IF;

        INSERT INTO warehouse (warehouse_manager_id, warehouse_address)
        VALUES (v_manager_id, 'Москва, ул. Складская, д. 10')
        RETURNING id INTO v_warehouse_id;
    END IF;

    INSERT INTO warehouse_stock (warehouse_id, products_id, quantity, reserved_quantity, sold_quantity)
    SELECT
        v_warehouse_id,
        ip.product_id,
        25 + ((ROW_NUMBER() OVER (ORDER BY ip.product_id) - 1) % 5) * 5,
        0,
        0
    FROM tmp_inserted_products ip;
END $$;
