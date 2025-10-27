import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function MechanicSetup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await api.post('/mechanics/set-password', {
        email: formData.email,
        password: formData.password,
      });
      setSuccess('Password set successfully! Redirecting to login...');
      setTimeout(() => navigate('/mechanic-login'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Setup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: '500px', margin: '100px auto' }}>
      <h2>🔧 Mechanic Account Setup</h2>
      <p style={{ color: '#7f8c8d', marginBottom: '20px' }}>
        Set up your password to activate your mechanic account. Use the email address provided by the administrator.
      </p>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email Address *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="your.email@garage.com"
            required
          />
          <small style={{ color: '#7f8c8d' }}>
            Use the email address from your mechanic profile
          </small>
        </div>

        <div className="form-group">
          <label>Password * (minimum 6 characters)</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={6}
          />
        </div>

        <div className="form-group">
          <label>Confirm Password *</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            minLength={6}
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Setting up...' : 'Set Password & Activate Account'}
        </button>
      </form>
    </div>
  );
}

export default MechanicSetup;
