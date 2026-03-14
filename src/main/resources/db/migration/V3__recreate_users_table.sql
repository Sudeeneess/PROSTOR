DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE IF NOT EXISTS users(
    id SERIAL PRIMARY KEY,
    role_id INT REFERENCES roles(id),
    user_name VARCHAR(25) unique NOT NULL,
    password_hash VARCHAR(25) unique  NOT NULL,
    contact_phone VARCHAR(11) unique NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);