// Use Postgres only. The project no longer supports SQLite.
const pg = require('./database-postgres');

module.exports = {
  query: pg.query,
  run: pg.run,
  pool: pg.pool
};
