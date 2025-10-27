// Use SQLite instead of PostgreSQL for easier setup
const { query, run } = require('./database-sqlite');

// Create a pool-like interface for compatibility
const pool = {
  query: async (sql, params) => {
    try {
      return await query(sql, params);
    } catch (error) {
      throw error;
    }
  }
};

module.exports = pool;
