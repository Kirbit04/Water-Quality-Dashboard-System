'use client';

import { useState } from 'react';
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

    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword || !formData.phone) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email');
      return;
    }

    const savedUsers = JSON.parse(localStorage.getItem('aquaguardUsers') || '[]');
    if (savedUsers.find((u) => u.email === formData.email)) {
      setError('Email already registered');
      return;
    }

    const newUser = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
    };

    savedUsers.push(newUser);
    localStorage.setItem('aquaguardUsers', JSON.stringify(savedUsers));

    onSignup({
      name: formData.name,
      email: formData.email,
      role: 'user',
      phone: formData.phone,
    });
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
          <div className="auth-logo">
            <img src={logo} alt="AquaGuard Logo" />
          </div>

        <h1 className="auth-title">Create your AquaGuard account</h1>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="form-full">
          <div className='form-group'>
            <label className="form-label">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              className="form-input"
            />
          </div>

          <div className='form-group'>
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john.doe@example.com"
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
            <label className="form-label">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              className="form-input"
            />
          </div>

          <div className='form-group'>
            <label className="form-label">Phone number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+254 xxx-xxx-xxx"
              className="form-input"
            />
          </div>

          <button
            type="submit"
            className="form-button"
          >
            Signup
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{' '}
          <button
            onClick={onSwitchToLogin}
            className="form-button"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
}
