import { useState } from 'react';
import { authAPI } from '../api';  
import logo from '../assets/AquAguard.png';

// Validation Rules 
const Validation_rules = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 100,
    errorMessages: {
      required: 'Name is required',
      minLength: 'Name must be at least 2 characters',
      maxLength: 'Name must be at most 100 characters',
    }
  },
  email: {
    required: true,
    validate: (value) => value.includes('@') && value.split('@')[1]?.includes('.'),
    errorMessages: {
      required: 'Email is required',
      pattern: 'Please enter a valid email address',
    }
  },
  password: {
    required: true,
    minLength: 6,
    maxLength: 72,
    errorMessages: {
      required: 'Password is required',
      minLength: 'Password must be at least 6 characters',
      maxLength: 'Password must be at most 72 characters',
    }
  },
  confirmPassword: {
    required: true,
    match: 'password',
    errorMessages: {
      required: 'Please confirm your password',
      match: 'Passwords do not match',
    }
  },
  phone: {
    required: true,
    validate: (value) => {
      const stripped = value.replace(/[\s\-]/g, '');
      return stripped.startsWith('+') && !isNaN(stripped.slice(1)) && stripped.length >= 10;
    },
    errorMessages: {
      required: 'Phone number is required',
      pattern: 'Use format: +[country_code][9+ digits] (e.g., +254723456789)',
    }
  }
};

// Validator Function
const validateFieldValue = (fieldName, value, allFormData) => {
  const rule = Validation_rules[fieldName];
  if (!rule) return null;

  // Handle optional fields
  if (rule.optional && !value) return null;

  // Check required
  if (rule.required && (!value || value.trim() === '')) {
    return rule.errorMessages.required;
  }

  // Skip validation if field is empty and optional
  if (!value || value.trim() === '') return null;

  // Check minLength and maxLength
  if (rule.minLength && value.length < rule.minLength) {
    return rule.errorMessages.minLength;
  }
  if (rule.maxLength && value.length > rule.maxLength) {
    return rule.errorMessages.maxLength;
  }

  // Check pattern
  if (rule.validate && !rule.validate(value)) {
    return rule.errorMessages.pattern;
  }

  // Check match (for confirmPassword)
  if (rule.match && value !== allFormData[rule.match]) {
    return rule.errorMessages.match;
  }

  return null;
};

// Batch Validation Function
const validateForm = (formData) => {
  const errors = {};
  
  Object.keys(Validation_rules).forEach(fieldName => {
    const error = validateFieldValue(fieldName, formData[fieldName], formData);
    if (error) {
      errors[fieldName] = error;
    }
  });

  return errors;
};
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // validation for the field updates
    const fieldError = validateFieldValue(name, value, { ...formData, [name]: value });
    const newErrors = { ...fieldErrors };
    
    if (fieldError) {
      newErrors[name] = fieldError;
    } else {
      delete newErrors[name];
    }
    
    setFieldErrors(newErrors);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate all fields
    const validationErrors = validateForm(formData);

    const getByteLength = (str) => new TextEncoder().encode(str).length;
    if (getByteLength(formData.password) > 72) {
        validationErrors.password = 'Password is too long.';
    }
    setFieldErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setError('Please fix the errors below');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.signup({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
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
      // error message for user-friendly display
      let userMessage = 'Failed to create account. Please try again.';
      let fieldErrorsFromAPI = {};

      console.error('Signup error details:', err.message); // Log for debugging

      // Backend Error Mapping
      const errorMap = {
        'already': { message: 'Email already registered', field: 'email', detail: 'This email is already in use' },
        'phone': { message: 'Phone number format is invalid', field: 'phone', detail: 'Use format: +[country_code][9+ digits] (e.g., +254723456789)' },
        'email': { message: 'Email format is invalid', field: 'email', detail: 'Please enter a valid email address' },
        'password': { message: 'Password is too long', field: 'password', detail: 'Password must not exceed 72 characters' },
        'name': { message: 'Name is invalid', field: 'name', detail: 'Please check your name' },
      };

      for (const [key, errorInfo] of Object.entries(errorMap)) {
        if (err.message.toLowerCase().includes(key)) {
          userMessage = errorInfo.message;
          fieldErrorsFromAPI[errorInfo.field] = errorInfo.detail;
          break;
        }
      }

      setError(userMessage);
      if (Object.keys(fieldErrorsFromAPI).length > 0) {
        setFieldErrors(fieldErrorsFromAPI);
      }
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
