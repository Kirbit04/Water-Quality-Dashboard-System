import { useState } from 'react';
import Navigation from './Navigation';
import { contactAPI } from '../api';

export default function Contact({ onNavigate, user }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email) => {
    return email.includes('@') && email.endsWith('gmail.com');
  };

  const validateField = (name, value) => {
  const errors = {};
  const vals = name === 'all' ? formData : { ...formData, [name]: value };

  if (name === 'name' || name === 'all') {
    if (!vals.name) {
      errors.name = 'Name is required';
    } else if (vals.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
  }

  if (name === 'email' || name === 'all') {
    if (!vals.email) {
      errors.email = 'Email is required';
    } else if (!validateEmail(vals.email)) {
      errors.email = 'Please enter a valid email address';
    }
  }

  if (name === 'message' || name === 'all') {
    if (!vals.message) {
      errors.message = 'Message is required';
    } else if (vals.message.trim().length < 10) {
      errors.message = 'Message must be at least 10 characters';
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const validationErrors = validateField('all');
    setFieldErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setLoading(true);

    try {
      await contactAPI.submitMessage({
        name: formData.name,
        email: formData.email,
        message: formData.message,
      });

      setSubmitted(true);
      setFormData({ name: '', email: '', message: '' });
      setFieldErrors({});
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err) {
      setError(err.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
      <Navigation currentPage="contact" onNavigate={onNavigate} user={user} />
      {console.log('user passed to nav:', user)}

      <main className="contact-container">
        <h1 className="contact-title">
          Get in Touch with AquaGuard
        </h1>

        <div className="contact-content">
          {/* Our Details */}
          <div>
            <h2 className="contact-section-title">Our Details</h2>

            <ul className="contact-info">
              {/* General Inquiries */}
              <li className="contact-item">
                <span className="contact-label">General Inquiries</span>
                <p className="contact-value">+254 (0)20 123-4567</p>
                <div className="contact-label" style={{ marginTop: '4px' }}>Toll Free</div>
              </li>

              {/* Support Line */}
              <li className="contact-item">
                <span className="contact-label">Support Line</span>
                <p className="contact-value">+254 (0)20 987-6543</p>
              </li>

              {/* General Email */}
              <li className="contact-item">
                <span className="contact-label">General Email</span>
                <p className="contact-value">info@aquaguard.com</p>
              </li>

              {/* Support Email */}
              <li className="contact-item">
                <span className="contact-label">Support Email</span>
                <p className="contact-value">support@aquaguard.com</p>
              </li>
            </ul>
          </div>

          {/* Send Us a Message */}
          <div>
            <h2 className="contact-section-title">Send Us a Message</h2>

            {submitted && (
              <div style={{ backgroundColor: '#e6f7ed', borderRadius: '8px', color: '#00c853', padding: '12px', marginBottom: '16px', fontSize: '14px' }}>
                Thank you! Your message has been sent successfully.
              </div>
            )}
            {error && (
              <div style={{ backgroundColor: '#ffe6e6', borderRadius: '8px', color: '#ff3333', padding: '12px', marginBottom: '16px', fontSize: '14px' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="contact-form">
              <div className="contact-form-group">
                <label className="contact-form-label">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your Name"
                  className="contact-form-input"
                  style={{ borderColor: fieldErrors.name ? '#ff3333' : 'var(--input-border)' }}
                />
                {fieldErrors.name && <div className="error-message">{fieldErrors.name}</div>}
              </div>

              <div className="contact-form-group">
                <label className="contact-form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className="contact-form-input"
                  style={{ borderColor: fieldErrors.email ? '#ff3333' : 'var(--input-border)' }}
                />
                {fieldErrors.email && <div className="error-message">{fieldErrors.email}</div>}
              </div>

              <div className="contact-form-group">
                <label className="contact-form-label">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Your message here..."
                  rows="5"
                  className="contact-form-textarea"
                  style={{ borderColor: fieldErrors.message ? '#ff3333' : 'var(--input-border)' }}
                ></textarea>
                {fieldErrors.message && <div className="error-message">{fieldErrors.message}</div>}
              </div>

              <button
                type="submit"
                className="contact-form-button"
                disabled={loading}
                style={{ opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
              >
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </main>

      <footer className="footer">
        © 2026 AquaGuard. All rights reserved.
      </footer>
    </div>
  );
}
