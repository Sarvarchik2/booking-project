import React, { useState, useEffect } from 'react';
import api from '../services/api';

function CustomerHistory({ customerId }) {
  const [history, setHistory] = useState({
    bookings: [],
    invoices: [],
    feedback: [],
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bookings');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get(`/customers/${customerId}/history`);
        setHistory(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching history:', error);
        setLoading(false);
      }
    };

    fetchHistory();
  }, [customerId]);

  if (loading) {
    return <div className="loading">Loading history...</div>;
  }

  const renderStars = (rating) => {
    return (
      <div className="rating">
        {[1, 2, 3, 4, 5].map(star => (
          <span key={star} className={`star ${star <= rating ? '' : 'empty'}`}>★</span>
        ))}
      </div>
    );
  };

  return (
    <div>
      <h1 style={{ marginTop: '20px' }}>My History</h1>

      <div className="card">
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
            Bookings ({history.bookings.length})
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            style={{
              border: 'none',
              background: 'none',
              padding: '10px 20px',
              cursor: 'pointer',
              borderBottom: activeTab === 'invoices' ? '3px solid #3498db' : 'none',
              fontWeight: activeTab === 'invoices' ? 'bold' : 'normal',
            }}
          >
            Invoices ({history.invoices.length})
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
            Feedback ({history.feedback.length})
          </button>
        </div>

        {activeTab === 'bookings' && (
          <div>
            {history.bookings.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#7f8c8d' }}>No booking history.</p>
            ) : (
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
                  {history.bookings.map(booking => (
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
            )}
          </div>
        )}

        {activeTab === 'invoices' && (
          <div>
            {history.invoices.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#7f8c8d' }}>No invoice history.</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Invoice #</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Payment Status</th>
                    <th>Payment Date</th>
                  </tr>
                </thead>
                <tbody>
                  {history.invoices.map(invoice => (
                    <tr key={invoice.invoice_id}>
                      <td>{invoice.invoice_number}</td>
                      <td>{new Date(invoice.invoice_date).toLocaleDateString()}</td>
                      <td>${parseFloat(invoice.total).toFixed(2)}</td>
                      <td>
                        <span className={`status-badge status-${invoice.payment_status}`}>
                          {invoice.payment_status}
                        </span>
                      </td>
                      <td>
                        {invoice.payment_date 
                          ? new Date(invoice.payment_date).toLocaleDateString()
                          : 'N/A'}
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
            {history.feedback.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#7f8c8d' }}>No feedback history.</p>
            ) : (
              <div className="grid">
                {history.feedback.map(fb => (
                  <div key={fb.feedback_id} className="card" style={{ background: '#f8f9fa' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong>Booking Date:</strong> {new Date(fb.booking_date).toLocaleDateString()}
                      </div>
                      {renderStars(fb.rating)}
                    </div>
                    {fb.mechanic_first_name && (
                      <p style={{ marginTop: '10px' }}>
                        <strong>Mechanic:</strong> {fb.mechanic_first_name} {fb.mechanic_last_name}
                      </p>
                    )}
                    {fb.comment && (
                      <p style={{ marginTop: '10px', fontStyle: 'italic' }}>
                        "{fb.comment}"
                      </p>
                    )}
                    <p style={{ marginTop: '10px', fontSize: '0.85rem', color: '#7f8c8d' }}>
                      Submitted: {new Date(fb.created_at).toLocaleDateString()}
                    </p>
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

export default CustomerHistory;
