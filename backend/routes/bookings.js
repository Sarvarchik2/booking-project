const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Get all bookings
router.get('/', async (req, res) => {
  try {
    const { status, customerId, mechanicId } = req.query;
    let query = `
      SELECT b.*, 
             c.first_name as customer_first_name, c.last_name as customer_last_name, c.email as customer_email,
             v.make, v.model, v.year, v.license_plate,
             st.name as service_name, st.base_price,
             m.first_name as mechanic_first_name, m.last_name as mechanic_last_name
      FROM bookings b
      LEFT JOIN customers c ON b.customer_id = c.customer_id
      LEFT JOIN vehicles v ON b.vehicle_id = v.vehicle_id
      LEFT JOIN service_types st ON b.service_type_id = st.service_type_id
      LEFT JOIN mechanics m ON b.mechanic_id = m.mechanic_id
      WHERE 1=1
    `;
    
    const params = [];
    if (status) {
      params.push(status);
      query += ` AND b.status = ?`;
    }
    if (customerId) {
      params.push(customerId);
      query += ` AND b.customer_id = ?`;
    }
    if (mechanicId) {
      params.push(mechanicId);
      query += ` AND b.mechanic_id = ?`;
    }

    query += ' ORDER BY b.booking_date DESC, b.booking_time DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get a specific booking
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT b.*, 
              c.first_name as customer_first_name, c.last_name as customer_last_name, 
              c.email as customer_email, c.phone as customer_phone,
              v.make, v.model, v.year, v.license_plate, v.vin,
              st.name as service_name, st.description as service_description, st.base_price,
              m.first_name as mechanic_first_name, m.last_name as mechanic_last_name, m.email as mechanic_email
       FROM bookings b
       LEFT JOIN customers c ON b.customer_id = c.customer_id
       LEFT JOIN vehicles v ON b.vehicle_id = v.vehicle_id
       LEFT JOIN service_types st ON b.service_type_id = st.service_type_id
       LEFT JOIN mechanics m ON b.mechanic_id = m.mechanic_id
       WHERE b.booking_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a new booking
router.post('/', async (req, res) => {
  try {
    const { customer_id, vehicle_id, service_type_id, booking_date, booking_time, notes } = req.body;

    if (!customer_id || !vehicle_id || !service_type_id || !booking_date || !booking_time) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await pool.query(
      `INSERT INTO bookings (customer_id, vehicle_id, service_type_id, booking_date, booking_time, notes, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'scheduled') RETURNING *`,
      [customer_id, vehicle_id, service_type_id, booking_date, booking_time, notes]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Assign a mechanic to a booking
router.put('/:id/assign-mechanic', async (req, res) => {
  try {
    const { id } = req.params;
    const { mechanic_id } = req.body;

    if (!mechanic_id) {
      return res.status(400).json({ error: 'Mechanic ID is required' });
    }

    const result = await pool.query(
      `UPDATE bookings 
       SET mechanic_id = $1, updated_at = CURRENT_TIMESTAMP
       WHERE booking_id = $2
       RETURNING *`,
      [mechanic_id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update booking status
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, actual_completion } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    let query = `UPDATE bookings SET status = $1, updated_at = CURRENT_TIMESTAMP`;
    const params = [status];

    if (status === 'completed' && actual_completion) {
      params.push(actual_completion);
      query += `, actual_completion = $${params.length}`;
    }

    params.push(id);
    query += ` WHERE booking_id = $${params.length} RETURNING *`;

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update a booking
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { booking_date, booking_time, notes, estimated_completion } = req.body;

    const result = await pool.query(
      `UPDATE bookings 
       SET booking_date = COALESCE($1, booking_date),
           booking_time = COALESCE($2, booking_time),
           notes = COALESCE($3, notes),
           estimated_completion = COALESCE($4, estimated_completion),
           updated_at = CURRENT_TIMESTAMP
       WHERE booking_id = $5
       RETURNING *`,
      [booking_date, booking_time, notes, estimated_completion, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a booking
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM bookings WHERE booking_id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
