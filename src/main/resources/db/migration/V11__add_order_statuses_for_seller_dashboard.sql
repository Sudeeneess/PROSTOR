INSERT INTO orders_status (name) VALUES
    ('SHIPPED'),
    ('IN_TRANSIT'),
    ('ISSUED')
ON CONFLICT (name) DO NOTHING;
