CREATE TABLE IF NOT EXISTS goods_reception (
    id SERIAL PRIMARY KEY,
    seller_id INTEGER NOT NULL REFERENCES seller(id),
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    accepted_at TIMESTAMP NULL,
    accepted_by_warehouse_manager_id INTEGER NULL REFERENCES warehouse_manager(id),
    CONSTRAINT chk_goods_reception_status
        CHECK (status IN ('PENDING', 'ACCEPTED'))
);

ALTER TABLE products
    ADD COLUMN IF NOT EXISTS reception_id INTEGER NULL;

ALTER TABLE products
    ADD CONSTRAINT fk_products_reception
        FOREIGN KEY (reception_id) REFERENCES goods_reception(id);

WITH seeded AS (
    INSERT INTO goods_reception (seller_id, status, created_at, accepted_at, accepted_by_warehouse_manager_id)
    SELECT
        p.seller_id,
        'ACCEPTED',
        COALESCE(MIN(p.created_at), CURRENT_TIMESTAMP),
        CURRENT_TIMESTAMP,
        NULL
    FROM products p
    WHERE p.reception_id IS NULL
    GROUP BY p.seller_id
    RETURNING id, seller_id
)
UPDATE products p
SET reception_id = s.id
FROM seeded s
WHERE p.seller_id = s.seller_id
  AND p.reception_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_goods_reception_seller_id
    ON goods_reception(seller_id);

CREATE INDEX IF NOT EXISTS idx_goods_reception_status
    ON goods_reception(status);

CREATE UNIQUE INDEX IF NOT EXISTS uq_goods_reception_pending_per_seller
    ON goods_reception(seller_id)
    WHERE status = 'PENDING';
