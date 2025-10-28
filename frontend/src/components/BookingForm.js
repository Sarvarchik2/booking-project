import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function BookingForm({ customerId }) {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [formData, setFormData] = useState({
    vehicle_id: '',
    service_type_id: '',
    booking_date: '',
    booking_time: '',
    notes: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [vehiclesRes, servicesRes] = await Promise.all([
          api.get(`/vehicles/customer/${customerId}`),
          api.get('/service-types?active=true')
        ]);
        setVehicles(vehiclesRes.data);
        setServiceTypes(servicesRes.data);
      } catch (error) {
        console.error('Error fetching vehicles or service types:', error);
      }
    };

    fetchAll();
  }, [customerId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/bookings', {
        ...formData,
        customer_id: customerId,
      });
      navigate('/bookings');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create booking');
      setLoading(false);
    }
  };

  const selectedService = serviceTypes.find(st => st.service_type_id === parseInt(formData.service_type_id));

  return (
    <div className="card" style={{ maxWidth: '800px', margin: '40px auto' }}>
      <h2>Book a Service</h2>
      {error && <div className="alert alert-error">{error}</div>}

      {vehicles.length === 0 ? (
        <div className="alert alert-info">
          Please add a vehicle before booking a service.
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Select Vehicle *</label>
            <select
              name="vehicle_id"
              value={formData.vehicle_id}
              onChange={handleChange}
              required
            >
              <option value="">Choose a vehicle</option>
              {vehicles.map(vehicle => (
                <option key={vehicle.vehicle_id} value={vehicle.vehicle_id}>
                  {vehicle.make} {vehicle.model} ({vehicle.year}) - {vehicle.license_plate}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Select Service *</label>
            <select
              name="service_type_id"
              value={formData.service_type_id}
              onChange={handleChange}
              required
            >
              <option value="">Choose a service</option>
              {serviceTypes.map(service => (
                <option key={service.service_type_id} value={service.service_type_id}>
                  {service.name} - ${service.base_price} ({service.estimated_duration} min)
                </option>
              ))}
            </select>
          </div>

          {selectedService && (
            <div className="alert alert-info">
              <strong>{selectedService.name}</strong><br />
              {selectedService.description}<br />
              Estimated Time: {selectedService.estimated_duration} minutes<br />
              Base Price: ${selectedService.base_price}
            </div>
          )}

          <div className="grid grid-2">
            <div className="form-group">
              <label>Booking Date *</label>
              <input
                type="date"
                name="booking_date"
                value={formData.booking_date}
                onChange={handleChange}
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="form-group">
              <label>Booking Time *</label>
              <input
                type="time"
                name="booking_time"
                value={formData.booking_time}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Additional Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Any specific concerns or requirements?"
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Booking...' : 'Book Service'}
          </button>
        </form>
      )}
    </div>
  );
}

export default BookingForm;
