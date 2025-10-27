const bcrypt = require('bcryptjs');
const { db } = require('./config/database-sqlite');

async function setupMechanicPasswords() {
  console.log('Setting up default passwords for mechanics...');
  
  const defaultPassword = 'mechanic123'; // Default password for all mechanics
  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(defaultPassword, salt);

  db.run(
    'UPDATE mechanics SET password_hash = ? WHERE password_hash IS NULL',
    [password_hash],
    function(err) {
      if (err) {
        console.error('Error setting passwords:', err);
      } else {
        console.log(`✅ Updated ${this.changes} mechanics with default password: "${defaultPassword}"`);
        console.log('\nMechanic Login Credentials:');
        console.log('============================');
        
        db.all('SELECT email, first_name, last_name, specialization FROM mechanics', (err, rows) => {
          if (!err) {
            rows.forEach(mechanic => {
              console.log(`Email: ${mechanic.email}`);
              console.log(`Name: ${mechanic.first_name} ${mechanic.last_name}`);
              console.log(`Specialization: ${mechanic.specialization}`);
              console.log(`Password: ${defaultPassword}`);
              console.log('---');
            });
          }
          db.close();
        });
      }
    }
  );
}

setupMechanicPasswords();
