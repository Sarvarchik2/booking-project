const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

// Ensure JWT secret is set. In production this must be provided via environment.
if (!process.env.JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    console.error('FATAL: JWT_SECRET environment variable is required in production');
    process.exit(1);
  } else {
    // Development fallback — change this for your local environment if needed.
    process.env.JWT_SECRET = 'dev_jwt_secret_change_this';
    console.warn('Warning: JWT_SECRET not set. Using development fallback. Do NOT use this in production.');
  }
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const customerRoutes = require('./routes/customers');
const vehicleRoutes = require('./routes/vehicles');
const bookingRoutes = require('./routes/bookings');
const mechanicRoutes = require('./routes/mechanics');
const invoiceRoutes = require('./routes/invoices');
const feedbackRoutes = require('./routes/feedback');
const serviceTypeRoutes = require('./routes/serviceTypes');

app.use('/api/customers', customerRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/mechanics', mechanicRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/service-types', serviceTypeRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Vehicle Service Booking System API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!', message: err.message });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const server = app.listen(PORT, () => {
  const actualPort = server.address().port;
  console.log(`Server is running on port ${actualPort}`);
});

module.exports = app;
