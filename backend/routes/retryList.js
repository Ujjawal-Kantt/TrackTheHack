// routes/retryList.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/auth');


router.use(authMiddleware);

//  Add a problem to retry list
router.post('/', async (req, res) => {
    try {
        const userId = req.user.id;
        const { problem_id } = req.body;

        await pool.query(
            `INSERT INTO retry_queue (user_id, problem_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
            [userId, problem_id]
        );

        res.status(201).json({ message: 'Added to retry list' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

//  Get all retry problems
router.get('/', async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await pool.query(
            `SELECT p.* FROM retry_queue rq
       JOIN problems p ON p.id = rq.problem_id
       WHERE rq.user_id = $1
       ORDER BY rq.added_on DESC`,
            [userId]
        );

        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

//  Remove a problem from retry list
router.delete('/:problemId', async (req, res) => {
    try {
        const userId = req.user.id;
        const { problemId } = req.params;

        await pool.query(
            `DELETE FROM retry_queue WHERE user_id = $1 AND problem_id = $2`,
            [userId, problemId]
        );

        res.json({ message: 'Removed from retry list' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
