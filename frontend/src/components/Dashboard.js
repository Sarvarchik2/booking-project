import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function Dashboard({ customer }) {
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    totalInvoices: 0,
    pendingPayments: 0,
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchDashboardData = async () => {
      try {
        // Fetch bookings
        const bookingsRes = await api.get(`/bookings?customerId=${customer.customer_id}`);
        const bookings = bookingsRes.data;

        // Fetch invoices
        const invoicesRes = await api.get(`/invoices?customerId=${customer.customer_id}`);
        const invoices = invoicesRes.data;

        if (!mounted) return;
        setStats({
          totalBookings: bookings.length,
          pendingBookings: bookings.filter(b => b.status === 'scheduled').length,
          totalInvoices: invoices.length,
          pendingPayments: invoices.filter(i => i.payment_status === 'pending').length,
        });

        setRecentBookings(bookings.slice(0, 5));
        setLoading(false);
      } catch (error) {
        if (!mounted) return;
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();

    // Автообновление каждые 10 секунд
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 10000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [customer]);

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div>
      <h1 style={{ marginTop: '20px' }}>Dashboard</h1>

      <div className="grid grid-2" style={{ marginTop: '30px' }}>
        <div className="card stat-card">
          <h3>Total Bookings</h3>
          <p className="stat-number">{stats.totalBookings}</p>
          <p className="stat-sub">{stats.pendingBookings} pending</p>
        </div>

        <div className="card stat-card alt">
          <h3>Total Invoices</h3>
          <p className="stat-number">{stats.totalInvoices}</p>
          <p className="stat-sub">{stats.pendingPayments} pending payments</p>
        </div>
      </div>

      <div className="card" style={{ marginTop: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Quick Actions</h2>
        </div>
        <div className="grid grid-3" style={{ marginTop: '20px' }}>
          <Link to="/book-service" className="btn btn-primary" style={{ textDecoration: 'none', textAlign: 'center' }}>
            📅 Book Service
          </Link>
          <Link to="/vehicles" className="btn btn-success" style={{ textDecoration: 'none', textAlign: 'center' }}>
            🚗 Manage Vehicles
          </Link>
          <Link to="/history" className="btn btn-secondary" style={{ textDecoration: 'none', textAlign: 'center' }}>
            📊 View History
          </Link>
        </div>
      </div>

      <div className="card" style={{ marginTop: '30px' }}>
        <h2>Recent Bookings</h2>
        {recentBookings.length === 0 ? (
          <p style={{ marginTop: '20px', color: '#7f8c8d' }}>No bookings yet. Book your first service!</p>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Vehicle</th>
                  <th>Service</th>
                  <th>Mechanic</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map(booking => (
                  <tr key={booking.booking_id}>
                    <td>{new Date(booking.booking_date).toLocaleDateString()}</td>
                    <td>{booking.make} {booking.model} ({booking.year})</td>
                    <td>{booking.service_name}</td>
                    <td>
                      {booking.mechanic_first_name
                        ? `${booking.mechanic_first_name} ${booking.mechanic_last_name}`
                        : 'Not assigned'}
                    </td>
                    <td>
                      <span className={`status-badge status-${booking.status}`}>
                        {booking.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
