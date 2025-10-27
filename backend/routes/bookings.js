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

    // 1. Найти подходящего механика по специализации услуги
    let mechanic = null;
    // Получаем специализацию услуги
    const serviceRes = await pool.query('SELECT name FROM service_types WHERE service_type_id = ?', [service_type_id]);
    const service = serviceRes.rows && serviceRes.rows[0] ? serviceRes.rows[0] : null;
    if (service) {
      // Ищем механика по специализации
      const mechRes = await pool.query(
        'SELECT * FROM mechanics WHERE specialization LIKE ? ORDER BY mechanic_id ASC',
        [`%${service.name}%`]
      );
      if (mechRes.rows && mechRes.rows.length > 0) {
        mechanic = mechRes.rows[0];
      }
    }
    // Если не нашли по специализации, берем любого
    if (!mechanic) {
      const anyMechRes = await pool.query('SELECT * FROM mechanics ORDER BY mechanic_id ASC');
      if (anyMechRes.rows && anyMechRes.rows.length > 0) {
        mechanic = anyMechRes.rows[0];
      }
    }
    const mechanic_id = mechanic ? mechanic.mechanic_id : null;

    // 2. Создаем бронирование с mechanic_id
    const result = await pool.query(
      `INSERT INTO bookings (customer_id, vehicle_id, service_type_id, mechanic_id, booking_date, booking_time, notes, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'scheduled')`,
      [customer_id, vehicle_id, service_type_id, mechanic_id, booking_date, booking_time, notes]
    );

    // Получаем только что созданную запись
    const bookingId = result.lastID;
    const bookingRes = await pool.query('SELECT * FROM bookings WHERE booking_id = ?', [bookingId]);
    res.status(201).json(bookingRes.rows[0]);
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

    let query = `UPDATE bookings SET status = ?, updated_at = CURRENT_TIMESTAMP`;
    const params = [status];

    if (status === 'completed' && actual_completion) {
      params.push(actual_completion);
      query += `, actual_completion = ?`;
    }

    params.push(id);
    query += ` WHERE booking_id = ?`;

    await pool.query(query, params);

    // Получаем обновленное бронирование
    const bookingRes = await pool.query('SELECT * FROM bookings WHERE booking_id = ?', [id]);
    if (!bookingRes.rows || bookingRes.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    const booking = bookingRes.rows[0];

    // Если статус стал completed — создаём invoice, если его ещё нет
    if (status === 'completed') {
      // Проверяем, есть ли уже invoice для этого бронирования
      const invRes = await pool.query('SELECT * FROM invoices WHERE booking_id = ?', [id]);
      if (!invRes.rows || invRes.rows.length === 0) {
        // Получаем цену услуги
        const serviceRes = await pool.query('SELECT base_price FROM service_types WHERE service_type_id = ?', [booking.service_type_id]);
        const base_price = serviceRes.rows && serviceRes.rows[0] ? serviceRes.rows[0].base_price : 0;
        const tax = Math.round(base_price * 0.1 * 100) / 100; // 10% налог
        const total = Math.round((base_price + tax) * 100) / 100;
        const invoice_number = `INV-${Date.now()}-${id}`;
        await pool.query(
          `INSERT INTO invoices (booking_id, customer_id, invoice_number, subtotal, tax, total, payment_status, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, 'pending', datetime('now'), datetime('now'))`,
          [id, booking.customer_id, invoice_number, base_price, tax, total]
        );
      }
    }

    // Возвращаем обновленное бронирование
    res.json(booking);
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
