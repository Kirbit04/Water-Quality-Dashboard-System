'use client';

import Navigation from './Navigation';

export default function Profile({ user, onLogout, onNavigate }) {
  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      onLogout();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage="profile" onNavigate={onNavigate} />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200">
          {/* Profile Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-5xl">👤</span>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{user.name}</h1>
            <p className="text-gray-600 mb-2">{user.email}</p>
            <p className="text-sm bg-blue-50 text-blue-700 inline-block px-3 py-1 rounded-full font-semibold">
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </p>
          </div>

          <hr className="my-8" />

          {/* User Details */}
          <div className="space-y-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Full Name</label>
              <p className="text-lg text-gray-900">{user.name}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Email Address</label>
              <p className="text-lg text-gray-900">{user.email}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Phone Number</label>
              <p className="text-lg text-gray-900">{user.phone}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Account Role</label>
              <p className="text-lg text-gray-900">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Member Since</label>
              <p className="text-lg text-gray-900">
                {new Date().toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>

          <hr className="my-8" />

          {/* Account Status */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-green-900 mb-2">✓ Account Active</h3>
            <p className="text-green-700 text-sm">
              Your account is in good standing and all services are active.
            </p>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg transition"
          >
            Logout
          </button>

          {/* Additional Options */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium">
              Edit Profile
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium">
              Change Password
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium">
              Privacy Settings
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium">
              Support
            </button>
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
