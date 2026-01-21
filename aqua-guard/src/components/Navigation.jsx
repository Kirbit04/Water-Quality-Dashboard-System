'use client';

import logo from '../assets/AquAguard.png';

export default function Navigation({ currentPage, onNavigate }) {
  return (
    <nav className="navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left Navigation */}
          <div className="navbar-left">
            <button
              onClick={() => onNavigate('dashboard')}
              className={`flex items-center space-x-1 py-2 px-1 border-b-2 transition ${
                currentPage === 'dashboard'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <span>🏠</span>
              <span className="text-sm font-medium">Home</span>
            </button>

            <button
              onClick={() => onNavigate('about')}
              className={`flex items-center space-x-1 py-2 px-1 border-b-2 transition ${
                currentPage === 'about'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <span>ℹ️</span>
              <span className="text-sm font-medium">About Us</span>
            </button>

            <button
              onClick={() => onNavigate('contact')}
              className={`flex items-center space-x-1 py-2 px-1 border-b-2 transition ${
                currentPage === 'contact'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <span>✉️</span>
              <span className="text-sm font-medium">Contact</span>
            </button>
          </div>

          {/* Center Logo */}
          <div className="navbar-logo">
            <img src={logo} alt="AquaGuard Logo" className="w-full h-full" />
          </div>

          {/* Right - Profile */}
          <button
            onClick={() => onNavigate('profile')}
            className="navbar-right"
            title="Profile"
          >
            <span className="profile-icon">👤</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
