DROP TABLE IF EXISTS feedback CASCADE;
DROP TABLE IF EXISTS invoice_items CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS mechanics CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS service_types CASCADE;

CREATE TABLE customers (
    customer_id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE vehicles (
    vehicle_id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(customer_id) ON DELETE CASCADE,
    make VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INTEGER NOT NULL,
    vin VARCHAR(17) UNIQUE,
    license_plate VARCHAR(20),
    color VARCHAR(50),
    mileage INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE service_types (
    service_type_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    base_price DECIMAL(10, 2) NOT NULL,
    estimated_duration INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE mechanics (
    mechanic_id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    phone VARCHAR(20),
    specialization VARCHAR(255),
    hourly_rate DECIMAL(10, 2),
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bookings (
    booking_id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(customer_id) ON DELETE CASCADE,
    vehicle_id INTEGER REFERENCES vehicles(vehicle_id) ON DELETE CASCADE,
    service_type_id INTEGER REFERENCES service_types(service_type_id),
    mechanic_id INTEGER REFERENCES mechanics(mechanic_id) ON DELETE SET NULL,
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    status VARCHAR(50) DEFAULT 'scheduled', 
    notes TEXT,
    estimated_completion TIMESTAMP,
    actual_completion TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE invoices (
    invoice_id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(booking_id) ON DELETE CASCADE,
    customer_id INTEGER REFERENCES customers(customer_id) ON DELETE CASCADE,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
    subtotal DECIMAL(10, 2) NOT NULL,
    tax DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'pending', 
    payment_method VARCHAR(50),
    payment_date TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE invoice_items (
    item_id SERIAL PRIMARY KEY,
    invoice_id INTEGER REFERENCES invoices(invoice_id) ON DELETE CASCADE,
    description VARCHAR(255) NOT NULL,
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE feedback (
    feedback_id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(booking_id) ON DELETE CASCADE,
    customer_id INTEGER REFERENCES customers(customer_id) ON DELETE CASCADE,
    mechanic_id INTEGER REFERENCES mechanics(mechanic_id) ON DELETE SET NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_vehicles_customer ON vehicles(customer_id);
CREATE INDEX idx_bookings_customer ON bookings(customer_id);
CREATE INDEX idx_bookings_date ON bookings(booking_date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_invoices_customer ON invoices(customer_id);
CREATE INDEX idx_invoices_booking ON invoices(booking_id);
CREATE INDEX idx_feedback_customer ON feedback(customer_id);

INSERT INTO service_types (name, description, base_price, estimated_duration) VALUES
('Oil Change', 'Standard oil change service', 49.99, 30),
('Brake Inspection', 'Complete brake system inspection', 79.99, 45),
('Tire Rotation', 'Rotate all four tires', 39.99, 30),
('Engine Diagnostic', 'Computer diagnostic scan', 99.99, 60),
('Transmission Service', 'Transmission fluid change and inspection', 149.99, 90),
('Air Conditioning Service', 'A/C system check and recharge', 129.99, 60),
('Battery Replacement', 'Battery testing and replacement', 149.99, 45),
('Wheel Alignment', 'Four-wheel alignment service', 89.99, 60),
('Full Service', 'Comprehensive vehicle inspection and service', 299.99, 180);

-- password_hash left NULL initially; mechanics should use the setup page to set a password
INSERT INTO mechanics (first_name, last_name, email, password_hash, phone, specialization, hourly_rate) VALUES
('John', 'Smith', 'john.smith@garage.com', NULL, '555-0101', 'Engine Specialist', 75.00),
('Maria', 'Garcia', 'maria.garcia@garage.com', NULL, '555-0102', 'Brake Systems', 70.00),
('David', 'Chen', 'david.chen@garage.com', NULL, '555-0103', 'Transmission Expert', 80.00),
('Sarah', 'Johnson', 'sarah.johnson@garage.com', NULL, '555-0104', 'Electrical Systems', 75.00),
('Michael', 'Brown', 'michael.brown@garage.com', NULL, '555-0105', 'General Maintenance', 65.00);

-- Sample customers, vehicles, bookings, invoices and feedback
-- Passwords hashed for 'customer123'
INSERT INTO customers (first_name, last_name, email, password_hash, phone, address, city, state, zip_code)
VALUES
('Иван', 'Петров', 'ivan.petrov@example.com', '$2a$10$hqdYYxcj2qW.yqLJgvq9R.xCn1jbA0n1c/burLvkwDdiaqLVgJbsG', '+79123456789', 'ул. Ленина, 10', 'Москва', 'Москва', '101000'),
('Мария', 'Сидорова', 'maria.sidorova@example.com', '$2a$10$hqdYYxcj2qW.yqLJgvq9R.xCn1jbA0n1c/burLvkwDdiaqLVgJbsG', '+79987654321', 'пр. Победы, 25', 'Санкт-Петербург', 'Санкт-Петербург', '190000');

INSERT INTO vehicles (customer_id, make, model, year, vin, license_plate, mileage)
VALUES
((SELECT customer_id FROM customers WHERE email='ivan.petrov@example.com'), 'Toyota', 'Camry', 2020, 'JT2BF28K0X0123456', 'А123ВС777', 45000),
((SELECT customer_id FROM customers WHERE email='maria.sidorova@example.com'), 'Honda', 'Civic', 2019, 'JHMFC36509S012345', 'В456ЕК199', 38000);

-- Bookings: use existing mechanics and service_types inserted above. Dates use CURRENT_DATE +/- interval.
INSERT INTO bookings (customer_id, vehicle_id, service_type_id, mechanic_id, booking_date, booking_time, status)
VALUES
((SELECT customer_id FROM customers WHERE email='ivan.petrov@example.com'),
 (SELECT vehicle_id FROM vehicles WHERE vin='JT2BF28K0X0123456'),
 (SELECT service_type_id FROM service_types WHERE name='Oil Change'),
 (SELECT mechanic_id FROM mechanics WHERE email='maria.garcia@garage.com'),
 CURRENT_DATE, '10:00', 'scheduled'),

((SELECT customer_id FROM customers WHERE email='ivan.petrov@example.com'),
 (SELECT vehicle_id FROM vehicles WHERE vin='JT2BF28K0X0123456'),
 (SELECT service_type_id FROM service_types WHERE name='Brake Inspection'),
 (SELECT mechanic_id FROM mechanics WHERE email='maria.garcia@garage.com'),
 CURRENT_DATE, '14:00', 'in_progress'),

((SELECT customer_id FROM customers WHERE email='ivan.petrov@example.com'),
 (SELECT vehicle_id FROM vehicles WHERE vin='JT2BF28K0X0123456'),
 (SELECT service_type_id FROM service_types WHERE name='Tire Rotation'),
 (SELECT mechanic_id FROM mechanics WHERE email='maria.garcia@garage.com'),
 CURRENT_DATE - INTERVAL '1 day', '11:00', 'completed'),

((SELECT customer_id FROM customers WHERE email='maria.sidorova@example.com'),
 (SELECT vehicle_id FROM vehicles WHERE vin='JHMFC36509S012345'),
 (SELECT service_type_id FROM service_types WHERE name='Engine Diagnostic'),
 (SELECT mechanic_id FROM mechanics WHERE email='david.chen@garage.com'),
 CURRENT_DATE + INTERVAL '1 day', '09:00', 'scheduled');

INSERT INTO invoices (booking_id, customer_id, invoice_number, subtotal, tax, total, payment_status, payment_method, invoice_date)
VALUES (
 (SELECT booking_id FROM bookings WHERE booking_date = CURRENT_DATE - INTERVAL '1 day' AND status='completed' LIMIT 1),
 (SELECT customer_id FROM customers WHERE email='ivan.petrov@example.com'),
 CONCAT('INV-', EXTRACT(EPOCH FROM now())::bigint),
 (SELECT base_price FROM service_types WHERE name='Tire Rotation'),
 (SELECT base_price FROM service_types WHERE name='Tire Rotation') * 0.10,
 (SELECT base_price FROM service_types WHERE name='Tire Rotation') * 1.10,
 'paid', 'card', CURRENT_DATE
);

-- Invoice items
INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, total_price)
VALUES (
 (SELECT invoice_id FROM invoices ORDER BY created_at DESC LIMIT 1),
 (SELECT name FROM service_types WHERE name='Tire Rotation'),
 1,
 (SELECT base_price FROM service_types WHERE name='Tire Rotation'),
 (SELECT base_price FROM service_types WHERE name='Tire Rotation')
);

-- Feedback for completed booking
INSERT INTO feedback (booking_id, customer_id, mechanic_id, rating, comment)
VALUES (
 (SELECT booking_id FROM bookings WHERE booking_date = CURRENT_DATE - INTERVAL '1 day' AND status='completed' LIMIT 1),
 (SELECT customer_id FROM customers WHERE email='ivan.petrov@example.com'),
 (SELECT mechanic_id FROM mechanics WHERE email='maria.garcia@garage.com'),
 5,
 'Отличная работа! Быстро и качественно. Рекомендую!'
);
