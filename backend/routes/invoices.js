const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Get all invoices
router.get('/', async (req, res) => {
  try {
    const { customerId, status } = req.query;
    let query = `
      SELECT i.*, 
             c.first_name as customer_first_name, c.last_name as customer_last_name,
             b.booking_date
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.customer_id
      LEFT JOIN bookings b ON i.booking_id = b.booking_id
      WHERE 1=1
    `;
    
    const params = [];
    if (customerId) {
      params.push(customerId);
      query += ` AND i.customer_id = $${params.length}`;
    }
    if (status) {
      params.push(status);
      query += ` AND i.payment_status = $${params.length}`;
    }

    query += ' ORDER BY i.invoice_date DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get a specific invoice with items
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get invoice details
    const invoiceResult = await pool.query(
      `SELECT i.*, 
              c.first_name as customer_first_name, c.last_name as customer_last_name,
              c.email as customer_email, c.phone as customer_phone, c.address,
              b.booking_date, b.booking_time
       FROM invoices i
       LEFT JOIN customers c ON i.customer_id = c.customer_id
       LEFT JOIN bookings b ON i.booking_id = b.booking_id
       WHERE i.invoice_id = $1`,
      [id]
    );

    if (invoiceResult.rows.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Get invoice items
    const itemsResult = await pool.query(
      'SELECT * FROM invoice_items WHERE invoice_id = $1 ORDER BY item_id',
      [id]
    );

    const invoice = invoiceResult.rows[0];
    invoice.items = itemsResult.rows;

    res.json(invoice);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a new invoice
router.post('/', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const { booking_id, customer_id, items, tax, notes } = req.body;

    if (!customer_id || !items || items.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Calculate subtotal
    const subtotal = items.reduce((sum, item) => sum + parseFloat(item.total_price), 0);
    const taxAmount = tax || subtotal * 0.08; // 8% default tax
    const total = subtotal + taxAmount;

    // Generate invoice number
    const invoiceNumber = `INV-${Date.now()}`;

    // Insert invoice
    const invoiceResult = await client.query(
      `INSERT INTO invoices (booking_id, customer_id, invoice_number, invoice_date, subtotal, tax, total, notes)
       VALUES ($1, $2, $3, CURRENT_DATE, $4, $5, $6, $7) RETURNING *`,
      [booking_id, customer_id, invoiceNumber, subtotal, taxAmount, total, notes]
    );

    const invoice = invoiceResult.rows[0];

    // Insert invoice items
    const invoiceItems = [];
    for (const item of items) {
      const itemResult = await client.query(
        `INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, total_price)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [invoice.invoice_id, item.description, item.quantity, item.unit_price, item.total_price]
      );
      invoiceItems.push(itemResult.rows[0]);
    }

    await client.query('COMMIT');

    invoice.items = invoiceItems;
    res.status(201).json(invoice);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

// Update invoice payment status
router.put('/:id/payment', async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_status, payment_method, payment_date } = req.body;

    if (!payment_status) {
      return res.status(400).json({ error: 'Payment status is required' });
    }

    const result = await pool.query(
      `UPDATE invoices 
       SET payment_status = $1,
           payment_method = COALESCE($2, payment_method),
           payment_date = COALESCE($3, payment_date),
           updated_at = CURRENT_TIMESTAMP
       WHERE invoice_id = $4
       RETURNING *`,
      [payment_status, payment_method, payment_date, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete an invoice
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM invoices WHERE invoice_id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
