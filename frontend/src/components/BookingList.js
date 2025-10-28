import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function BookingList({ customerId }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [feedbackStatus, setFeedbackStatus] = useState({});

  const mountedRef = useRef(true);

  const fetchBookings = useCallback(async () => {
    try {
      const response = await api.get(`/bookings?customerId=${customerId}`);
      const bookingsData = response.data;
      if (!mountedRef.current) return;
      setBookings(bookingsData);

      // Проверяем какие бронирования уже имеют отзывы
      const feedbackPromises = bookingsData
        .filter(b => b.status === 'completed')
        .map(async (b) => {
          try {
            const feedbackRes = await api.get(`/feedback?bookingId=${b.booking_id}`);
            return { [b.booking_id]: feedbackRes.data.length > 0 };
          } catch {
            return { [b.booking_id]: false };
          }
        });

      const feedbackResults = await Promise.all(feedbackPromises);
      const feedbackMap = feedbackResults.reduce((acc, curr) => ({ ...acc, ...curr }), {});
      if (!mountedRef.current) return;
      setFeedbackStatus(feedbackMap);

      setLoading(false);
    } catch (error) {
      if (!mountedRef.current) return;
      console.error('Error fetching bookings:', error);
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    mountedRef.current = true;
    fetchBookings();

    // Автообновление каждые 5 секунд
    const interval = setInterval(() => {
      fetchBookings();
    }, 5000);

    return () => {
      mountedRef.current = false;
      clearInterval(interval);
    };
  }, [fetchBookings]);

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await api.put(`/bookings/${bookingId}/status`, { status: 'cancelled' });
        fetchBookings();
      } catch (error) {
        console.error('Error cancelling booking:', error);
      }
    }
  };

  const filteredBookings = filter === 'all' 
    ? bookings 
    : bookings.filter(b => b.status === filter);

  if (loading) {
    return <div className="loading">Loading bookings...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
        <h1>My Bookings</h1>
        <Link to="/book-service" className="btn btn-primary">
          + New Booking
        </Link>
      </div>

      <div className="card">
        <div style={{ marginBottom: '20px' }}>
          <label style={{ marginRight: '10px' }}>Filter by status:</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="scheduled">Scheduled</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {filteredBookings.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#7f8c8d' }}>No bookings found.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Vehicle</th>
                <th>Service</th>
                <th>Mechanic</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map(booking => (
                <tr key={booking.booking_id}>
                  <td>
                    {new Date(booking.booking_date).toLocaleDateString()}<br />
                    {booking.booking_time}
                  </td>
                  <td>
                    {booking.make} {booking.model}<br />
                    <small>{booking.year}</small>
                  </td>
                  <td>{booking.service_name}</td>
                  <td>
                    {booking.mechanic_first_name 
                      ? `${booking.mechanic_first_name} ${booking.mechanic_last_name}`
                      : 'Not assigned yet'}
                  </td>
                  <td>
                    <span className={`status-badge status-${booking.status}`}>
                      {booking.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    {booking.status === 'scheduled' && (
                      <button
                        onClick={() => handleCancelBooking(booking.booking_id)}
                        className="btn btn-danger"
                        style={{ fontSize: '12px', padding: '6px 12px' }}
                      >
                        Cancel
                      </button>
                    )}
                    {booking.status === 'in_progress' && (
                      <span style={{ color: '#3498db', fontWeight: 'bold' }}>
                        🔧 In Progress
                      </span>
                    )}
                    {booking.status === 'completed' && !feedbackStatus[booking.booking_id] && (
                      <Link
                        to={`/feedback/${booking.booking_id}`}
                        className="btn btn-success"
                        style={{ fontSize: '12px', padding: '6px 12px', textDecoration: 'none' }}
                      >
                        ⭐ Give Feedback
                      </Link>
                    )}
                    {booking.status === 'completed' && feedbackStatus[booking.booking_id] && (
                      <span style={{ color: '#27ae60', fontWeight: 'bold' }}>
                        ✅ Feedback Sent
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default BookingList;
