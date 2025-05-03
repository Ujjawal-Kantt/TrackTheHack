// routes/problem.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/auth');


router.use(authMiddleware);

// Log a new problem and update daily points
router.post('/log', async (req, res) => {
    try {
        const {
            name,
            difficulty,
            time_taken_minutes,
            reference_link,
            struggle_level,
            used_hint,
            added_to_retry,
            notes,
            solved_at,
            tags = [],
        } = req.body;

        const userId = req.user.id;

        // Assign points based on difficulty
        let points = 0;
        if (difficulty === 'Easy') points = 1;
        if (difficulty === 'Medium') points = 3;
        if (difficulty === 'Hard') points = 5;

        // Log the problem
        const result = await pool.query(
            `INSERT INTO problems (user_id, name, difficulty, time_taken_minutes, reference_link, struggle_level, used_hint, added_to_retry, notes, solved_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
             RETURNING id`,
            [userId, name, difficulty, time_taken_minutes, reference_link, struggle_level, used_hint, added_to_retry, notes, solved_at || new Date()]
        );

        const problemId = result.rows[0].id;

        // Handle tags
        for (let tagName of tags) {
            let tag = await pool.query(`SELECT id FROM tags WHERE name = $1`, [tagName]);
            let tagId;
            if (tag.rows.length === 0) {
                const newTag = await pool.query(`INSERT INTO tags (name) VALUES ($1) RETURNING id`, [tagName]);
                tagId = newTag.rows[0].id;
            } else {
                tagId = tag.rows[0].id;
            }
            await pool.query(`INSERT INTO problem_tag_mappings (problem_id, tag_id) VALUES ($1, $2)`, [problemId, tagId]);
        }

        // Update or insert points for the current day
        const currentDate = new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD'

        // Check if points entry exists for the user on this date
        const pointsResult = await pool.query(
            `SELECT * FROM daily_points WHERE user_id = $1 AND date = $2`,
            [userId, currentDate]
        );

        if (pointsResult.rows.length > 0) {
            // If entry exists, update the total points
            await pool.query(
                `UPDATE daily_points SET total_points = total_points + $1 WHERE user_id = $2 AND date = $3`,
                [points, userId, currentDate]
            );
        } else {
            // If no entry, create a new daily points record
            await pool.query(
                `INSERT INTO daily_points (user_id, date, total_points) VALUES ($1, $2, $3)`,
                [userId, currentDate, points]
            );
        }

        res.status(201).json({ message: 'Problem logged successfully and points updated', problemId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


//  Get all problems
router.get('/get-problems', async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await pool.query(
            `SELECT * FROM problems WHERE user_id = $1 ORDER BY solved_at DESC`,
            [userId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

//  Get problem by ID
router.get('/:id', async (req, res) => {
    try {
        const userId = req.user.id;
        const problemId = req.params.id;

        const result = await pool.query(`SELECT * FROM problems WHERE id = $1 AND user_id = $2`, [problemId, userId]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Problem not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

//  Update problem by ID
router.put('/:id', async (req, res) => {
    try {
        const userId = req.user.id;
        const problemId = req.params.id;
        const {
            name,
            difficulty,
            time_taken_minutes,
            reference_link,
            struggle_level,
            used_hint,
            added_to_retry,
            notes,
            solved_at,
            tags = []
        } = req.body;

        await pool.query(
            `UPDATE problems SET name = $1, difficulty = $2, time_taken_minutes = $3, reference_link = $4, struggle_level = $5,
       used_hint = $6, added_to_retry = $7, notes = $8, solved_at = $9 WHERE id = $10 AND user_id = $11`,
            [name, difficulty, time_taken_minutes, reference_link, struggle_level, used_hint, added_to_retry, notes, solved_at, problemId, userId]
        );

        await pool.query(`DELETE FROM problem_tag_mappings WHERE problem_id = $1`, [problemId]);

        for (let tagName of tags) {
            let tag = await pool.query(`SELECT id FROM tags WHERE name = $1`, [tagName]);
            let tagId;
            if (tag.rows.length === 0) {
                const newTag = await pool.query(`INSERT INTO tags (name) VALUES ($1) RETURNING id`, [tagName]);
                tagId = newTag.rows[0].id;
            } else {
                tagId = tag.rows[0].id;
            }
            await pool.query(`INSERT INTO problem_tag_mappings (problem_id, tag_id) VALUES ($1, $2)`, [problemId, tagId]);
        }

        res.json({ message: 'Problem updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

//  Delete problem by ID
router.delete('/:id', async (req, res) => {
    try {
        const userId = req.user.id;
        const problemId = req.params.id;

        await pool.query(`DELETE FROM problems WHERE id = $1 AND user_id = $2`, [problemId, userId]);
        res.json({ message: 'Problem deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
