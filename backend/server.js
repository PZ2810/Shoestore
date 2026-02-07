const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const multer = require('multer'); // Import multer for file uploads
const db = require('./database');

const app = express();
const port = 5000;
const { v4: uuidv4 } = require('uuid');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // Serve static files from the 'public' folder
app.use('/profile-pictures', express.static('profile-pictures'));




const synchronizeCart = () => {
    db.all('SELECT * FROM shoes', [], (err, shoes) => {
        if (err) {
            console.error('Error fetching shoes:', err.message);
            return;
        }

        db.all('SELECT * FROM cart', [], (err, cartItems) => {
            if (err) {
                console.error('Error fetching cart items:', err.message);
                return;
            }

            cartItems.forEach(cartItem => {
                const matchingShoe = shoes.find(shoe => shoe.id === cartItem.shoe_id);

                if (matchingShoe) {
                    // Update cart item with latest shoe data
                    db.run(
                        `UPDATE cart SET 
                            name = ?, 
                            price = ?, 
                            image = ?, 
                            isAvailable = 1 
                        WHERE id = ?`,
                        [matchingShoe.name, matchingShoe.price, matchingShoe.image, cartItem.id],
                        (err) => {
                            if (err) {
                                console.error('Error updating cart:', err.message);
                            }
                        }
                    );
                } else {
                    // Mark item as unavailable if shoe is no longer in the shoes table
                    db.run(
                        `UPDATE cart SET isAvailable = 0 WHERE id = ?`,
                        [cartItem.id],
                        (err) => {
                            if (err) {
                                console.error('Error marking cart item as unavailable:', err.message);
                            }
                        }
                    );
                }
            });

            console.log('Cart synchronized with shoes table.');
        });
    });
};
















// Multer setup for image upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images/'); // Store images in 'public/images'
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    }
});

const upload = multer({ storage: storage });

// File paths for data storage
const shoesFilePath = path.join(__dirname, 'shoes.json');
const contactFilePath = path.join(__dirname, 'contact.json');

// Helper function to read data from a JSON file
const readDataFromFile = (filePath) => {
    try {
        const data = fs.readFileSync(filePath);
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading from file:', error);
        return [];
    }
};

// Helper function to write data to a JSON file
const writeDataToFile = (filePath, data) => {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error writing to file:', error);
    }
};

// Get all shoes
app.get('/api/shoes', (req, res) => {
    db.all('SELECT * FROM shoes', [], (err, rows) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.json(rows);
    });
});

// Add a new shoe
app.post('/api/shoes', upload.single('image'), (req, res) => {
    const { name, price, description } = req.body;
    const id = uuidv4();
    const image = req.file ? `http://localhost:5000/images/${req.file.filename}` : null;

    db.run(
        `INSERT INTO shoes (id, name, price, description, image) VALUES (?, ?, ?, ?, ?)`,
        [id, name, price, description, image],
        function (err) {
            if (err) {
                console.error(err.message);
                return res.status(500).json({ error: 'Failed to add shoe' });
            }
            res.status(201).json({ id, name, price, description, image });
        }
    );
});

// Update a shoe by ID
app.put('/api/shoes/:id', upload.single('image'), (req, res) => {
    const { id } = req.params;
    const { name, price, description } = req.body;
    const newImage = req.file ? `http://localhost:5000/images/${req.file.filename}` : null;

    db.get(`SELECT * FROM shoes WHERE id = ?`, [id], (err, existingShoe) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'Failed to fetch shoe' });
        }
        if (!existingShoe) {
            return res.status(404).json({ message: 'Shoe not found' });
        }

        const imageToUpdate = newImage || existingShoe.image;

        db.run(
            `UPDATE shoes SET name = ?, price = ?, description = ?, image = ? WHERE id = ?`,
            [name || existingShoe.name, price || existingShoe.price, description || existingShoe.description, imageToUpdate, id],
            function (err) {
                if (err) {
                    console.error(err.message);
                    return res.status(500).json({ error: 'Failed to update shoe' });
                }

                if (this.changes > 0) {
                    synchronizeCart(); // Synchronize cart after update
                }

                res.json({
                    id,
                    name: name || existingShoe.name,
                    price: price || existingShoe.price,
                    description: description || existingShoe.description,
                    image: imageToUpdate,
                });
            }
        );
    });
});

// Delete a shoe by ID
app.delete('/api/shoes/:id', (req, res) => {
    const { id } = req.params;

    db.run(`DELETE FROM shoes WHERE id = ?`, [id], function (err) {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'Failed to delete shoe' });
        }

        if (this.changes > 0) {
            synchronizeCart(); // Synchronize cart after delete
        }

        res.status(204).send();
    });
});


// Get contact info
app.get('/api/contact', (req, res) => {
    const contact = readDataFromFile(contactFilePath);
    res.json(contact);
});


// Update contact info
app.put('/api/contact', (req, res) => {
    const updatedContact = req.body;
    let contact = readDataFromFile(contactFilePath);
    contact = { ...contact, ...updatedContact }; // Update the contact object with the new data
    writeDataToFile(contactFilePath, contact); // Save updated contact to file
    res.json(contact); // Send the updated contact back to the client
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});











const jwt = require('jsonwebtoken');  // Install jsonwebtoken
const bcrypt = require('bcrypt');    // Install bcrypt for password hashing

// Secret key for JWT token
const JWT_SECRET = 'your_secret_key';  // Replace with a stronger secret in production

// Helper function to read and write users from the file
const usersFilePath = path.join(__dirname, 'users.json');

const readUsersFromFile = () => {
    try {
        const data = fs.readFileSync(usersFilePath);
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading from users file:', error);
        return [];
    }
};

const writeUsersToFile = (data) => {
    try {
        fs.writeFileSync(usersFilePath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error writing to users file:', error);
    }
};

// Sign up a new user
app.post('/api/signup', async (req, res) => {
    const { username, password } = req.body;

    // Check if the username already exists
    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, row) => {
        if (err) {
            return res.status(500).json({ message: 'Internal server error' });
        }

        if (row) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user into the database
        const defaultProfilePic = 'http://localhost:5000/profile-pictures/default.jpg';
        db.run('INSERT INTO users (username, password, profile_pic) VALUES (?, ?, ?)',
            [username, hashedPassword, defaultProfilePic], function (err) {
                if (err) {
                    return res.status(500).json({ message: 'Internal server error' });
                }

                res.status(201).json({ message: 'User created successfully', profilePicUrl: defaultProfilePic });
            });
    });
});



// Login a user
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    // Fetch user from database
    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
        if (err) {
            return res.status(500).json({ message: 'Internal server error' });
        }

        if (!user) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        // Check if password is correct
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET);

        // Send token and userId in the response
        res.json({ token, userId: user.id });
    });
});



// Middleware to protect routes requiring authentication
const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1]; // Get the token from the Authorization header
    if (!token) {
        return res.status(401).json({ message: 'Access denied' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }
        req.user = user; // Attach user data to the request
        next(); // Proceed to the next middleware/route handler
    });
};


// Logout (clear the token on client-side)
app.post('/api/logout', (req, res) => {
    // In the backend, there's nothing to clear as the token is stored on the client.
    res.json({ message: 'Logged out successfully' });
});

// Get the user's cart and check availability
// Get the user's cart and check availability
app.get('/api/cart', authenticateToken, (req, res) => {
    const userId = req.user.userId;

    db.all('SELECT * FROM cart WHERE user_id = ?', [userId], async (err, cartItems) => {
        if (err) {
            return res.status(500).json({ message: 'Internal server error' });
        }

        // If the cart is empty, return an empty array with 200 status
        if (cartItems.length === 0) {
            return res.status(200).json([]); // Return an empty array
        }

        // Check availability dynamically for each item
        const updatedCart = [];
        for (const item of cartItems) {
            // Check if the shoe still exists in the shoes table
            const shoeExists = await new Promise((resolve) => {
                db.get('SELECT id FROM shoes WHERE id = ?', [item.shoe_id], (err, row) => {
                    resolve(!!row); // Resolve true if shoe exists, false otherwise
                });
            });

            if (!shoeExists) {
                // Update isAvailable to 0 if the shoe no longer exists
                db.run('UPDATE cart SET isAvailable = 0 WHERE id = ?', [item.id], (updateErr) => {
                    if (updateErr) console.error('Error updating cart availability:', updateErr);
                });
                item.isAvailable = 0; // Update locally for the response
            }

            updatedCart.push(item);
        }

        res.status(200).json(updatedCart); // Return the dynamically updated cart
    });
});





// Route to add a shoe to the user's cart
// Route to add a shoe to the user's cart
app.post('/api/cart', authenticateToken, (req, res) => {
    const { shoeId, quantity } = req.body;
    const userId = req.user.userId;

    db.get('SELECT * FROM shoes WHERE id = ?', [shoeId], (err, shoe) => {
        if (err) {
            console.error('Error fetching shoe details:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }

        if (!shoe) {
            return res.status(404).json({ message: 'Shoe not found' });
        }

        db.get('SELECT * FROM cart WHERE user_id = ? AND shoe_id = ?', [userId, shoeId], (err, row) => {
            if (err) {
                return res.status(500).json({ message: 'Internal server error' });
            }

            if (row) {
                // Update quantity if shoe already in cart
                db.run(
                    'UPDATE cart SET quantity = quantity + ? WHERE user_id = ? AND shoe_id = ?',
                    [quantity, userId, shoeId],
                    (err) => {
                        if (err) {
                            return res.status(500).json({ message: 'Internal server error' });
                        }
                        res.status(200).json({ message: 'Cart updated successfully' });
                    }
                );
            } else {
                // Add new shoe to cart
                const isAvailable = shoe.isAvailable !== undefined ? shoe.isAvailable : 1;

                db.run(
                    'INSERT INTO cart (user_id, shoe_id, name, price, image, isAvailable, quantity) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [userId, shoeId, shoe.name, shoe.price, shoe.image, isAvailable, quantity],
                    (err) => {
                        if (err) {
                            return res.status(500).json({ message: 'Internal server error' });
                        }
                        res.status(201).json({ message: 'Shoe added to cart' });
                    }
                );
            }
        });
    });
});






// Route to remove a shoe from the user's cart
app.delete('/api/cart/:shoeId', authenticateToken, (req, res) => {
    const { shoeId } = req.params;
    const userId = req.user.userId;

    // Delete the shoe from the user's cart
    db.run('DELETE FROM cart WHERE user_id = ? AND shoe_id = ?', [userId, shoeId], (err) => {
        if (err) {
            return res.status(500).json({ message: 'Internal server error' });
        }

        res.status(204).send(); // No content to return
    });
});


// Update the quantity of a shoe in the cart
// Update the quantity of a shoe in the cart
app.put('/api/cart/:shoeId', authenticateToken, (req, res) => {
    const { shoeId } = req.params;
    const { quantity } = req.body;
    const userId = req.user.userId;

    if (quantity < 1) {
        return res.status(400).json({ message: 'Quantity must be at least 1' });
    }

    db.get('SELECT id FROM shoes WHERE id = ?', [shoeId], (err, shoe) => {
        if (err) {
            return res.status(500).json({ message: 'Internal server error' });
        }

        if (!shoe) {
            db.run('UPDATE cart SET isAvailable = 0 WHERE user_id = ? AND shoe_id = ?', [userId, shoeId], (err) => {
                if (err) {
                    return res.status(500).json({ message: 'Internal server error' });
                }
                return res.status(400).json({ message: 'This item is no longer available.' });
            });
        } else {
            db.run(
                'UPDATE cart SET quantity = ? WHERE user_id = ? AND shoe_id = ?',
                [quantity, userId, shoeId],
                function (err) {
                    if (err) {
                        return res.status(500).json({ message: 'Internal server error' });
                    }

                    if (this.changes === 0) {
                        return res.status(404).json({ message: 'Cart item not found' });
                    }

                    res.status(200).json({ message: 'Cart item updated successfully' });
                }
            );
        }
    });
});








const crypto = require('crypto');

app.post('/api/forgot-password', (req, res) => {
    const { username } = req.body;

    db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
        if (err) {
            return res.status(500).json({ message: 'Internal server error' });
        }

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate reset token and expiry
        const resetToken = crypto.randomBytes(32).toString('hex');
        const expiry = new Date(Date.now() + 3600000); // 1-hour expiry

        // Insert token into reset_password_requests table
        db.run(
            `INSERT INTO reset_password_requests (user_id, reset_token, expiry) VALUES (?, ?, ?)`,
            [user.id, resetToken, expiry],
            (err) => {
                if (err) {
                    return res.status(500).json({ message: 'Failed to create reset request' });
                }

                // Simulate sending the reset link (In production, use email or SMS)
                res.json({
                    message: 'Password reset link generated.',
                    resetLink: `http://localhost:3000/reset-password?token=${resetToken}`
                });
            }
        );
    });
});

app.post('/api/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;

    // Find the reset request by token and ensure it's not expired
    db.get(
        `SELECT * FROM reset_password_requests WHERE reset_token = ? AND expiry > ?`,
        [token, new Date()],
        async (err, resetRequest) => {
            if (err) {
                return res.status(500).json({ message: 'Internal server error' });
            }

            if (!resetRequest) {
                return res.status(400).json({ message: 'Invalid or expired token' });
            }

            // Update the user's password
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            db.run(
                `UPDATE users SET password = ? WHERE id = ?`,
                [hashedPassword, resetRequest.user_id],
                (err) => {
                    if (err) {
                        return res.status(500).json({ message: 'Failed to update password' });
                    }

                    // Delete the used reset token
                    db.run(
                        `DELETE FROM reset_password_requests WHERE id = ?`,
                        [resetRequest.id],
                        (err) => {
                            if (err) {
                                console.error('Failed to delete reset token:', err);
                            }
                        }
                    );

                    res.json({ message: 'Password reset successful' });
                }
            );
        }
    );
});



// Multer setup
const profilePicStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'profile-pictures/'); // Folder for profile pictures
    },
    filename: (req, file, cb) => {
        cb(null, `profilepic_${req.user.userId}${path.extname(file.originalname)}`); // Unique file name
    }
});

const profilePicUpload = multer({ storage: profilePicStorage });


// Route to upload profile picture
app.post('/api/upload-profile-pic', authenticateToken, profilePicUpload.single('profilePic'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    const profilePicUrl = `http://localhost:5000/profile-pictures/${req.file.filename}`;

    // Update profile picture URL in the database
    db.run(
        `UPDATE users SET profile_pic = ? WHERE id = ?`,
        [profilePicUrl, req.user.userId],
        (err) => {
            if (err) {
                console.error('Error updating profile picture:', err);
                return res.status(500).json({ message: 'Failed to update profile picture' });
            }

            res.json({ message: 'Profile picture uploaded successfully', profilePicUrl });
        }
    );
});



app.get('/api/user-profile', authenticateToken, (req, res) => {
    db.get(
        `SELECT profile_pic FROM users WHERE id = ?`,
        [req.user.userId],
        (err, row) => {
            if (err) {
                console.error('Error fetching user profile:', err);
                return res.status(500).json({ message: 'Internal server error' });
            }

            if (!row) {
                return res.status(404).json({ message: 'User not found' });
            }

            res.json({ profilePicUrl: row.profile_pic });
        }
    );
});



app.get('/api/orders', authenticateToken, (req, res) => {
    const userId = req.user.userId;

    db.all(`SELECT * FROM orders WHERE userId = ?`, [userId], (err, rows) => {
        if (err) {
            console.error('Error fetching orders:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }

        res.json(rows);
    });
});






// File paths for data storage
// File path for orders
const ordersFilePath = path.join(__dirname, "orders.json");

// Read and write orders
const readOrdersFromFile = () => {
    try {
        const data = fs.readFileSync(ordersFilePath);
        return JSON.parse(data);
    } catch (error) {
        console.error("Error reading orders file:", error);
        return [];
    }
};

const writeOrdersToFile = (data) => {
    try {
        fs.writeFileSync(ordersFilePath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Error writing orders file:", error);
    }
};

// POST: Create an order
app.post('/api/orders', authenticateToken, (req, res) => {
    const { shoeId, name, price, image, quantity } = req.body;
    const newOrder = {
        orderId: crypto.randomUUID(),
        userId: req.user.userId,
        shoeId,
        name,
        price,
        image,
        quantity,
        date: new Date().toISOString(),
    };

    db.run(
        `INSERT INTO orders (orderId, userId, shoeId, name, price, image, quantity, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [newOrder.orderId, newOrder.userId, newOrder.shoeId, newOrder.name, newOrder.price, newOrder.image, newOrder.quantity, newOrder.date],
        (err) => {
            if (err) {
                console.error('Error inserting order:', err);
                return res.status(500).json({ message: 'Failed to place order' });
            }

            res.status(201).json({ message: 'Order placed successfully', order: newOrder });
        }
    );
});


app.post('/api/orders/bulk', authenticateToken, (req, res) => {
    const { orders } = req.body;

    if (!Array.isArray(orders)) {
        return res.status(400).json({ message: 'Invalid orders data' });
    }

    const userId = req.user.userId;

    // Map orders to the order payload for insertion
    const newOrders = orders.map((order) => ({
        orderId: crypto.randomUUID(),
        userId,
        shoeId: order.shoeId,
        name: order.name,
        price: order.price,
        image: order.image,
        quantity: order.quantity,
        date: new Date().toISOString(),
    }));

    const placeholders = newOrders.map(() => '(?, ?, ?, ?, ?, ?, ?, ?)').join(', ');
    const values = newOrders.flatMap((order) =>
        [order.orderId, order.userId, order.shoeId, order.name, order.price, order.image, order.quantity, order.date]
    );

    db.run(
        `INSERT INTO orders (orderId, userId, shoeId, name, price, image, quantity, date) VALUES ${placeholders}`,
        values,
        function (err) {
            if (err) {
                console.error('Error inserting bulk orders:', err);
                return res.status(500).json({ message: 'Failed to place orders' });
            }

            // Extract shoeIds for deletion
            const shoeIds = orders.map(order => order.shoeId);

            // Dynamically create the right number of placeholders for IN clause
            const inPlaceholders = shoeIds.map(() => '?').join(', ');
            const deleteQuery = `DELETE FROM cart WHERE user_id = ? AND shoe_id IN (${inPlaceholders})`;

            // Combine userId with shoeIds for the query parameters
            const deleteValues = [userId, ...shoeIds];

            db.run(
                deleteQuery,
                deleteValues,
                (deleteErr) => {
                    if (deleteErr) {
                        console.error('Error removing items from cart:', deleteErr);
                        return res.status(500).json({ message: 'Orders placed but failed to clean cart' });
                    }

                    return res.status(201).json({ message: 'Orders placed successfully', orders: newOrders });
                }
            );
        }
    );
});


// DELETE: Remove an order by orderId
app.delete('/api/orders/:orderId', authenticateToken, (req, res) => {
    const { orderId } = req.params;
    const userId = req.user.userId;

    db.run(
        `DELETE FROM orders WHERE orderId = ? AND userId = ?`,
        [orderId, userId],
        function (err) {
            if (err) {
                console.error('Error deleting order:', err);
                return res.status(500).json({ message: 'Failed to delete order' });
            }

            if (this.changes === 0) {
                return res.status(404).json({ message: 'Order not found or unauthorized' });
            }

            res.status(200).json({ message: 'Order removed successfully' });
        }
    );
});


// POST: Create an order (from the cart)
app.post('/api/orders/cart', authenticateToken, (req, res) => {
    const { shoeId, name, price, image, quantity } = req.body;
    const userId = req.user.userId;
    const newOrder = {
        orderId: crypto.randomUUID(),
        userId,
        shoeId,
        name,
        price,
        image,
        quantity,
        date: new Date().toISOString(),
    };

    db.serialize(() => {
        // Insert the order into the database
        db.run(
            `INSERT INTO orders (orderId, userId, shoeId, name, price, image, quantity, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [newOrder.orderId, newOrder.userId, newOrder.shoeId, newOrder.name, newOrder.price, newOrder.image, newOrder.quantity, newOrder.date],
            (err) => {
                if (err) {
                    console.error('Error inserting order:', err);
                    return res.status(500).json({ message: 'Failed to place order' });
                }
            }
        );

        // Remove the item from the user's cart
        db.run(
            `DELETE FROM cart WHERE user_id = ? AND shoe_id = ?`,
            [userId, shoeId],
            (err) => {
                if (err) {
                    console.error('Error updating cart:', err);
                    return res.status(500).json({ message: 'Failed to update cart' });
                }

                res.status(201).json({ message: 'Order placed successfully', order: newOrder });
            }
        );

    });
});



