// utils.js
const fs = require('fs');
const path = require('path');

const usersFilePath = path.join(__dirname, 'users.json');

const readDataFromFile = () => {
    try {
        const data = fs.readFileSync(usersFilePath);
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading from users file:', error);
        return [];
    }
};

const writeDataToFile = (data) => {
    try {
        fs.writeFileSync(usersFilePath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error writing to users file:', error);
    }
};

module.exports = { readDataFromFile, writeDataToFile };
