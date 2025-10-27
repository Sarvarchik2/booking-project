const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Get all service types
router.get('/', async (req, res) => {
  try {
    const { active } = req.query;
    let query = 'SELECT * FROM service_types WHERE 1=1';
    const params = [];

    if (active !== undefined) {
      params.push(active === 'true');
      query += ` AND is_active = $${params.length}`;
    }

    query += ' ORDER BY name';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get a specific service type
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM service_types WHERE service_type_id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Service type not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add a new service type
router.post('/', async (req, res) => {
  try {
    const { name, description, base_price, estimated_duration } = req.body;

    if (!name || !base_price) {
      return res.status(400).json({ error: 'Name and base price are required' });
    }

    const result = await pool.query(
      `INSERT INTO service_types (name, description, base_price, estimated_duration)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, description, base_price, estimated_duration]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update a service type
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, base_price, estimated_duration, is_active } = req.body;

    const result = await pool.query(
      `UPDATE service_types 
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           base_price = COALESCE($3, base_price),
           estimated_duration = COALESCE($4, estimated_duration),
           is_active = COALESCE($5, is_active)
       WHERE service_type_id = $6
       RETURNING *`,
      [name, description, base_price, estimated_duration, is_active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Service type not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a service type
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM service_types WHERE service_type_id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Service type not found' });
    }

    res.json({ message: 'Service type deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
