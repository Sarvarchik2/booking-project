const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');

// Mechanic Login
router.post('/login', [
  body('email').isEmail(),
  body('password').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password } = req.body;

    const result = await pool.query(
  'SELECT * FROM mechanics WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const mechanic = result.rows[0];
    
    if (!mechanic.password_hash) {
      return res.status(401).json({ error: 'Account not activated. Please contact administrator.' });
    }

    const isMatch = await bcrypt.compare(password, mechanic.password_hash);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { mechanic_id: mechanic.mechanic_id, email: mechanic.email, role: 'mechanic' },
      process.env.JWT_SECRET || 'your_jwt_secret_key_change_this_in_production',
      { expiresIn: '7d' }
    );

    const { password_hash, ...mechanicData } = mechanic;
    res.json({ mechanic: mechanicData, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Set password for mechanic (first-time setup)
router.post('/set-password', [
  body('email').isEmail(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password } = req.body;

    const result = await pool.query(
  'SELECT * FROM mechanics WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Mechanic not found' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    await pool.query(
  'UPDATE mechanics SET password_hash = $1 WHERE email = $2',
      [password_hash, email]
    );

    res.json({ message: 'Password set successfully. You can now login.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all mechanics
router.get('/', async (req, res) => {
  try {
    const { available } = req.query;
    let query = 'SELECT * FROM mechanics WHERE 1=1';
    const params = [];

    if (available !== undefined) {
      params.push(available === 'true');
      query += ` AND is_available = $${params.length}`;
    }

    query += ' ORDER BY last_name, first_name';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get a specific mechanic
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM mechanics WHERE mechanic_id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Mechanic not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get mechanic's bookings
router.get('/:id/bookings', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT b.*, 
              c.first_name as customer_first_name, c.last_name as customer_last_name,
              v.make, v.model, v.year,
              st.name as service_name
       FROM bookings b
       LEFT JOIN customers c ON b.customer_id = c.customer_id
       LEFT JOIN vehicles v ON b.vehicle_id = v.vehicle_id
       LEFT JOIN service_types st ON b.service_type_id = st.service_type_id
       WHERE b.mechanic_id = $1
       ORDER BY b.booking_date DESC, b.booking_time DESC`,
      [id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add a new mechanic
router.post('/', async (req, res) => {
  try {
    const { first_name, last_name, email, phone, specialization, hourly_rate } = req.body;

    if (!first_name || !last_name || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await pool.query(
      `INSERT INTO mechanics (first_name, last_name, email, phone, specialization, hourly_rate)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [first_name, last_name, email, phone, specialization, hourly_rate]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    if (error.code === '23505') {
      res.status(400).json({ error: 'Mechanic with this email already exists' });
    } else {
      res.status(500).json({ error: 'Server error' });
    }
  }
});

// Update a mechanic
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, phone, specialization, hourly_rate, is_available } = req.body;

    const result = await pool.query(
      `UPDATE mechanics 
       SET first_name = COALESCE($1, first_name),
           last_name = COALESCE($2, last_name),
           phone = COALESCE($3, phone),
           specialization = COALESCE($4, specialization),
           hourly_rate = COALESCE($5, hourly_rate),
           is_available = COALESCE($6, is_available),
           updated_at = CURRENT_TIMESTAMP
       WHERE mechanic_id = $7
       RETURNING *`,
      [first_name, last_name, phone, specialization, hourly_rate, is_available, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Mechanic not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a mechanic
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM mechanics WHERE mechanic_id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Mechanic not found' });
    }

    res.json({ message: 'Mechanic deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
