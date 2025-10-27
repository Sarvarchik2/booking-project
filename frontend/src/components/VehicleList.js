import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    fetchVehicles();
  }, [customerId]);

  const fetchVehicles = async () => {
    try {
      const response = await api.get(`/vehicles/customer/${customerId}`);
      setVehicles(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      setLoading(false);
    }
  };

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
        <h1>My Vehicles</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
          {showForm ? 'Cancel' : '+ Add Vehicle'}
        </button>
      </div>

      {showForm && (
        <div className="card">
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
                />
              </div>
              <div className="form-group">
                <label>Color</label>
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
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
                />
              </div>
              <div className="form-group">
                <label>License Plate</label>
                <input
                  type="text"
                  name="license_plate"
                  value={formData.license_plate}
                  onChange={handleChange}
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
              />
            </div>

            <button type="submit" className="btn btn-success">
              Add Vehicle
            </button>
          </form>
        </div>
      )}

      {vehicles.length === 0 ? (
        <div className="card">
          <p style={{ textAlign: 'center', color: '#7f8c8d' }}>
            No vehicles added yet. Add your first vehicle to book services!
          </p>
        </div>
      ) : (
        <div className="grid grid-2">
          {vehicles.map(vehicle => (
            <div key={vehicle.vehicle_id} className="card">
              <h3>{vehicle.make} {vehicle.model}</h3>
              <div style={{ marginTop: '15px' }}>
                <p><strong>Year:</strong> {vehicle.year}</p>
                <p><strong>Color:</strong> {vehicle.color || 'N/A'}</p>
                <p><strong>License Plate:</strong> {vehicle.license_plate || 'N/A'}</p>
                <p><strong>VIN:</strong> {vehicle.vin || 'N/A'}</p>
                <p><strong>Mileage:</strong> {vehicle.mileage ? `${vehicle.mileage} miles` : 'N/A'}</p>
              </div>
              <button
                onClick={() => handleDelete(vehicle.vehicle_id)}
                className="btn btn-danger"
                style={{ marginTop: '15px' }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default VehicleList;
