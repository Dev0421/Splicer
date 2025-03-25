const bcrypt = require('bcryptjs');
const db = require('../config/db');
const jwt = require('jsonwebtoken');
require('dotenv').config(); // Ensure .env is loaded

const SECRET_KEY = process.env.SECRET_KEY;

exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        console.log(req.body);
        // Check if the user already exists
        db.get('SELECT * FROM users WHERE username = ? OR email = ?', [username, email], async (err, existingUser) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            if (existingUser) return res.status(400).json({ error: 'User already exists' });

            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Insert new user
            db.run('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, hashedPassword], function (err) {
                if (err) return res.status(500).json({ error: 'Failed to register user' });
                res.status(201).json({ message: 'User registered successfully' });
            });
        });

    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

exports.login = (req, res) => {
    const { email, password } = req.body;

    console.log(email);
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (!user) return res.status(400).json({ error: 'Invalid email or password' });

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Invalid email or password' });
        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, username: user.username },
            SECRET_KEY,
            { expiresIn: '1h' }
        );

        return res.status(200).json({
            message: 'Login successful',
            user: { username: user.username, email: user.email },
            token: "Bearer " + token,
        });
    });
};
