import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

function VehicleList({ customerId }) {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: '',
    vin: '',
    license_plate: '',
    color: '',
    mileage: '',
  });
  const [error, setError] = useState('');

  const fetchVehicles = useCallback(async () => {
    try {
      const response = await api.get(`/vehicles/customer/${customerId}`);
      setVehicles(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await api.post('/vehicles', { ...formData, customer_id: customerId });
      setShowForm(false);
      setFormData({
        make: '',
        model: '',
        year: '',
        vin: '',
        license_plate: '',
        color: '',
        mileage: '',
      });
      fetchVehicles();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add vehicle');
    }
  };

  const handleDelete = async (vehicleId) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        await api.delete(`/vehicles/${vehicleId}`);
        fetchVehicles();
      } catch (error) {
        console.error('Error deleting vehicle:', error);
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading vehicles...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', marginBottom: '30px' }}>
        <h1>My Vehicles</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
          {showForm ? 'Cancel' : '+ Add Vehicle'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '40px' }}>
          <h2>Add New Vehicle</h2>
          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-2">
              <div className="form-group">
                <label>Make *</label>
                <input
                  type="text"
                  name="make"
                  value={formData.make}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Toyota"
                />
              </div>
              <div className="form-group">
                <label>Model *</label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Camry"
                />
              </div>
            </div>

            <div className="grid grid-2">
              <div className="form-group">
                <label>Year *</label>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  required
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  placeholder="e.g. 2022"
                />
              </div>
              <div className="form-group">
                <label>Color</label>
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  placeholder="e.g. Silver"
                />
              </div>
            </div>

            <div className="grid grid-2">
              <div className="form-group">
                <label>VIN</label>
                <input
                  type="text"
                  name="vin"
                  value={formData.vin}
                  onChange={handleChange}
                  maxLength={17}
                  placeholder="17-character VIN"
                />
              </div>
              <div className="form-group">
                <label>License Plate</label>
                <input
                  type="text"
                  name="license_plate"
                  value={formData.license_plate}
                  onChange={handleChange}
                  placeholder="e.g. ABC-1234"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Mileage</label>
              <input
                type="number"
                name="mileage"
                value={formData.mileage}
                onChange={handleChange}
                min="0"
                placeholder="Current mileage"
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-success">
                Add Vehicle
              </button>
            </div>
          </form>
        </div>
      )}

      {vehicles.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>🚗</div>
          <h3 style={{ color: '#374151', marginBottom: '10px' }}>No vehicles yet</h3>
          <p style={{ color: '#6b7280', marginBottom: '20px' }}>
            Add your first vehicle to start booking services.
          </p>
          <button onClick={() => setShowForm(true)} className="btn btn-primary">
            Add Your First Vehicle
          </button>
        </div>
      ) : (
        <div className="grid grid-2">
          {vehicles.map(vehicle => (
            <div key={vehicle.vehicle_id} className="card" style={{ position: 'relative', overflow: 'hidden' }}>
              <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                padding: '8px 16px',
                background: '#f3f4f6',
                borderBottomLeftRadius: '12px',
                color: '#6b7280',
                fontWeight: '600',
                fontSize: '0.875rem'
              }}>
                {vehicle.year}
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', marginBottom: '20px' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  background: '#eff6ff',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '30px',
                  color: '#2563eb'
                }}>
                  🚘
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{vehicle.make} {vehicle.model}</h3>
                  <p style={{ color: '#6b7280', marginTop: '4px' }}>{vehicle.license_plate || 'No Plate'}</p>
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                background: '#f9fafb',
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '20px'
              }}>
                <div>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Color</span>
                  <span style={{ fontWeight: '500', color: '#374151' }}>{vehicle.color || 'N/A'}</span>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mileage</span>
                  <span style={{ fontWeight: '500', color: '#374151' }}>{vehicle.mileage ? `${vehicle.mileage.toLocaleString()} mi` : 'N/A'}</span>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>VIN</span>
                  <span style={{ fontFamily: 'monospace', background: '#e5e7eb', padding: '2px 6px', borderRadius: '4px', fontSize: '0.875rem' }}>{vehicle.vin || 'N/A'}</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => handleDelete(vehicle.vehicle_id)}
                  className="btn btn-danger"
                  style={{ fontSize: '0.875rem', padding: '8px 16px' }}
                >
                  Delete Vehicle
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default VehicleList;
