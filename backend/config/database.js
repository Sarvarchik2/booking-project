// Choose database client based on environment. Defaults to SQLite for local dev.
let dbClient = process.env.DB_CLIENT || (process.env.DATABASE_URL ? 'pg' : 'sqlite');

if (dbClient === 'pg') {
  // Use Postgres connector
  const pg = require('./database-postgres');
  module.exports = {
    query: pg.query,
    run: pg.run,
    pool: pg.pool
  };
} else {
  // Default to sqlite
  const sqlite = require('./database-sqlite');
  module.exports = {
    query: sqlite.query,
    run: sqlite.run,
    db: sqlite.db
  };
}
