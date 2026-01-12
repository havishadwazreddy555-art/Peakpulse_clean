const express = require('express');
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Reset Demo Data
router.post('/reset-demo', authMiddleware, async (req, res) => {
    // In a real app, check for 'admin' role
    // if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });

    try {
        // For this demo, we'll just delete activities of the current user if they are a guest
        if (req.user.role === 'guest') {
            await db.query('DELETE FROM activities WHERE user_id = $1', [req.user.id]);
            return res.json({ message: 'Guest data reset successfully' });
        }

        // If global admin reset
        if (req.user.username === 'admin') {
            await db.query('DELETE FROM activities');
            await db.query("DELETE FROM users WHERE role = 'guest'");
            return res.json({ message: 'Global demo reset successful' });
        }

        res.status(403).json({ error: 'Unauthorized to reset global data' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
