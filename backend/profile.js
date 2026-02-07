const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateToken } = require('./server');
const usersFilePath = path.join(__dirname, 'users.json');

const router = express.Router();

// Multer setup for profile picture upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'profile-pictures/'); // Store profile pictures in 'profile-pictures' folder
    },
    filename: (req, file, cb) => {
        const userId = req.user.userId;
        cb(null, `profilepic_${userId}.png`);  // Dynamically assign profile picture based on user ID
    }
});

const upload = multer({ storage: storage });

// Helper function to read users from the users.json file
const readUsersFromFile = () => {
    try {
        const data = fs.readFileSync(usersFilePath);
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading from users file:', error);
        return [];
    }
};

// Helper function to write updated users data to the users.json file
const writeUsersToFile = (data) => {
    try {
        fs.writeFileSync(usersFilePath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error writing to users file:', error);
    }
};

// Route to upload a new profile picture
router.post('/api/upload-profile-pic', authenticateToken, upload.single('profile-pic'), (req, res) => {
    const userId = req.user.userId;
    const users = readUsersFromFile();

    const user = users.find(u => u.id === userId);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    // If a new profile picture is uploaded, update the user's profile-pic field
    user['profile-pic'] = `http://localhost:5000/profile-pictures/profilepic_${userId}.png`;

    // Save the updated user data to the file
    writeUsersToFile(users);

    res.json({ message: 'Profile picture uploaded successfully', profilePicUrl: user['profile-pic'] });
});

// Route to get the current user's profile picture
router.get('/api/profile-pic', authenticateToken, (req, res) => {
    const userId = req.user.userId;
    const users = readUsersFromFile();

    const user = users.find(u => u.id === userId);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    res.json({ profilePicUrl: user['profile-pic'] });
});

module.exports = router;
