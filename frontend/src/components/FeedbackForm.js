import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

function FeedbackForm({ customerId }) {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [formData, setFormData] = useState({
    rating: 5,
    comment: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBookingDetails();
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      const response = await api.get(`/bookings/${bookingId}`);
      setBooking(response.data);
    } catch (error) {
      console.error('Error fetching booking details:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/feedback', {
        booking_id: parseInt(bookingId),
        customer_id: customerId,
        mechanic_id: booking.mechanic_id,
        rating: parseInt(formData.rating),
        comment: formData.comment,
      });
      navigate('/history');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit feedback');
      setLoading(false);
    }
  };

  if (!booking) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="card" style={{ maxWidth: '600px', margin: '40px auto' }}>
      <h2>Submit Feedback</h2>
      
      <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '4px', marginBottom: '20px' }}>
        <p><strong>Service:</strong> {booking.service_name}</p>
        <p><strong>Date:</strong> {new Date(booking.booking_date).toLocaleDateString()}</p>
        <p><strong>Vehicle:</strong> {booking.make} {booking.model} ({booking.year})</p>
        {booking.mechanic_first_name && (
          <p><strong>Mechanic:</strong> {booking.mechanic_first_name} {booking.mechanic_last_name}</p>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Rating (1-5 stars)</label>
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            {[1, 2, 3, 4, 5].map(star => (
              <label key={star} style={{ cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="rating"
                  value={star}
                  checked={formData.rating === star.toString()}
                  onChange={handleChange}
                  style={{ display: 'none' }}
                />
                <span 
                  className={`star ${parseInt(formData.rating) >= star ? '' : 'empty'}`}
                  style={{ fontSize: '2rem' }}
                >
                  ★
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Your Feedback</label>
          <textarea
            name="comment"
            value={formData.comment}
            onChange={handleChange}
            placeholder="Share your experience with this service..."
            rows="6"
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </form>
    </div>
  );
}

export default FeedbackForm;
