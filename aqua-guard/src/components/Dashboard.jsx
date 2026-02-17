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
    Good: 'badge-good',
    Moderate: 'badge-moderate',
    Critical: 'badge-critical',
  };

  return (
    <span className= {"kpi-badge ${statusColors[status]}" }>
      {status}
    </span>
  );
};

export default function Dashboard({ user, onNavigate }) {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
      <Navigation currentPage="dashboard" onNavigate={onNavigate} />

      <main className="dashboard-container">
        {/* Welcome Section */}
        <div className="welcome-section">
          <h1 className="welcome-title">Welcome to AquaGuard, {user.name}!</h1>
          <p className="welcome-subtitle">
            Your comprehensive overview of water quality. Monitor key parameters and receive
            actionable recommendations to maintain a healthy environment.
          </p>
          <button
            onClick={() => onNavigate('labtest')}
            className="welcome-button"
          >
            <span>⬆ Upload New Lab Test</span>
          </button>
        </div>

        {/* Key Performance Indicators */}
        <div className="kpi-section">
          <h2 className="section-title">Key Performance Indicators</h2>
          <div className="kpi-grid">
            {mockData.kpi.map((item, index) => (
              <div key={index} className="kpi-card">
                <div className="kpi-header">
                  <span className="kpi-icon">{item.icon}</span>
                  <span className="kpi-unit">{item.unit}</span>
                </div>
                <h3 className="kpi-label">{item.label}</h3>
                <div className="kpi-value">{item.value}</div>
                <StatusBadge status= {item.status} />
              </div>
            ))}
          </div>
        </div>

        {/* Health Score and Recommendations */}
        <div>
          {/* Health Score */}
          <div className="health-score">
            <p className="health-score-label">Health Score</p>
            <div className="health-score-value">88%</div>
            <p className="health-score-label">Excellent water quality</p>
          </div>

          {/* Actionable Recommendations */}
          <div className="recommendations-section">
            <h3 className='section-title'>Actionable Recommendations</h3>
            <ul className="recommendations-list">
              <li className='recommendation-item'>
                <h4 className="recommendations-title">pH Level</h4>
                <p className="recommendations-text">
                  Maintain regular monitoring to ensure stability.
                </p>
              </li>
              <li className='recommendation-item'>
                <h4 className="recommendations-title">Turbidity</h4>
                <p className="recommendations-text">
                  Ensure proper filtration system operation for clear water.
                </p>
              </li>
              <li className='recommendation-item'>
                <h4 className="recommendations-title">Salinity</h4>
                <p className="recommendations-text">
                  Monitor freshwater inflow and evaporation rates.
                </p>
              </li>
              <li className='recommendation-item'>
                <h4 className="recommendations-title">Dissolved Oxygen</h4>
                <p className="recommendations-text">
                  Consider increasing aeration or introducing aquatic plants to boost oxygen levels.
                </p>
              </li>
              <li className='recommendation-item'>
                <h4 className="recommendations-title">Nitrates</h4>
                <p className="recommendations-text">
                  Implement nutrient reduction strategies, check for agricultural runoff or excessive fertilization.
                </p>
              </li>
              <li className='recommendation-item'>
                <h4 className="recommendations-title">Phosphates</h4>
                <p className="recommendations-text">
                  Address potential sources of phosphate pollution to prevent algal blooms.
                </p>
              </li>
            </ul>
          </div>
        </div>
      </main>

      <footer className="footer">
        <div>
          © 2026 AquaGuard. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
