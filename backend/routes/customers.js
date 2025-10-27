const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');

// Register a new customer
router.post('/register', [
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('first_name').notEmpty(),
  body('last_name').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { first_name, last_name, email, password, phone, address, city, state, zip_code } = req.body;

    // Check if customer already exists
    const existingCustomer = await pool.query(
      'SELECT * FROM customers WHERE email = $1',
      [email]
    );

    if (existingCustomer.rows.length > 0) {
      return res.status(400).json({ error: 'Customer with this email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Insert new customer
    const result = await pool.query(
      `INSERT INTO customers (first_name, last_name, email, password_hash, phone, address, city, state, zip_code)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING customer_id, first_name, last_name, email, phone, created_at`,
      [first_name, last_name, email, password_hash, phone, address, city, state, zip_code]
    );

    const customer = result.rows[0];

    // Generate JWT token
    const token = jwt.sign(
      { customer_id: customer.customer_id, email: customer.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({ customer, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Login
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
      'SELECT * FROM customers WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const customer = result.rows[0];
    const isMatch = await bcrypt.compare(password, customer.password_hash);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { customer_id: customer.customer_id, email: customer.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password_hash, ...customerData } = customer;
    res.json({ customer: customerData, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Get customer by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT customer_id, first_name, last_name, email, phone, address, city, state, zip_code, created_at FROM customers WHERE customer_id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get customer history (bookings, invoices, feedback)
router.get('/:id/history', async (req, res) => {
  try {
    const { id } = req.params;

    // Get all bookings with related data
    const bookings = await pool.query(
      `SELECT b.*, v.make, v.model, v.year, st.name as service_name,
              m.first_name as mechanic_first_name, m.last_name as mechanic_last_name
       FROM bookings b
       LEFT JOIN vehicles v ON b.vehicle_id = v.vehicle_id
       LEFT JOIN service_types st ON b.service_type_id = st.service_type_id
       LEFT JOIN mechanics m ON b.mechanic_id = m.mechanic_id
       WHERE b.customer_id = $1
       ORDER BY b.booking_date DESC, b.booking_time DESC`,
      [id]
    );

    // Get all invoices
    const invoices = await pool.query(
      `SELECT i.*, b.booking_date
       FROM invoices i
       LEFT JOIN bookings b ON i.booking_id = b.booking_id
       WHERE i.customer_id = $1
       ORDER BY i.invoice_date DESC`,
      [id]
    );

    // Get all feedback
    const feedback = await pool.query(
      `SELECT f.*, b.booking_date, m.first_name as mechanic_first_name, m.last_name as mechanic_last_name
       FROM feedback f
       LEFT JOIN bookings b ON f.booking_id = b.booking_id
       LEFT JOIN mechanics m ON f.mechanic_id = m.mechanic_id
       WHERE f.customer_id = $1
       ORDER BY f.created_at DESC`,
      [id]
    );

    res.json({
      bookings: bookings.rows,
      invoices: invoices.rows,
      feedback: feedback.rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update customer profile
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, phone, address, city, state, zip_code } = req.body;

    const result = await pool.query(
      `UPDATE customers 
       SET first_name = COALESCE($1, first_name),
           last_name = COALESCE($2, last_name),
           phone = COALESCE($3, phone),
           address = COALESCE($4, address),
           city = COALESCE($5, city),
           state = COALESCE($6, state),
           zip_code = COALESCE($7, zip_code),
           updated_at = CURRENT_TIMESTAMP
       WHERE customer_id = $8
       RETURNING customer_id, first_name, last_name, email, phone, address, city, state, zip_code`,
      [first_name, last_name, phone, address, city, state, zip_code, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all customers (admin function)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT customer_id, first_name, last_name, email, phone, city, state, created_at FROM customers ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
