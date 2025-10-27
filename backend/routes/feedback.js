const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Get all feedback
router.get('/', async (req, res) => {
  try {
    const { customerId, mechanicId, bookingId } = req.query;
    let query = `
      SELECT f.*, 
             c.first_name as customer_first_name, c.last_name as customer_last_name,
             m.first_name as mechanic_first_name, m.last_name as mechanic_last_name,
             b.booking_date
      FROM feedback f
      LEFT JOIN customers c ON f.customer_id = c.customer_id
      LEFT JOIN mechanics m ON f.mechanic_id = m.mechanic_id
      LEFT JOIN bookings b ON f.booking_id = b.booking_id
      WHERE 1=1
    `;
    
    const params = [];
    if (customerId) {
      params.push(customerId);
      query += ` AND f.customer_id = ?`;
    }
    if (mechanicId) {
      params.push(mechanicId);
      query += ` AND f.mechanic_id = ?`;
    }
    if (bookingId) {
      params.push(bookingId);
      query += ` AND f.booking_id = ?`;
    }

    query += ' ORDER BY f.created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get a specific feedback
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT f.*, 
              c.first_name as customer_first_name, c.last_name as customer_last_name,
              m.first_name as mechanic_first_name, m.last_name as mechanic_last_name,
              b.booking_date, b.booking_time
       FROM feedback f
       LEFT JOIN customers c ON f.customer_id = c.customer_id
       LEFT JOIN mechanics m ON f.mechanic_id = m.mechanic_id
       LEFT JOIN bookings b ON f.booking_id = b.booking_id
       WHERE f.feedback_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new feedback
router.post('/', async (req, res) => {
  try {
    const { booking_id, customer_id, mechanic_id, rating, comment } = req.body;

    if (!customer_id || !rating) {
      return res.status(400).json({ error: 'Customer ID and rating are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const result = await pool.query(
      `INSERT INTO feedback (booking_id, customer_id, mechanic_id, rating, comment)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [booking_id, customer_id, mechanic_id, rating, comment]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update feedback
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const result = await pool.query(
      `UPDATE feedback 
       SET rating = COALESCE($1, rating),
           comment = COALESCE($2, comment)
       WHERE feedback_id = $3
       RETURNING *`,
      [rating, comment, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete feedback
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM feedback WHERE feedback_id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    res.json({ message: 'Feedback deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get average rating for a mechanic
router.get('/mechanic/:mechanicId/average', async (req, res) => {
  try {
    const { mechanicId } = req.params;
    const result = await pool.query(
      `SELECT 
         AVG(rating) as average_rating,
         COUNT(*) as total_reviews
       FROM feedback
       WHERE mechanic_id = $1`,
      [mechanicId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
