// routes/points.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

//  GET daily points for current month (for heatmap)
router.get('/daily', async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      `SELECT DATE(solved_at) as date, SUM(
         CASE 
           WHEN difficulty = 'Easy' THEN 1
           WHEN difficulty = 'Medium' THEN 3
           WHEN difficulty = 'Hard' THEN 5
           ELSE 0
         END
       ) as points
       FROM problems
       WHERE user_id = $1 AND DATE_TRUNC('month', solved_at) = DATE_TRUNC('month', CURRENT_DATE)
       GROUP BY DATE(solved_at)
       ORDER BY date`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//  GET total points, weekly/monthly progress
router.get('/summary', async (req, res) => {
  try {
    const userId = req.user.id;
    const summary = await pool.query(
      `SELECT
         SUM(CASE 
           WHEN difficulty = 'Easy' THEN 1
           WHEN difficulty = 'Medium' THEN 3
           WHEN difficulty = 'Hard' THEN 5
           ELSE 0
         END) as total_points,
         SUM(CASE WHEN solved_at >= CURRENT_DATE - INTERVAL '7 days' THEN 
           CASE 
             WHEN difficulty = 'Easy' THEN 1
             WHEN difficulty = 'Medium' THEN 3
             WHEN difficulty = 'Hard' THEN 5
             ELSE 0
           END ELSE 0 END) as weekly_points,
         SUM(CASE WHEN DATE_TRUNC('month', solved_at) = DATE_TRUNC('month', CURRENT_DATE) THEN 
           CASE 
             WHEN difficulty = 'Easy' THEN 1
             WHEN difficulty = 'Medium' THEN 3
             WHEN difficulty = 'Hard' THEN 5
             ELSE 0
           END ELSE 0 END) as monthly_points
       FROM problems
       WHERE user_id = $1`,
      [userId]
    );
    res.json(summary.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//  GET problems and points on a specific date
router.get('/:date', async (req, res) => {
  try {
    const userId = req.user.id;
    const date = req.params.date; // Format: YYYY-MM-DD

    const result = await pool.query(
      `SELECT *,
         CASE 
           WHEN difficulty = 'Easy' THEN 1
           WHEN difficulty = 'Medium' THEN 3
           WHEN difficulty = 'Hard' THEN 5
           ELSE 0
         END as points
       FROM problems
       WHERE user_id = $1 AND DATE(solved_at) = $2
       ORDER BY solved_at DESC`,
      [userId, date]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
