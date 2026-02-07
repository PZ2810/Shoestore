-- SQLite
CREATE TABLE cart (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT NOT NULL,
    shoeId TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    FOREIGN KEY (shoeId) REFERENCES shoes (id),
    FOREIGN KEY (userId) REFERENCES users (id)
);
