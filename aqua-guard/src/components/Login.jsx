'use client';

import { useState } from 'react';
import logo from '../assets/AquAguard.png';

export default function Login({ onLogin, onSwitchToSignup }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password || !formData.role) {
      setError('Please fill in all fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email');
      return;
    }

    const savedUsers = JSON.parse(localStorage.getItem('aquaguardUsers') || '[]');
    const user = savedUsers.find((u) => u.email === formData.email && u.password === formData.password);

    if (!user) {
      setError('Invalid email or password');
      return;
    }

    onLogin({
      name: user.name,
      email: user.email,
      role: formData.role,
      phone: user.phone,
    });
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
          <div className="auth-logo">
            <img src={logo} alt="AquaGuard Logo"/>
          </div>
        <h1 className="auth-title">Welcome Back!</h1>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="form-full">
          <div className='form-group'>
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@example.com"
              className="form-input"
            />
          </div>

          <div className='form-group'>
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="form-input"
            />
          </div>

          <div className='form-group'>
            <label className="form-label">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="form-select"
            >
              <option value="">Select a role</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          </div>

          <button
            type="submit"
            className="form-button"
          >
            Login
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account?{' '}
          <button
            onClick={onSwitchToSignup}
            className="form-button"
          >
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
}
