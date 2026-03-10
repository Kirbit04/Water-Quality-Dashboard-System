import { useState } from 'react';
import { authAPI } from '../api';
import logo from '../assets/AquAguard.png';

// Validation Rules 
const login_valid_rules = {
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
    errorMessages: {
      required: 'Password is required',
      minLength: 'Password must be at least 6 characters',
    }
  },
  role: {
    required: true,
    errorMessages: {
      required: 'Please select a role',
    }
  }
};

// Validator Function
const validateLoginField = (fieldName, value) => {
  const rule = login_valid_rules[fieldName];
  if (!rule) return null;

  // Check required
  if (rule.required && (!value || value.trim() === '')) {
    return rule.errorMessages.required;
  }

  // Skip validation if field is empty
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

  return null;
};

// Batch Validation Function
const validateLoginForm = (formData) => {
  const errors = {};
  Object.keys(login_valid_rules).forEach(fieldName => {
    const error = validateLoginField(fieldName, formData[fieldName]);
    if (error) errors[fieldName] = error;
  });
  return errors;
};

export default function Login({ onLogin, onSwitchToSignup }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: '',
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
    
    // Real-time validation for this field
    const fieldError = validateLoginField(name, value);
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
    const validationErrors = validateLoginForm(formData);
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
        role: response.role || formData.role,
      });
      console.log('User role:', formData.role);
      console.log('Token:', response.token)

    } catch (err) {
      // Backend Error Mapping
      const errorMessage = err.message || 'Invalid email or password';
      setError(errorMessage);
      
      if (errorMessage.toLowerCase().includes('password')) {
        setFieldErrors({ password: 'Incorrect password' });
      } else if (errorMessage.toLowerCase().includes('email')) {
        setFieldErrors({ email: 'Email not found' });
      } else {
        setFieldErrors({ password: 'Credentials do not match' });
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
