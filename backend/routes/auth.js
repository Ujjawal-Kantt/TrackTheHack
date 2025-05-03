const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../db');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
dotenv.config();

const router = express.Router();

// Signup route
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Check if user already exists
        const checkUserQuery = `SELECT email FROM users WHERE email = $1`;
        const userCheckResult = await pool.query(checkUserQuery, [email]);
        if (userCheckResult.rows.length > 0) {
            return res.status(400).json({ error: 'Email is already registered.' });
        }

        // Insert new user into the database
        const insertUserQuery = `
            INSERT INTO users (name, email, password_hash)
            VALUES ($1, $2, $3)
            RETURNING id
        `;
        const values = [name, email, hashedPassword];
        const result = await pool.query(insertUserQuery, values);

        const userId = result.rows[0].id;

        res.status(200).json({
            message: 'Registered successfully.',
            userId: userId,
        });
    } catch (error) {
        console.error('Error during signup:', error);
        res.status(500).json({ error: 'Signup failed. Please try again later.' });
    }
});

// Login route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if user exists
        const checkUserQuery = `SELECT id, email, password_hash FROM users WHERE email = $1`;
        const userResult = await pool.query(checkUserQuery, [email]);

        if (userResult.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid email or password.' });
        }

        const user = userResult.rows[0];

        // Compare the entered password with the hashed password in the database
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid email or password.' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email }, // Payload
            process.env.JWT_SECRET,
            { expiresIn: '1h' } // Token expiration time
        );

        // Send response with JWT token
        res.status(200).json({
            message: 'Login successful.',
            jwtToken: token,
            userId: user.id,
        });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Login failed. Please try again later.' });
    }
});

module.exports = router;