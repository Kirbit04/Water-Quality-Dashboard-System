import { useState } from 'react';
import { authAPI } from '../api';
import logo from '../assets/AquAguard.png';

export default function Login({ onLogin, onSwitchToSignup }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: '',
  });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateField = (name, value) => {
    const errors = {};
    
    if (name === 'email' || name === 'all') {
      if (!formData.email && name === 'all') {
        errors.email = 'Email is required';
      } else if (formData.email && !validateEmail(formData.email)) {
        errors.email = 'Please enter a valid email address';
      }
    }
    
    if (name === 'password' || name === 'all') {
      if (!formData.password && name === 'all') {
        errors.password = 'Password is required';
      } else if (formData.password && formData.password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
      }
    }
    
    if (name === 'role' || name === 'all') {
      if (!formData.role && name === 'all') {
        errors.role = 'Please select a role';
      }
    }
    
    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    const newErrors = { ...fieldErrors };
    const fieldValidation = validateField(name, value);
    if (fieldValidation[name]) {
      newErrors[name] = fieldValidation[name];
    } else {
      delete newErrors[name];
    }
    setFieldErrors(newErrors);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const validationErrors = validateField('all');
    setFieldErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setError('Please fix the errors below');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.login(formData.email, formData.password, formData.role);

      onLogin({
        id: response.userId || response.id,
        name: response.name,
        email: response.email,
        role: response.role,
        phone: response.phone,
      });
    } catch (err) {
      setError(err.message || 'Invalid email or password');
      setFieldErrors({ password: 'Credentials do not match' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <img src={logo} alt="AquaGuard Logo" />
        </div>

        <h1 className="auth-title">Welcome Back</h1>

        {error && (
          <div className="error-message" style={{ display: 'block', marginBottom: '16px', padding: '12px', backgroundColor: '#ffe6e6', borderRadius: '8px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@example.com"
              className="form-input"
              style={{ borderColor: fieldErrors.email ? '#ff3333' : 'var(--input-border)' }}
            />
            {fieldErrors.email && <div className="error-message">{fieldErrors.email}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="form-input"
              style={{ borderColor: fieldErrors.password ? '#ff3333' : 'var(--input-border)' }}
            />
            {fieldErrors.password && <div className="error-message">{fieldErrors.password}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="form-select"
              style={{ borderColor: fieldErrors.role ? '#ff3333' : 'var(--input-border)' }}
            >
              <option value="">Select a role</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
            {fieldErrors.role && <div className="error-message">{fieldErrors.role}</div>}
          </div>

          <button
            type="submit"
            className="form-button"
            disabled={loading}
            style={{ opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? <a onClick={onSwitchToSignup} style={{ cursor: 'pointer' }}>Sign Up</a>
        </div>
      </div>
    </div>
  );
}
