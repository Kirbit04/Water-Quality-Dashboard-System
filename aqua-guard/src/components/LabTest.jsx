'use client';

import { useState } from 'react';
import Navigation from './Navigation';

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Lab test saved successfully! This is a demo - data is stored in localStorage.');
    const tests = JSON.parse(localStorage.getItem('labTests') || '[]');
    tests.push({ ...formData, timestamp: new Date().toISOString() });
    localStorage.setItem('labTests', JSON.stringify(tests));
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
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage="labtest" onNavigate={onNavigate} />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Lab Test Manual Input</h1>
          <p className="text-gray-600 mb-8">
            Manually enter your water quality parameters below to save and analyze results.
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* General Information */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6">General Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Occupation</label>
                  <input
                    type="text"
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Test</label>
                <input
                  type="date"
                  name="dateOfTest"
                  value={formData.dateOfTest}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Water Quality Parameters */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6">Water Quality Parameters</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">pH</label>
                  <input
                    type="number"
                    name="ph"
                    value={formData.ph}
                    onChange={handleChange}
                    step="0.1"
                    placeholder="7.2"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Turbidity</label>
                  <input
                    type="number"
                    name="turbidity"
                    value={formData.turbidity}
                    onChange={handleChange}
                    step="0.1"
                    placeholder="0.8"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Salinity</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      name="salinity"
                      value={formData.salinity}
                      onChange={handleChange}
                      placeholder="250"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex items-center text-gray-600 text-sm">ppm</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dissolved Oxygen</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      name="dissolvedOxygen"
                      value={formData.dissolvedOxygen}
                      onChange={handleChange}
                      step="0.1"
                      placeholder="8.5"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex items-center text-gray-600 text-sm">mg/L</div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nitrates</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      name="nitrates"
                      value={formData.nitrates}
                      onChange={handleChange}
                      step="0.1"
                      placeholder="1.5"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex items-center text-gray-600 text-sm">mg/L</div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phosphates</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      name="phosphates"
                      value={formData.phosphates}
                      onChange={handleChange}
                      step="0.01"
                      placeholder="0.02"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex items-center text-gray-600 text-sm">mg/L</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Recommendations</h2>
              <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">
                Based on the entered data, regular monitoring is advised. Adjustments may be
                necessary if parameters show consistent deviations from optimal levels.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 justify-end">
              <button
                type="button"
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition"
              >
                Upload Test
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition"
              >
                Save/Test Submit
              </button>
            </div>
          </form>
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
