'use client';

import Navigation from './Navigation';

const mockData = {
  kpi: [
    { label: 'pH Level', value: '7.2', unit: 'pH Units', icon: '💧', status: 'Good' },
    { label: 'Turbidity', value: '2', unit: 'NTU', icon: '〰️', status: 'Good' },
    { label: 'Salinity', value: '34', unit: 'PPT', icon: '❄️', status: 'Good' },
    { label: 'Dissolved Oxygen', value: '5.1', unit: 'mg/L', icon: '💨', status: 'Moderate' },
    { label: 'Nitrates', value: '18', unit: 'ppm', icon: '📊', status: 'Critical' },
    { label: 'Phosphates', value: '0.6', unit: 'ppm', icon: '⚗️', status: 'Moderate' },
  ],
};

const StatusBadge = ({ status }) => {
  const statusColors = {
    Good: 'bg-green-100 text-green-800',
    Moderate: 'bg-yellow-100 text-yellow-800',
    Critical: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[status]}`}>
      {status}
    </span>
  );
};

export default function Dashboard({ user, onNavigate }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage="dashboard" onNavigate={onNavigate} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-12 border border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome to AquaGuard, {user.name}!</h1>
          <p className="text-gray-600 mb-6">
            Your comprehensive overview of water quality. Monitor key parameters and receive
            actionable recommendations to maintain a healthy aquatic environment.
          </p>
          <button
            onClick={() => onNavigate('labtest')}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-full transition inline-flex items-center space-x-2"
          >
            <span>⬆️</span>
            <span>Upload New Lab Test</span>
          </button>
        </div>

        {/* Key Performance Indicators */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Key Performance Indicators</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockData.kpi.map((item, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl">{item.icon}</span>
                  <span className="text-xs font-medium text-gray-500">{item.unit}</span>
                </div>
                <h3 className="text-sm text-gray-600 mb-2">{item.label}</h3>
                <div className="text-3xl font-bold text-gray-900 mb-3">{item.value}</div>
                <StatusBadge status={item.status} />
              </div>
            ))}
          </div>
        </div>

        {/* Health Score and Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Health Score */}
          <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200 lg:col-span-1">
            <p className="text-gray-600 mb-2">Health Score</p>
            <div className="text-4xl font-bold text-gray-900">88%</div>
            <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '88%' }}></div>
            </div>
            <p className="text-sm text-gray-500 mt-2">Excellent water quality</p>
          </div>

          {/* Actionable Recommendations */}
          <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200 lg:col-span-2">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Actionable Recommendations</h3>
            <div className="space-y-4">
              <div className="pb-4 border-b border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-1">pH Level</h4>
                <p className="text-sm text-gray-600">
                  Maintain regular monitoring to ensure stability.
                </p>
              </div>
              <div className="pb-4 border-b border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-1">Turbidity</h4>
                <p className="text-sm text-gray-600">
                  Ensure proper filtration system operation for clear water.
                </p>
              </div>
              <div className="pb-4 border-b border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-1">Salinity</h4>
                <p className="text-sm text-gray-600">
                  Monitor freshwater inflow and evaporation rates.
                </p>
              </div>
              <div className="pb-4 border-b border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-1">Dissolved Oxygen</h4>
                <p className="text-sm text-gray-600">
                  Consider increasing aeration or introducing aquatic plants to boost oxygen levels.
                </p>
              </div>
              <div className="pb-4 border-b border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-1">Nitrates</h4>
                <p className="text-sm text-gray-600">
                  Implement nutrient reduction strategies, check for agricultural runoff or excessive fertilization.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Phosphates</h4>
                <p className="text-sm text-gray-600">
                  Address potential sources of phosphate pollution to prevent algal blooms.
                </p>
              </div>
            </div>
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
