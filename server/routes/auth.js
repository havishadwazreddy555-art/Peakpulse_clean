const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// Register (Name, Phone, Password)
router.post('/register', async (req, res) => {
    const { name, phone_number, password, language } = req.body;

    if (!name || !phone_number || !password) {
        return res.status(400).json({ error: 'Name, Phone Number, and Password are required' });
    }

    try {
        const hashedPassword = bcrypt.hashSync(password, 10);

        // For backwards compatibility, we set username = phone_number
        const text = 'INSERT INTO users (username, name, phone_number, password, language) VALUES ($1, $2, $3, $4, $5) RETURNING id';
        const values = [phone_number, name, phone_number, hashedPassword, language || 'en'];

        const result = await db.query(text, values);
        const userId = result.rows[0].id;

        const token = jwt.sign({ id: userId, username: name, role: 'user' }, JWT_SECRET, { expiresIn: '24h' });
        res.status(201).json({ token, user: { id: userId, username: name, language: language || 'en' } });
    } catch (err) {
        if (err.code === '23505') { // Unique violation in PG
            return res.status(409).json({ error: 'Phone number already registered' });
        }
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Login (ID/Phone, Password)
router.post('/login', async (req, res) => {
    const { id, password } = req.body; // id is the phone number

    try {
        const text = 'SELECT * FROM users WHERE phone_number = $1 OR username = $2';
        const result = await db.query(text, [id, id]);
        const user = result.rows[0];

        if (!user || !bcrypt.compareSync(password, user.password)) {
            return res.status(401).json({ error: 'Invalid ID or Password' });
        }

        const token = jwt.sign({ id: user.id, username: user.name || user.username, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, user: { id: user.id, username: user.name || user.username, language: user.language } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Forgot Password (Generate OTP)
router.post('/forgot-password', async (req, res) => {
    const { phone_number } = req.body;

    try {
        const findUser = await db.query('SELECT * FROM users WHERE phone_number = $1', [phone_number]);
        const user = findUser.rows[0];

        if (!user) {
            return res.status(404).json({ error: 'Phone number not found' });
        }

        // Generate 4 digit OTP
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        // PG needs timestamp format, JS Date.toISOString() works
        const expiry = new Date(Date.now() + 10 * 60000).toISOString();

        await db.query('UPDATE users SET otp = $1, otp_expiry = $2 WHERE id = $3', [otp, expiry, user.id]);

        // SIMULATE SENDING SMS
        console.log(`[OTP SERVICE] Sending OTP to ${phone_number}: ${otp}`);

        res.json({ message: 'OTP sent to mobile number', otp_simulated: otp });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Reset Password (Verify OTP)
router.post('/reset-password', async (req, res) => {
    const { phone_number, otp, new_password } = req.body;

    try {
        const findUser = await db.query('SELECT * FROM users WHERE phone_number = $1', [phone_number]);
        const user = findUser.rows[0];

        if (!user) return res.status(404).json({ error: 'User not found' });

        if (user.otp !== otp) {
            return res.status(400).json({ error: 'Invalid OTP' });
        }

        if (new Date(user.otp_expiry) < new Date()) {
            return res.status(400).json({ error: 'OTP Expired' });
        }

        const hashedPassword = bcrypt.hashSync(new_password, 10);
        await db.query('UPDATE users SET password = $1, otp = NULL, otp_expiry = NULL WHERE id = $2', [hashedPassword, user.id]);

        res.json({ message: 'Password reset successful. Please login.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Guest Login
router.post('/guest', async (req, res) => {
    const guestName = `Guest_${Date.now()}`;
    const password = 'guest';
    const hashedPassword = bcrypt.hashSync(password, 10);

    try {
        const text = 'INSERT INTO users (username, name, phone_number, password, role) VALUES ($1, $2, $3, $4, $5) RETURNING id';
        const values = [guestName, 'Guest User', guestName, hashedPassword, 'guest'];

        const result = await db.query(text, values);
        const userId = result.rows[0].id;

        const token = jwt.sign({ id: userId, username: 'Guest', role: 'guest' }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, user: { id: userId, username: 'Guest', language: 'en', isGuest: true } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Guest login failed' });
    }
});

module.exports = router;
