const bcrypt = require('bcryptjs');
const db = require('./config/database');

async function setupMechanicPasswords() {
  console.log('Setting up default passwords for mechanics...');

  const defaultPassword = 'mechanic123'; // Default password for all mechanics
  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(defaultPassword, salt);

  try {
    // Use parameter style compatible with Postgres ($1) and sqlite
    const updateRes = await db.run('UPDATE mechanics SET password_hash = $1 WHERE password_hash IS NULL', [password_hash]);
    const changes = updateRes.changes || updateRes.rowCount || 0;
    console.log(`✅ Updated ${changes} mechanics with default password: "${defaultPassword}"`);

    const result = await db.query('SELECT email, first_name, last_name, specialization FROM mechanics');
    result.rows.forEach(mechanic => {
      console.log(`Email: ${mechanic.email}`);
      console.log(`Name: ${mechanic.first_name} ${mechanic.last_name}`);
      console.log(`Specialization: ${mechanic.specialization}`);
      console.log(`Password: ${defaultPassword}`);
      console.log('---');
    });

    // If sqlite, close DB connection
    if (db.db && typeof db.db.close === 'function') {
      db.db.close();
    } else if (db.pool && typeof db.pool.end === 'function') {
      await db.pool.end();
    }
  } catch (err) {
    console.error('Error setting passwords:', err);
  }
}

setupMechanicPasswords();
