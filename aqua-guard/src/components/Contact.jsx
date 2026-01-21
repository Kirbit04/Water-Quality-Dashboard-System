'use client';

import { useState } from 'react';
import Navigation from './Navigation';

export default function Contact({ onNavigate }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.message) {
      setSubmitted(true);
      setFormData({ name: '', email: '', message: '' });
      setTimeout(() => setSubmitted(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage="contact" onNavigate={onNavigate} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-blue-600 text-center mb-12">
          Get in Touch with AquaGuard
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Our Details */}
          <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Our Details</h2>

            <div className="space-y-8">
              {/* General Inquiries */}
              <div>
                <div className="flex items-center mb-2">
                  <span className="text-blue-600 text-xl mr-3">📞</span>
                  <h3 className="font-bold text-gray-900">General Inquiries</h3>
                </div>
                <p className="text-blue-600 font-semibold ml-8">+254 (0)20 123-4567</p>
                <p className="text-blue-600 ml-8">Toll Free</p>
              </div>

              {/* Support Line */}
              <div>
                <div className="flex items-center mb-2">
                  <span className="text-blue-600 text-xl mr-3">☎️</span>
                  <h3 className="font-bold text-gray-900">Support Line</h3>
                </div>
                <p className="text-blue-600 font-semibold ml-8">+254 (0)20 987-6543</p>
              </div>

              {/* General Email */}
              <div>
                <div className="flex items-center mb-2">
                  <span className="text-blue-600 text-xl mr-3">✉️</span>
                  <h3 className="font-bold text-gray-900">General Email</h3>
                </div>
                <p className="text-blue-600 font-semibold ml-8">info@aquaguard.com</p>
              </div>

              {/* Support Email */}
              <div>
                <div className="flex items-center mb-2">
                  <span className="text-blue-600 text-xl mr-3">📧</span>
                  <h3 className="font-bold text-gray-900">Support Email</h3>
                </div>
                <p className="text-blue-600 font-semibold ml-8">support@aquaguard.com</p>
              </div>
            </div>
          </div>

          {/* Send Us a Message */}
          <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Send Us a Message</h2>

            {submitted && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
                Thank you! Your message has been sent successfully.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your Name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Your message here..."
                  rows="5"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-full transition"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-gray-600 text-sm">
          © 2026 AquaGuard. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
