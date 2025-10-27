const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create database connection
const db = new sqlite3.Database(path.join(__dirname, '../vehicle_service.db'), (err) => {
  if (err) {
    console.error('Error connecting to SQLite database:', err);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

function initializeDatabase() {
  db.serialize(() => {
    // Create tables
    db.run(`CREATE TABLE IF NOT EXISTS customers (
      customer_id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      phone TEXT,
      address TEXT,
      city TEXT,
      state TEXT,
      zip_code TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS vehicles (
      vehicle_id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER,
      make TEXT NOT NULL,
      model TEXT NOT NULL,
      year INTEGER NOT NULL,
      vin TEXT UNIQUE,
      license_plate TEXT,
      color TEXT,
      mileage INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS service_types (
      service_type_id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      base_price REAL NOT NULL,
      estimated_duration INTEGER,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS mechanics (
      mechanic_id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT,
      phone TEXT,
      specialization TEXT,
      hourly_rate REAL,
      is_available INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS bookings (
      booking_id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER,
      vehicle_id INTEGER,
      service_type_id INTEGER,
      mechanic_id INTEGER,
      booking_date DATE NOT NULL,
      booking_time TIME NOT NULL,
      status TEXT DEFAULT 'scheduled',
      notes TEXT,
      estimated_completion DATETIME,
      actual_completion DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE,
      FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id) ON DELETE CASCADE,
      FOREIGN KEY (service_type_id) REFERENCES service_types(service_type_id),
      FOREIGN KEY (mechanic_id) REFERENCES mechanics(mechanic_id) ON DELETE SET NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS invoices (
      invoice_id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id INTEGER,
      customer_id INTEGER,
      invoice_number TEXT UNIQUE NOT NULL,
      invoice_date DATE NOT NULL DEFAULT (date('now')),
      subtotal REAL NOT NULL,
      tax REAL DEFAULT 0,
      total REAL NOT NULL,
      payment_status TEXT DEFAULT 'pending',
      payment_method TEXT,
      payment_date DATETIME,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE,
      FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS invoice_items (
      item_id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_id INTEGER,
      description TEXT NOT NULL,
      quantity INTEGER DEFAULT 1,
      unit_price REAL NOT NULL,
      total_price REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (invoice_id) REFERENCES invoices(invoice_id) ON DELETE CASCADE
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS feedback (
      feedback_id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id INTEGER,
      customer_id INTEGER,
      mechanic_id INTEGER,
      rating INTEGER CHECK (rating >= 1 AND rating <= 5),
      comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE,
      FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE,
      FOREIGN KEY (mechanic_id) REFERENCES mechanics(mechanic_id) ON DELETE SET NULL
    )`);

    // Insert sample service types
    db.get("SELECT COUNT(*) as count FROM service_types", (err, row) => {
      if (!err && row.count === 0) {
        const serviceTypes = [
          ['Oil Change', 'Standard oil change service', 49.99, 30],
          ['Brake Inspection', 'Complete brake system inspection', 79.99, 45],
          ['Tire Rotation', 'Rotate all four tires', 39.99, 30],
          ['Engine Diagnostic', 'Computer diagnostic scan', 99.99, 60],
          ['Transmission Service', 'Transmission fluid change and inspection', 149.99, 90],
          ['Air Conditioning Service', 'A/C system check and recharge', 129.99, 60],
          ['Battery Replacement', 'Battery testing and replacement', 149.99, 45],
          ['Wheel Alignment', 'Four-wheel alignment service', 89.99, 60],
          ['Full Service', 'Comprehensive vehicle inspection and service', 299.99, 180]
        ];

        const stmt = db.prepare("INSERT INTO service_types (name, description, base_price, estimated_duration) VALUES (?, ?, ?, ?)");
        serviceTypes.forEach(service => stmt.run(service));
        stmt.finalize();
        console.log('Sample service types inserted');
      }
    });

    // Insert sample mechanics
    db.get("SELECT COUNT(*) as count FROM mechanics", (err, row) => {
      if (!err && row.count === 0) {
        const mechanics = [
          ['John', 'Smith', 'john.smith@garage.com', '555-0101', 'Engine Specialist', 75.00],
          ['Maria', 'Garcia', 'maria.garcia@garage.com', '555-0102', 'Brake Systems', 70.00],
          ['David', 'Chen', 'david.chen@garage.com', '555-0103', 'Transmission Expert', 80.00],
          ['Sarah', 'Johnson', 'sarah.johnson@garage.com', '555-0104', 'Electrical Systems', 75.00],
          ['Michael', 'Brown', 'michael.brown@garage.com', '555-0105', 'General Maintenance', 65.00]
        ];

        const stmt = db.prepare("INSERT INTO mechanics (first_name, last_name, email, phone, specialization, hourly_rate) VALUES (?, ?, ?, ?, ?, ?)");
        mechanics.forEach(mechanic => stmt.run(mechanic));
        stmt.finalize();
        console.log('Sample mechanics inserted');
      }
    });
  });
}

// Promisify database methods for easier use
const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve({ rows });
    });
  });
};

const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

module.exports = { db, query, run };
