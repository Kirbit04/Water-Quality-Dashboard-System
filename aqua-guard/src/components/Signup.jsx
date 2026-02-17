import { useState } from 'react';
import { authAPI } from '../api';  
import logo from '../assets/AquAguard.png';



export default function Signup({ onSignup, onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone) => {
    if (!phone) return true; 
    const pattern = /^\+\d{1,3}\d{9,}$/;
    return pattern.test(phone.replace(/[\s\-]/g, ''));
  };

  const validateField = (name, value) => {
    const errors = {};
    
    if (name === 'name' || name === 'all') {
      if (!formData.name && name === 'all') {
        errors.name = 'Name is required';
      } else if (formData.name && formData.name.trim().length < 2) {
        errors.name = 'Name must be at least 2 characters';
      }
    }
    
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
    
    if (name === 'confirmPassword' || name === 'all') {
      if (!formData.confirmPassword && name === 'all') {
        errors.confirmPassword = 'Please confirm your password';
      } else if (formData.confirmPassword && formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }
    
    if (name === 'phone' || name === 'all') {
      if (!formData.phone && name === 'all') {
        errors.phone = 'Phone number is required';
      } else if (formData.phone && !validatePhone(formData.phone)) {
        errors.phone = 'Use format: +[country_code][9+ digits] e.g., +254723456789';
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
      const response = await authAPI.signup({
        full_name: formData.name,
        email: formData.email,
        password: formData.password,
        phone_number: formData.phone,
      });

      onSignup({
        id: response.userId || response.id,
        name: formData.name,
        email: formData.email,
        role: 'user',
        phone: formData.phone,
      });

      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
      });
    } catch (err) {
      // Parse error message for user-friendly display
      let userMessage = 'Failed to create account. Please try again.';
      let fieldErrors = {};

      // Check if error message contains specific validation errors
      if (err.message.includes('already')) {
        userMessage = 'Email already registered';
        fieldErrors.email = 'This email is already in use';
      } else if (err.message.includes('phone')) {
        userMessage = 'Phone number format is invalid';
        fieldErrors.phone = 'Use format: +[country_code][9+ digits] (e.g., +254723456789)';
      } else if (err.message.includes('email')) {
        userMessage = 'Email format is invalid';
        fieldErrors.email = 'Please enter a valid email address';
      } else if (err.message.includes('password')) {
        userMessage = 'Password does not meet requirements';
        fieldErrors.password = 'Password must be at least 6 characters';
      } else if (err.message.includes('name') || err.message.includes('full_name')) {
        userMessage = 'Name is invalid';
        fieldErrors.name = 'Name must be between 2-100 characters';
      } else {
        userMessage = err.message || userMessage;
      }

      setError(userMessage);
      setFieldErrors({ ...fieldErrors });
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

        <h1 className="auth-title">Create Your AquaGuard Account</h1>

        {error && (
          <div className="error-message" style={{ display: 'block', marginBottom: '16px', padding: '12px', backgroundColor: '#ffe6e6', borderRadius: '8px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              className="form-input"
              style={{ borderColor: fieldErrors.name ? '#ff3333' : 'var(--input-border)' }}
            />
            {fieldErrors.name && <div className="error-message">{fieldErrors.name}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john.doe@example.com"
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
            <label className="form-label">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              className="form-input"
              style={{ borderColor: fieldErrors.confirmPassword ? '#ff3333' : 'var(--input-border)' }}
            />
            {fieldErrors.confirmPassword && <div className="error-message">{fieldErrors.confirmPassword}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Phone number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+254 xxx-xxx-xxx"
              className="form-input"
              style={{ borderColor: fieldErrors.phone ? '#ff3333' : 'var(--input-border)' }}
            />
            {fieldErrors.phone && <div className="error-message">{fieldErrors.phone}</div>}
          </div>

          <button
            type="submit"
            className="form-button"
            disabled={loading}
            style={{ opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'Creating Account...' : 'Signup'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <a onClick={onSwitchToLogin} style={{ cursor: 'pointer' }}>Login</a>
        </div>
      </div>
    </div>
  );
}
