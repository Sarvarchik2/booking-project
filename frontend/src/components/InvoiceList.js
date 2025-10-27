import React, { useState, useEffect } from 'react';
import api from '../services/api';

function InvoiceList({ customerId }) {
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, [customerId]);

  const fetchInvoices = async () => {
    try {
      const response = await api.get(`/invoices?customerId=${customerId}`);
      setInvoices(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      setLoading(false);
    }
  };

  const fetchInvoiceDetails = async (invoiceId) => {
    try {
      const response = await api.get(`/invoices/${invoiceId}`);
      setSelectedInvoice(response.data);
    } catch (error) {
      console.error('Error fetching invoice details:', error);
    }
  };

  const handlePayInvoice = async (invoiceId) => {
    if (window.confirm('Mark this invoice as paid?')) {
      try {
        await api.put(`/invoices/${invoiceId}/payment`, {
          payment_status: 'paid',
          payment_method: 'credit_card',
          payment_date: new Date().toISOString(),
        });
        fetchInvoices();
        if (selectedInvoice && selectedInvoice.invoice_id === invoiceId) {
          fetchInvoiceDetails(invoiceId);
        }
      } catch (error) {
        console.error('Error updating invoice:', error);
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading invoices...</div>;
  }

  return (
    <div>
      <h1 style={{ marginTop: '20px' }}>My Invoices</h1>

      <div className="card">
        {invoices.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#7f8c8d' }}>No invoices yet.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Date</th>
                <th>Booking Date</th>
                <th>Total</th>
                <th>Payment Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(invoice => (
                <tr key={invoice.invoice_id}>
                  <td>{invoice.invoice_number}</td>
                  <td>{new Date(invoice.invoice_date).toLocaleDateString()}</td>
                  <td>
                    {invoice.booking_date 
                      ? new Date(invoice.booking_date).toLocaleDateString()
                      : 'N/A'}
                  </td>
                  <td>${parseFloat(invoice.total).toFixed(2)}</td>
                  <td>
                    <span className={`status-badge status-${invoice.payment_status}`}>
                      {invoice.payment_status}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => fetchInvoiceDetails(invoice.invoice_id)}
                      className="btn btn-primary"
                      style={{ fontSize: '12px', padding: '6px 12px', marginRight: '5px' }}
                    >
                      View
                    </button>
                    {invoice.payment_status === 'pending' && (
                      <button
                        onClick={() => handlePayInvoice(invoice.invoice_id)}
                        className="btn btn-success"
                        style={{ fontSize: '12px', padding: '6px 12px' }}
                      >
                        Pay Now
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedInvoice && (
        <div className="card" style={{ marginTop: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>Invoice Details - {selectedInvoice.invoice_number}</h2>
            <button onClick={() => setSelectedInvoice(null)} className="btn btn-secondary">
              Close
            </button>
          </div>

          <div style={{ marginTop: '20px' }}>
            <div className="grid grid-2">
              <div>
                <p><strong>Customer:</strong> {selectedInvoice.customer_first_name} {selectedInvoice.customer_last_name}</p>
                <p><strong>Email:</strong> {selectedInvoice.customer_email}</p>
                <p><strong>Phone:</strong> {selectedInvoice.customer_phone}</p>
              </div>
              <div>
                <p><strong>Invoice Date:</strong> {new Date(selectedInvoice.invoice_date).toLocaleDateString()}</p>
                <p><strong>Booking Date:</strong> {selectedInvoice.booking_date ? new Date(selectedInvoice.booking_date).toLocaleDateString() : 'N/A'}</p>
                <p><strong>Payment Status:</strong> <span className={`status-badge status-${selectedInvoice.payment_status}`}>{selectedInvoice.payment_status}</span></p>
              </div>
            </div>

            <h3 style={{ marginTop: '30px' }}>Invoice Items</h3>
            <table className="table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {selectedInvoice.items && selectedInvoice.items.map(item => (
                  <tr key={item.item_id}>
                    <td>{item.description}</td>
                    <td>{item.quantity}</td>
                    <td>${parseFloat(item.unit_price).toFixed(2)}</td>
                    <td>${parseFloat(item.total_price).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="3" style={{ textAlign: 'right' }}><strong>Subtotal:</strong></td>
                  <td><strong>${parseFloat(selectedInvoice.subtotal).toFixed(2)}</strong></td>
                </tr>
                <tr>
                  <td colSpan="3" style={{ textAlign: 'right' }}><strong>Tax:</strong></td>
                  <td><strong>${parseFloat(selectedInvoice.tax).toFixed(2)}</strong></td>
                </tr>
                <tr>
                  <td colSpan="3" style={{ textAlign: 'right' }}><strong>Total:</strong></td>
                  <td><strong style={{ fontSize: '1.2rem', color: '#2c3e50' }}>${parseFloat(selectedInvoice.total).toFixed(2)}</strong></td>
                </tr>
              </tfoot>
            </table>

            {selectedInvoice.notes && (
              <div style={{ marginTop: '20px' }}>
                <strong>Notes:</strong>
                <p>{selectedInvoice.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default InvoiceList;
