import { useState, useEffect } from 'react';
import Navigation from './Navigation';
import { labTestAPI } from '../api';

// WHO thresholds for status badges
const getStatus = (param, value) => {
  if (value === null || value === undefined) return 'Unknown';
  const v = parseFloat(value);
  switch (param) {
    case 'ph':
      return v >= 6.5 && v <= 8.5 ? 'Good' : v >= 6.0 && v <= 9.0 ? 'Moderate' : 'Critical';
    case 'turbidity':
      return v <= 4 ? 'Good' : v <= 10 ? 'Moderate' : 'Critical';
    case 'dissolved_oxygen':
      return v >= 6.5 ? 'Good' : v >= 4 ? 'Moderate' : 'Critical';
    case 'nitrates':
      return v <= 10 ? 'Good' : v <= 50 ? 'Moderate' : 'Critical';
    case 'phosphates':
      return v <= 0.1 ? 'Good' : v <= 0.5 ? 'Moderate' : 'Critical';
    case 'salinity':
      return v <= 500 ? 'Good' : v <= 1500 ? 'Moderate' : 'Critical';
    default:
      return 'Unknown';
  }
};

// mapping API response to KPI cards with status
const buildKPIs = (parameters) => [
  { label: 'pH Level',          key: 'ph',               value: parameters.ph,               unit: 'pH Units', icon: '💧' },
  { label: 'Turbidity',         key: 'turbidity',         value: parameters.turbidity,         unit: 'NTU',      icon: '〰️' },
  { label: 'Salinity',          key: 'salinity',          value: parameters.salinity,          unit: 'µS/cm',    icon: '❄️' },
  { label: 'Dissolved Oxygen',  key: 'dissolved_oxygen',  value: parameters.dissolved_oxygen,  unit: 'mg/L',     icon: '💨' },
  { label: 'Nitrates',          key: 'nitrates',          value: parameters.nitrates,          unit: 'mg/L',     icon: '📊' },
  { label: 'Phosphates',        key: 'phosphates',        value: parameters.phosphates,        unit: 'mg/L',     icon: '⚗️' },
].map(kpi => ({ ...kpi, status: getStatus(kpi.key, kpi.value) }));

// Health score label based on score thresholds
const getHealthLabel = (score) => {
  if (score >= 90) return 'Excellent water quality';
  if (score >= 70) return 'Good water quality';
  if (score >= 50) return 'Moderate water quality';
  if (score >= 30) return 'Poor water quality';
  return 'Critical water quality';
};

// setting status colors
const StatusBadge = ({ status }) => {
  const statusColors = {
    Good:     'badge-good',
    Moderate: 'badge-moderate',
    Critical: 'badge-critical',
    High:  'badge-critical',
  };
  return (
    <span className={'kpi-badge ' + (statusColors[status] || 'badge-moderate')}>
      {status}
    </span>
  );
};

const LoadingSpinner = () => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', minHeight: '60vh', gap: '16px' }}>
    <div style={{
      width: '48px', height: '48px', border: '4px solid #e0e0e0',
      borderTop: '4px solid #3b82f6', borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    }} />
    <p style={{ color: '#6b7280', fontSize: '14px' }}>Loading your water quality data...</p>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

const ErrorBanner = ({ message }) => (
  <div style={{ margin: '24px', padding: '16px', backgroundColor: '#ffe6e6',
                borderRadius: '8px', color: '#cc0000', textAlign: 'center' }}>
    {message}
  </div>
);

const NoDataBanner = () => (
  <div style={{ textAlign: 'center', padding: '60px 24px', color: '#6b7280' }}>
    <p style={{ fontSize: '18px', marginBottom: '16px' }}>No lab tests found.</p>
  </div>
);

// setting main dashboard page
export default function Dashboard({ user, onNavigate }) {
  const [kpis, setKpis]               = useState([]);
  const [healthScore, setHealthScore] = useState(null);
  const [riskLevel, setRiskLevel]     = useState(null);
  const [wqiScore, setWqiScore]       = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [testDate, setTestDate]       = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [hasData, setHasData]         = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Step 1 — fetch all tests for this user, pick the most recent
        const tests = await labTestAPI.getUserTests(user.id);

        if (!tests || tests.length === 0) {
          setHasData(false);
          return;
        }

        //setting test date for the most recent test
        const sortedTests = [...tests].sort((a, b) =>
          new Date(b.created_at) - new Date(a.created_at)
        );
        const latestTest = sortedTests[0];
        setTestDate(latestTest.date_of_test || latestTest.created_at);

        // Step 2 — fetch ML results + recommendations for that test
        let results = null
        try{
          await labTestAPI.processTest(latestTest.id);
          results = await labTestAPI.getResults(latestTest.id);
        }catch{
          const parameters = {
            ph:               latestTest.ph,
            turbidity:        latestTest.turbidity,
            dissolved_oxygen: latestTest.dissolved_oxygen,
            nitrates:         latestTest.nitrates,
            phosphates:       latestTest.phosphates,
            salinity:         latestTest.salinity,
          };
          setKpis(buildKPIs(parameters));
          setHasData(true);
          return;
        }

        // Step 3 — populate all state from the results response
        setKpis(buildKPIs(results.parameters));
        setHealthScore(results.health_score);
        setRiskLevel(results.risk_level);
        setWqiScore(results.wqi_score);
        setRecommendations(results.recommendations || []);
        setHasData(true);

      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError('Failed to load water quality data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user.id]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
      <Navigation currentPage="dashboard" onNavigate={onNavigate} user={user} />

      <main className="dashboard-container">
        {/* Welcome Section */}
        <div className="welcome-section">
          <h1 className="welcome-title">Welcome to AquaGuard, {user.name}!</h1>
          <p className="welcome-subtitle">
            Your comprehensive overview of water quality. Monitor key parameters and receive
            actionable recommendations to maintain a healthy environment.
          </p>
          {testDate && (
            <p style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '12px' }}>
              Showing results for most recent test —{' '}
              {new Date(testDate).toLocaleDateString('en-GB', {
                day: 'numeric', month: 'long', year: 'numeric'
              })}
            </p>
          )}
          <button className="welcome-button" onClick={() => onNavigate('labtest')}>
            Upload New Lab Test
          </button>
        </div>

        {/* Loading / Error / No Data states */}
        {loading && <LoadingSpinner />}
        {!loading && error && <ErrorBanner message={error} />}
        {!loading && !error && !hasData && <NoDataBanner onNavigate={onNavigate} />}

        {/* Main content — only shown when data is available */}
        {!loading && !error && hasData && (
          <>
            {/* KPI Grid */}
            <div className="kpi-section">
              <h2 className="section-title">Key Performance Indicators</h2>
              <div className="kpi-grid">
                {kpis.map((item, index) => (
                  <div key={index} className="kpi-card">
                    <div className="kpi-header">
                      <span className="kpi-icon">{item.icon}</span>
                      <span className="kpi-unit">{item.unit}</span>
                    </div>
                    <h3 className="kpi-label">{item.label}</h3>
                    <div className="kpi-value">
                      {item.value !== null && item.value !== undefined
                        ? parseFloat(item.value).toFixed(2)
                        : '—'}
                    </div>
                    <StatusBadge status={item.status} />
                  </div>
                ))}
              </div>
            </div>

            {/* Health Score + Recommendations */}
            <div>
              {/* Health Score */}
              {healthScore !== null && (
                <div className="health-score">
                  <p className="health-score-label">Health Score</p>
                  <div className="health-score-value">{healthScore}%</div>
                  <p className="health-score-label">{getHealthLabel(healthScore)}</p>
                  {wqiScore !== null && (
                    <p style={{ fontSize: '13px', color: '#9ca3af', marginTop: '4px' }}>
                      WQI: {parseFloat(wqiScore).toFixed(1)} — {riskLevel}
                    </p>
                  )}
                </div>
              )}

              {/* Recommendations */}
              {recommendations.length > 0 && (
                <div className="recommendations-section">
                  <h3 className="section-title">Actionable Recommendations</h3>
                  <ul className="recommendations-list">
                    {recommendations.map((rec) => (
                      <li key={rec.id} className="recommendation-item">
                        <div style={{ display: 'flex', justifyContent: 'space-between',
                                      alignItems: 'center', marginBottom: '4px' }}>
                          <h4 className="recommendations-title">{rec.recommendation_type}</h4>
                          <StatusBadge status={rec.severity_level} />
                        </div>
                        <p className="recommendations-text">{rec.recommendation_text}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      <footer className="footer">
        <div>© 2026 AquaGuard. All rights reserved.</div>
      </footer>
    </div>
  );
}