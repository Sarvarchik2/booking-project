const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Get all vehicles for a customer
router.get('/customer/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    const result = await pool.query(
      'SELECT * FROM vehicles WHERE customer_id = $1 ORDER BY created_at DESC',
      [customerId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get a specific vehicle
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM vehicles WHERE vehicle_id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add a new vehicle
router.post('/', async (req, res) => {
  try {
    const { customer_id, make, model, year, vin, license_plate, color, mileage } = req.body;

    if (!customer_id || !make || !model || !year) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await pool.query(
      `INSERT INTO vehicles (customer_id, make, model, year, vin, license_plate, color, mileage)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [customer_id, make, model, year, vin, license_plate, color, mileage]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    if (error.code === '23505') { // Unique violation
      res.status(400).json({ error: 'Vehicle with this VIN already exists' });
    } else {
      res.status(500).json({ error: 'Server error' });
    }
  }
});

// Update a vehicle
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { make, model, year, vin, license_plate, color, mileage } = req.body;

    const result = await pool.query(
      `UPDATE vehicles 
       SET make = COALESCE($1, make),
           model = COALESCE($2, model),
           year = COALESCE($3, year),
           vin = COALESCE($4, vin),
           license_plate = COALESCE($5, license_plate),
           color = COALESCE($6, color),
           mileage = COALESCE($7, mileage),
           updated_at = CURRENT_TIMESTAMP
       WHERE vehicle_id = $8
       RETURNING *`,
      [make, model, year, vin, license_plate, color, mileage, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a vehicle
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM vehicles WHERE vehicle_id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    res.json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
