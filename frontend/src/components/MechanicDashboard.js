import React, { useState, useEffect } from 'react';
import api from '../services/api';

function MechanicDashboard({ mechanic }) {
  const [stats, setStats] = useState({
    totalBookings: 0,
    todayBookings: 0,
    completedBookings: 0,
    avgRating: 0,
  });
  const [bookings, setBookings] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bookings');

  useEffect(() => {
    // fetchDashboardData depends on `mechanic`; define inside effect to avoid exhaustive-deps warning
    const fetchDashboardData = async () => {
      try {
        // Fetch mechanic's bookings
        const bookingsRes = await api.get(`/mechanics/${mechanic.mechanic_id}/bookings`);
        const bookingsData = bookingsRes.data;
        
        // Fetch feedback
        const feedbackRes = await api.get(`/feedback?mechanicId=${mechanic.mechanic_id}`);
        const feedbackData = feedbackRes.data;

        // Fetch average rating
        const ratingRes = await api.get(`/feedback/mechanic/${mechanic.mechanic_id}/average`);

        const today = new Date().toISOString().split('T')[0];
        setStats({
          totalBookings: bookingsData.length,
          todayBookings: bookingsData.filter(b => b.booking_date === today).length,
          completedBookings: bookingsData.filter(b => b.status === 'completed').length,
          avgRating: parseFloat(ratingRes.data.average_rating || 0).toFixed(1),
        });

        setBookings(bookingsData);
        setFeedback(feedbackData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    if (mechanic) fetchDashboardData();
  }, [mechanic]);

  const fetchDashboardData = async () => {
    try {
      // Fetch mechanic's bookings
      const bookingsRes = await api.get(`/mechanics/${mechanic.mechanic_id}/bookings`);
      const bookingsData = bookingsRes.data;
      
      // Fetch feedback
      const feedbackRes = await api.get(`/feedback?mechanicId=${mechanic.mechanic_id}`);
      const feedbackData = feedbackRes.data;

      // Fetch average rating
      const ratingRes = await api.get(`/feedback/mechanic/${mechanic.mechanic_id}/average`);

      const today = new Date().toISOString().split('T')[0];
      
      setStats({
        totalBookings: bookingsData.length,
        todayBookings: bookingsData.filter(b => b.booking_date === today).length,
        completedBookings: bookingsData.filter(b => b.status === 'completed').length,
        avgRating: parseFloat(ratingRes.data.average_rating || 0).toFixed(1),
      });

      setBookings(bookingsData);
      setFeedback(feedbackData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      await api.put(`/bookings/${bookingId}/status`, { 
        status: newStatus,
        actual_completion: newStatus === 'completed' ? new Date().toISOString() : null
      });
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating booking:', error);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="rating">
        {[1, 2, 3, 4, 5].map(star => (
          <span key={star} className={`star ${star <= rating ? '' : 'empty'}`}>★</span>
        ))}
      </div>
    );
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div>
      <h1 style={{ marginTop: '20px' }}>Welcome, {mechanic.first_name} {mechanic.last_name}!</h1>
      <p style={{ color: '#7f8c8d', marginBottom: '20px' }}>
        Specialization: {mechanic.specialization} | Hourly Rate: ${mechanic.hourly_rate}
      </p>

      <div className="grid grid-2" style={{ marginTop: '30px' }}>
        <div className="card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <h3 style={{ color: 'white' }}>Total Bookings</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{stats.totalBookings}</p>
          <p>{stats.todayBookings} scheduled today</p>
        </div>

        <div className="card" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
          <h3 style={{ color: 'white' }}>Average Rating</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{stats.avgRating} ⭐</p>
          <p>{feedback.length} reviews</p>
        </div>
      </div>

      <div className="card" style={{ marginTop: '30px' }}>
        <div style={{ display: 'flex', gap: '20px', borderBottom: '2px solid #ecf0f1', marginBottom: '20px' }}>
          <button
            onClick={() => setActiveTab('bookings')}
            style={{
              border: 'none',
              background: 'none',
              padding: '10px 20px',
              cursor: 'pointer',
              borderBottom: activeTab === 'bookings' ? '3px solid #3498db' : 'none',
              fontWeight: activeTab === 'bookings' ? 'bold' : 'normal',
            }}
          >
            My Bookings
          </button>
          <button
            onClick={() => setActiveTab('feedback')}
            style={{
              border: 'none',
              background: 'none',
              padding: '10px 20px',
              cursor: 'pointer',
              borderBottom: activeTab === 'feedback' ? '3px solid #3498db' : 'none',
              fontWeight: activeTab === 'feedback' ? 'bold' : 'normal',
            }}
          >
            Customer Feedback
          </button>
        </div>

        {activeTab === 'bookings' && (
          <div>
            {bookings.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#7f8c8d' }}>No bookings assigned yet.</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Date & Time</th>
                    <th>Customer</th>
                    <th>Vehicle</th>
                    <th>Service</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(booking => (
                    <tr key={booking.booking_id}>
                      <td>
                        {new Date(booking.booking_date).toLocaleDateString()}<br />
                        {booking.booking_time}
                      </td>
                      <td>
                        {booking.customer_first_name} {booking.customer_last_name}<br />
                        <small>{booking.customer_email}</small>
                      </td>
                      <td>{booking.make} {booking.model} ({booking.year})</td>
                      <td>{booking.service_name}</td>
                      <td>
                        <span className={`status-badge status-${booking.status}`}>
                          {booking.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td>
                        {booking.status === 'scheduled' && (
                          <button
                            onClick={() => updateBookingStatus(booking.booking_id, 'in_progress')}
                            className="btn btn-primary"
                            style={{ fontSize: '12px', padding: '6px 12px', marginRight: '5px' }}
                          >
                            Start Work
                          </button>
                        )}
                        {booking.status === 'in_progress' && (
                          <button
                            onClick={() => updateBookingStatus(booking.booking_id, 'completed')}
                            className="btn btn-success"
                            style={{ fontSize: '12px', padding: '6px 12px' }}
                          >
                            Complete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'feedback' && (
          <div>
            {feedback.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#7f8c8d' }}>No feedback yet.</p>
            ) : (
              <div className="grid">
                {feedback.map(fb => (
                  <div key={fb.feedback_id} className="card" style={{ background: '#f8f9fa' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong>{fb.customer_first_name} {fb.customer_last_name}</strong>
                        <br />
                        <small>{new Date(fb.booking_date).toLocaleDateString()}</small>
                      </div>
                      {renderStars(fb.rating)}
                    </div>
                    {fb.comment && (
                      <p style={{ marginTop: '10px', fontStyle: 'italic' }}>
                        "{fb.comment}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default MechanicDashboard;
