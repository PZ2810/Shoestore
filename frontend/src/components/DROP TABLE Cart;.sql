DROP TABLE Cart;

CREATE TABLE IF NOT EXISTS cart (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    shoe_id INTEGER NOT NULL,
    quantity INTEGER DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (shoe_id) REFERENCES shoes(id)
);

DROP TABLE shoes;

CREATE TABLE shoes (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            price REAL NOT NULL,
            description TEXT,
            image TEXT
);

CREATE TABLE cart (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    shoe_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    image TEXT,
    isAvailable BOOLEAN NOT NULL,
    quantity INTEGER DEFAULT 1
);
CREATE TABLE reset_password_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    reset_token TEXT NOT NULL,
    expiry TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
ALTER TABLE users ADD COLUMN profile_pic TEXT;
CREATE TABLE orders (
    orderId TEXT PRIMARY KEY,
    userId INTEGER,
    shoeId INTEGER,
    name TEXT,
    price REAL,
    image TEXT,
    quantity INTEGER,
    date TEXT,
    FOREIGN KEY (userId) REFERENCES users(id)
);
