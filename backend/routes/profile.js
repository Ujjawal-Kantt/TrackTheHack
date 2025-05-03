// routes/profile.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/auth');



router.use(authMiddleware);

//  View user's profile and stats
router.get('/', async (req, res) => {
    try {
        const userId = req.user.id;

        const userResult = await pool.query(
            `SELECT id, name, email, created_at FROM users WHERE id = $1`,
            [userId]
        );

        const statsResult = await pool.query(
            `SELECT 
        COUNT(*) FILTER (WHERE difficulty = 'Easy') AS easy_count,
        COUNT(*) FILTER (WHERE difficulty = 'Medium') AS medium_count,
        COUNT(*) FILTER (WHERE difficulty = 'Hard') AS hard_count,
        COUNT(*) AS total_problems,
        COALESCE(SUM(time_taken_minutes), 0) AS total_minutes
       FROM problems WHERE user_id = $1`,
            [userId]
        );

        const pointsResult = await pool.query(
            `SELECT COALESCE(SUM(total_points), 0) AS total_points FROM daily_points WHERE user_id = $1`,
            [userId]
        );

        res.json({
            profile: userResult.rows[0],
            stats: statsResult.rows[0],
            points: pointsResult.rows[0].total_points,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.put('/', async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, avatar } = req.body;

        await pool.query(
            `UPDATE users SET name = COALESCE($1, name), avatar = COALESCE($2, avatar) WHERE id = $3`,
            [name, avatar, userId]
        );

        res.json({ message: 'Profile updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
