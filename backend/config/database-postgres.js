const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL || null;

if (!connectionString) {
  console.warn('DATABASE_URL not set — postgres connector created but will fail on connect until DATABASE_URL is configured');
}

const pool = new Pool({
  connectionString,
  // In production with managed Postgres services you may need SSL
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

const query = async (text, params = []) => {
  const res = await pool.query(text, params);
  return { rows: res.rows };
};

// run mirrors sqlite-run semantics where possible. For Postgres, callers should use RETURNING
const run = async (text, params = []) => {
  const res = await pool.query(text, params);
  return { rows: res.rows, rowCount: res.rowCount };
};

module.exports = { pool, query, run };
