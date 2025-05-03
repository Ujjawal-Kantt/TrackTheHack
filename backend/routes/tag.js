// routes/tag.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

//  Get all tags (preset + user-created)
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(`SELECT * FROM tags ORDER BY name ASC`);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

//  Add a new custom tag
router.post('/', async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ error: 'Tag name is required' });

        const check = await pool.query(`SELECT id FROM tags WHERE name = $1`, [name]);
        if (check.rows.length > 0) {
            return res.status(409).json({ error: 'Tag already exists' });
        }

        const result = await pool.query(`INSERT INTO tags (name) VALUES ($1) RETURNING *`, [name]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

//  (Optional) Delete a tag
router.delete('/:id', async (req, res) => {
    try {
        const tagId = req.params.id;
        await pool.query(`DELETE FROM tags WHERE id = $1`, [tagId]);
        res.json({ message: 'Tag deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
