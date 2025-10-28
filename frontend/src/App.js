import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import CustomerRegistration from './components/CustomerRegistration';
import CustomerLogin from './components/CustomerLogin';
import MechanicLogin from './components/MechanicLogin';
import MechanicSetup from './components/MechanicSetup';
import MechanicDashboard from './components/MechanicDashboard';
import VehicleList from './components/VehicleList';
import BookingForm from './components/BookingForm';
import BookingList from './components/BookingList';
import InvoiceList from './components/InvoiceList';
import FeedbackForm from './components/FeedbackForm';
import CustomerHistory from './components/CustomerHistory';

function App() {
  const [customer, setCustomer] = useState(null);
  const [mechanic, setMechanic] = useState(null);
  // userRole persisted in localStorage; no local state needed

  useEffect(() => {
    // Check if customer is logged in
    const token = localStorage.getItem('token');
    const customerData = localStorage.getItem('customer');
    const mechanicData = localStorage.getItem('mechanic');
    const role = localStorage.getItem('userRole');
    
    if (token && customerData && role === 'customer') {
      setCustomer(JSON.parse(customerData));
    } else if (token && mechanicData && role === 'mechanic') {
      setMechanic(JSON.parse(mechanicData));
    }
  }, []);

  const handleLogin = (userData, token, role = 'customer') => {
    if (role === 'customer') {
      setCustomer(userData);
      localStorage.setItem('customer', JSON.stringify(userData));
    } else {
      setMechanic(userData);
      localStorage.setItem('mechanic', JSON.stringify(userData));
    }
    localStorage.setItem('token', token);
    localStorage.setItem('userRole', role);
  };

  const handleLogout = () => {
    setCustomer(null);
    setMechanic(null);
  // role cleared from localStorage only
    localStorage.removeItem('token');
    localStorage.removeItem('customer');
    localStorage.removeItem('mechanic');
    localStorage.removeItem('userRole');
  };

  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <div className="navbar-content">
            <h1>🚗 Vehicle Service Booking</h1>
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
              {customer ? (
                <>
                  <Link to="/">Dashboard</Link>
                  <Link to="/vehicles">My Vehicles</Link>
                  <Link to="/bookings">Bookings</Link>
                  <Link to="/invoices">Invoices</Link>
                  <Link to="/history">History</Link>
                  <span style={{ color: '#000' }}>
                    👤 {customer.first_name}
                  </span>
                  <button onClick={handleLogout} className="btn btn-secondary">
                    Logout
                  </button>
                </>
              ) : mechanic ? (
                <>
                  <Link to="/mechanic-dashboard">Dashboard</Link>
                  <span style={{ color: '#000' }}>
                    🔧 {mechanic.first_name} {mechanic.last_name}
                  </span>
                  <button onClick={handleLogout} className="btn btn-secondary">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login">Customer Login</Link>
                  <Link to="/mechanic-login">Mechanic Login</Link>
                  <Link to="/register">Register</Link>
                </>
              )}
            </div>
          </div>
        </nav>

        <div className="container">
          <Routes>
            {/* Customer Routes */}
            <Route path="/" element={customer ? <Dashboard customer={customer} /> : mechanic ? <Navigate to="/mechanic-dashboard" /> : <Navigate to="/login" />} />
            <Route path="/register" element={<CustomerRegistration onRegister={handleLogin} />} />
            <Route path="/login" element={<CustomerLogin onLogin={handleLogin} />} />
            <Route path="/vehicles" element={customer ? <VehicleList customerId={customer.customer_id} /> : <Navigate to="/login" />} />
            <Route path="/book-service" element={customer ? <BookingForm customerId={customer.customer_id} /> : <Navigate to="/login" />} />
            <Route path="/bookings" element={customer ? <BookingList customerId={customer.customer_id} /> : <Navigate to="/login" />} />
            <Route path="/invoices" element={customer ? <InvoiceList customerId={customer.customer_id} /> : <Navigate to="/login" />} />
            <Route path="/feedback/:bookingId" element={customer ? <FeedbackForm customerId={customer.customer_id} /> : <Navigate to="/login" />} />
            <Route path="/history" element={customer ? <CustomerHistory customerId={customer.customer_id} /> : <Navigate to="/login" />} />
            
            {/* Mechanic Routes */}
            <Route path="/mechanic-login" element={<MechanicLogin onLogin={handleLogin} />} />
            <Route path="/mechanic-setup" element={<MechanicSetup />} />
            <Route path="/mechanic-dashboard" element={mechanic ? <MechanicDashboard mechanic={mechanic} /> : <Navigate to="/mechanic-login" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
