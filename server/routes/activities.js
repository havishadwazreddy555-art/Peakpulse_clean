const express = require('express');
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Get all activities for user
router.get('/', authMiddleware, async (req, res) => {
    try {
        const text = 'SELECT * FROM activities WHERE user_id = $1 ORDER BY date DESC, time DESC';
        const result = await db.query(text, [req.user.id]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create activity
router.post('/', authMiddleware, async (req, res) => {
    const { date, time, location, latitude, longitude, height, depth, distance, total_distance, sport_type, notes, jump_number, total_jumps, freefall_time, total_freefall_time, tunnel_time, total_tunnel_time, skill_level, dive_number, visibility, bottom_time, total_bottom_time, signature } = req.body;

    if (!date || !sport_type) {
        return res.status(400).json({ error: 'Date and sport type are required' });
    }

    const insertTime = time || '00:00';

    // Helper to convert empty strings to null for numeric fields
    const s = (val) => (val === '' ? null : val);

    try {
        const text = `
      INSERT INTO activities (user_id, date, time, location, latitude, longitude, height, depth, distance, total_distance, sport_type, notes, jump_number, total_jumps, freefall_time, total_freefall_time, tunnel_time, total_tunnel_time, skill_level, dive_number, visibility, bottom_time, total_bottom_time, signature)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)
      RETURNING id
    `;
        const values = [
            req.user.id, date, insertTime, location,
            s(latitude), s(longitude), s(height), s(depth), s(distance), s(total_distance),
            sport_type, notes,
            s(jump_number), s(total_jumps), s(freefall_time), s(total_freefall_time), s(tunnel_time), s(total_tunnel_time),
            skill_level, s(dive_number), visibility, s(bottom_time), s(total_bottom_time), signature
        ];

        const result = await db.query(text, values);
        res.status(201).json({ id: result.rows[0].id, ...req.body });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error: ' + err.message });
    }
});

// Update activity
router.put('/:id', authMiddleware, async (req, res) => {
    const { date, time, location, latitude, longitude, height, depth, distance, total_distance, sport_type, notes, jump_number, total_jumps, freefall_time, total_freefall_time, tunnel_time, total_tunnel_time, skill_level, dive_number, visibility, bottom_time, total_bottom_time, signature } = req.body;
    const { id } = req.params;

    // Helper to convert empty strings to null
    const s = (val) => (val === '' ? null : val);

    try {
        const text = `
      UPDATE activities 
      SET date = $1, time = $2, location = $3, latitude = $4, longitude = $5, height = $6, depth = $7, distance = $8, total_distance = $9, sport_type = $10, notes = $11, jump_number = $12, total_jumps = $13, freefall_time = $14, total_freefall_time = $15, tunnel_time = $16, total_tunnel_time = $17, skill_level = $18, dive_number = $19, visibility = $20, bottom_time = $21, total_bottom_time = $22, signature = $23
      WHERE id = $24 AND user_id = $25
    `;
        const values = [
            date, time, location,
            s(latitude), s(longitude), s(height), s(depth), s(distance), s(total_distance),
            sport_type, notes,
            s(jump_number), s(total_jumps), s(freefall_time), s(total_freefall_time), s(tunnel_time), s(total_tunnel_time),
            skill_level, s(dive_number), visibility, s(bottom_time), s(total_bottom_time), signature,
            id, req.user.id
        ];

        const result = await db.query(text, values);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Activity not found or unauthorized' });
        }

        res.json({ message: 'Activity updated' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error: ' + err.message });
    }
});

// Delete activity
router.delete('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;

    try {
        const result = await db.query('DELETE FROM activities WHERE id = $1 AND user_id = $2', [id, req.user.id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Activity not found or unauthorized' });
        }

        res.json({ message: 'Activity deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
