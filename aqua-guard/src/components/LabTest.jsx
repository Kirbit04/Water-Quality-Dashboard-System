import { useState } from 'react';
import Navigation from './Navigation';
import { labTestAPI } from '../api';

export default function LabTest({ user, onNavigate }) {
  const [formData, setFormData] = useState({
    occupation: '',
    location: '',
    dateOfTest: '2026-01-17',
    ph: '',
    turbidity: '',
    salinity: '',
    dissolvedOxygen: '',
    nitrates: '',
    phosphates: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const validateField = (name, value) => {
    const errors = {};
    const val = formData[name] !== undefined ? formData[name] : value;
    
    if ((name === 'occupation' || name === 'all') && !formData.occupation && name === 'all') {
      errors.occupation = 'Occupation is required';
    }
    
    if ((name === 'location' || name === 'all') && !formData.location && name === 'all') {
      errors.location = 'Location is required';
    }
    
    if ((name === 'ph' || name === 'all') && !formData.ph && name === 'all') {
      errors.ph = 'pH level is required';
    } else if (formData.ph && (isNaN(formData.ph) || formData.ph < 0 || formData.ph > 14)) {
      errors.ph = 'pH must be between 0 and 14';
    }
    
    if ((name === 'turbidity' || name === 'all') && !formData.turbidity && name === 'all') {
      errors.turbidity = 'Turbidity is required';
    } else if (formData.turbidity && (isNaN(formData.turbidity) || formData.turbidity < 0)) {
      errors.turbidity = 'Turbidity must be a positive number';
    }
    
    if ((name === 'salinity' || name === 'all') && !formData.salinity && name === 'all') {
      errors.salinity = 'Salinity is required';
    } else if (formData.salinity && (isNaN(formData.salinity) || formData.salinity < 0)) {
      errors.salinity = 'Salinity must be a positive number';
    }
    
    if ((name === 'dissolvedOxygen' || name === 'all') && !formData.dissolvedOxygen && name === 'all') {
      errors.dissolvedOxygen = 'Dissolved oxygen is required';
    } else if (formData.dissolvedOxygen && (isNaN(formData.dissolvedOxygen) || formData.dissolvedOxygen < 0)) {
      errors.dissolvedOxygen = 'Dissolved oxygen must be a positive number';
    }
    
    if ((name === 'nitrates' || name === 'all') && !formData.nitrates && name === 'all') {
      errors.nitrates = 'Nitrates is required';
    } else if (formData.nitrates && (isNaN(formData.nitrates) || formData.nitrates < 0)) {
      errors.nitrates = 'Nitrates must be a positive number';
    }
    
    if ((name === 'phosphates' || name === 'all') && !formData.phosphates && name === 'all') {
      errors.phosphates = 'Phosphates is required';
    } else if (formData.phosphates && (isNaN(formData.phosphates) || formData.phosphates < 0)) {
      errors.phosphates = 'Phosphates must be a positive number';
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
    setSubmitMessage('');
    
    const validationErrors = validateField('all');
    setFieldErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setSubmitMessage('Please fix the errors below before submitting');
      return;
    }

    setLoading(true);

    try {
      const response = await labTestAPI.submit({
        ...formData,
        userId: user?.id,
      });

      setSubmitMessage('Lab test submitted successfully!');
      setFormData({
        occupation: '',
        location: '',
        dateOfTest: '2026-01-17',
        ph: '',
        turbidity: '',
        salinity: '',
        dissolvedOxygen: '',
        nitrates: '',
        phosphates: '',
      });
      setFieldErrors({});
      
      setTimeout(() => {
        setSubmitMessage('');
      }, 3000);
    } catch (err) {
      setSubmitMessage(`Error: ${err.message || 'Failed to submit lab test'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
      <Navigation currentPage="labtest" onNavigate={onNavigate} />

      <main className="lab-test-container">
        <div className="lab-test-form">
          <h1 className="auth-title" style={{ fontSize: '28px', marginBottom: '8px' }}>Lab Test Manual Input</h1>
          <p className="auth-subtitle" style={{ marginBottom: '32px', textAlign: 'left' }}>
            Manually enter your water quality parameters below to save and analyze results.
          </p>

          <form onSubmit={handleSubmit}>
            {/* General Information */}
            <div>
              <h2 className="form-section-title">General Information</h2>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Occupation</label>
                  <select
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleChange}
                    className="form-select"
                    style={{ borderColor: fieldErrors.occupation ? '#ff3333' : 'var(--input-border)' }}
                  >
                    <option value="">Select Occupation</option>
                    <option value="Water Supplier">Water Supplier</option>
                    <option value="Farmer">Farmer</option>
                    <option value="Livestock Farmer">Livestock Farmer</option>
                    <option value="Local">Local</option>
                  </select>
                  {fieldErrors.occupation && <div className="error-message">{fieldErrors.occupation}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <select
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="form-select"
                    style={{ borderColor: fieldErrors.location ? '#ff3333' : 'var(--input-border)' }}
                  >
                    <option value="">Select Location</option>
                    <option value="Ng'ong">Ng'ong</option>
                    <option value="Ongata Rongai">Ongata Rongai</option>
                    <option value="Rimpa">Rimpa</option>
                  </select>
                  {fieldErrors.location && <div className="error-message">{fieldErrors.location}</div>}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Date of Test</label>
                <input
                  type="date"
                  name="dateOfTest"
                  value={formData.dateOfTest}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>

            {/* Water Quality Parameters */}
            <div>
              <h2 className="form-section-title">Water Quality Parameters</h2>
              <div className="form-grid-3">
                <div className="form-group">
                  <label className="form-label">pH</label>
                  <input
                    type="number"
                    name="ph"
                    value={formData.ph}
                    onChange={handleChange}
                    step="0.1"
                    placeholder="7.2"
                    className="form-input"
                    style={{ borderColor: fieldErrors.ph ? '#ff3333' : 'var(--input-border)' }}
                  />
                  {fieldErrors.ph && <div className="error-message">{fieldErrors.ph}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Turbidity</label>
                  <input
                    type="number"
                    name="turbidity"
                    value={formData.turbidity}
                    onChange={handleChange}
                    step="0.1"
                    placeholder="0.8"
                    className="form-input"
                    style={{ borderColor: fieldErrors.turbidity ? '#ff3333' : 'var(--input-border)' }}
                  />
                  {fieldErrors.turbidity && <div className="error-message">{fieldErrors.turbidity}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Salinity</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="number"
                      name="salinity"
                      value={formData.salinity}
                      onChange={handleChange}
                      placeholder="250"
                      className="form-input"
                      style={{ flex: 1, borderColor: fieldErrors.salinity ? '#ff3333' : 'var(--input-border)' }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', fontSize: '13px', color: '#666666' }}>ppm</div>
                  </div>
                  {fieldErrors.salinity && <div className="error-message">{fieldErrors.salinity}</div>}
                </div>
              </div>

              <div className="form-grid-3">
                <div className="form-group">
                  <label className="form-label">Dissolved Oxygen</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="number"
                      name="dissolvedOxygen"
                      value={formData.dissolvedOxygen}
                      onChange={handleChange}
                      step="0.1"
                      placeholder="8.5"
                      className="form-input"
                      style={{ flex: 1, borderColor: fieldErrors.dissolvedOxygen ? '#ff3333' : 'var(--input-border)' }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', fontSize: '13px', color: '#666666' }}>mg/L</div>
                  </div>
                  {fieldErrors.dissolvedOxygen && <div className="error-message">{fieldErrors.dissolvedOxygen}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Nitrates</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="number"
                      name="nitrates"
                      value={formData.nitrates}
                      onChange={handleChange}
                      step="0.1"
                      placeholder="1.5"
                      className="form-input"
                      style={{ flex: 1, borderColor: fieldErrors.nitrates ? '#ff3333' : 'var(--input-border)' }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', fontSize: '13px', color: '#666666' }}>mg/L</div>
                  </div>
                  {fieldErrors.nitrates && <div className="error-message">{fieldErrors.nitrates}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Phosphates</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="number"
                      name="phosphates"
                      value={formData.phosphates}
                      onChange={handleChange}
                      step="0.01"
                      placeholder="0.02"
                      className="form-input"
                      style={{ flex: 1, borderColor: fieldErrors.phosphates ? '#ff3333' : 'var(--input-border)' }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', fontSize: '13px', color: '#666666' }}>mg/L</div>
                  </div>
                  {fieldErrors.phosphates && <div className="error-message">{fieldErrors.phosphates}</div>}
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div>
              <h2 className="form-section-title">Recommendations</h2>
              <p className="form-section-description" style={{ backgroundColor: '#f0f4f8', padding: '16px', margin: '0' }}>
                Based on the entered data, regular monitoring is advised. Adjustments may be
                necessary if parameters show consistent deviations from optimal levels.
              </p>
            </div>

            {/* Buttons */}
            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
              >
                Upload Test
              </button>
              <button
                type="submit"
                className="btn btn-primary"
              >
                Save/Test Submit
              </button>
            </div>
          </form>
        </div>
      </main>

      <footer className="footer">
        © 2026 AquaGuard. All rights reserved.
      </footer>
    </div>
  );
}
