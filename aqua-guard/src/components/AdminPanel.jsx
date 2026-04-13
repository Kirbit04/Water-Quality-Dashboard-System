import { useState, useEffect } from 'react';
import { adminAPI, labTestAPI, authAPI } from '../api';
import logo from '../assets/AquAguard.png';

//Sidebar nav items 
const NAV_ITEMS = [
  { key: 'overview',        label: 'Overview',        icon: '📊' },
  { key: 'users',           label: 'Users',           icon: '👥' },
  { key: 'lab-tests',       label: 'Lab Tests',       icon: '🧪' },
  { key: 'model-results',   label: 'Model Results',   icon: '🤖' },
  { key: 'recommendations', label: 'Recommendations', icon: '💡' },
];

// Confirm delete modal
const ConfirmModal = ({ message, onConfirm, onCancel }) => (
  <div style={{
    position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
  }}>
    <div style={{
      background: '#fff', borderRadius: '12px', padding: '32px',
      maxWidth: '400px', width: '90%', textAlign: 'center',
    }}>
      <p style={{ fontSize: '16px', marginBottom: '24px', color: '#374151' }}>{message}</p>
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        <button onClick={onCancel} style={{
          padding: '10px 24px', borderRadius: '8px', border: '1px solid #d1d5db',
          background: '#fff', cursor: 'pointer', fontWeight: '500',
        }}>Cancel</button>
        <button onClick={onConfirm} style={{
          padding: '10px 24px', borderRadius: '8px', border: 'none',
          background: '#ef4444', color: '#fff', cursor: 'pointer', fontWeight: '500',
        }}>Delete</button>
      </div>
    </div>
  </div>
);

//Reusable table
const DataTable = ({ columns, rows, onDelete, loading }) => (
  <div className="table-wrapper">
    <table className="admin-table">
      <thead>
        <tr>
          {columns.map(col => <th key={col.key}>{col.label}</th>)}
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {loading ? (
          <tr><td colSpan={columns.length + 1} style={{ textAlign: 'center', padding: '32px', color: '#6b7280' }}>Loading...</td></tr>
        ) : rows.length === 0 ? (
          <tr><td colSpan={columns.length + 1} style={{ textAlign: 'center', padding: '32px', color: '#6b7280' }}>No records found.</td></tr>
        ) : rows.map((row, i) => (
          <tr key={i}>
            {columns.map(col => (
              <td key={col.key}>
                {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
              </td>
            ))}
            <td>
              <button
                onClick={() => onDelete(row)}
                className="btn-action"
                style={{
                  background: '#fee2e2', color: '#ef4444', border: 'none',
                  padding: '6px 14px', borderRadius: '6px', cursor: 'pointer',
                  fontWeight: '500', fontSize: '13px',
                }}
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// Pagination 
const Pagination = ({ current, total, onChange }) => (
  <div className="pagination">
    <button className="pagination-btn" onClick={() => onChange(current - 1)} disabled={current === 1}>← Previous</button>
    {Array.from({ length: total }, (_, i) => i + 1).map(p => (
      <button key={p} className={`pagination-btn ${p === current ? 'active' : ''}`} onClick={() => onChange(p)}>{p}</button>
    ))}
    <button className="pagination-btn" onClick={() => onChange(current + 1)} disabled={current === total}>Next →</button>
  </div>
);

//  Main AdminPanel 
export default function AdminPanel({ user, onLogout, onNavigate }) {
  const [activeTab, setActiveTab]     = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats]             = useState({ totalUsers: 0, totalTests: 0, totalModelResults: 0, totalRecommendations: 0 });
  const [users, setUsers]             = useState([]);
  const [labTests, setLabTests]       = useState([]);
  const [modelResults, setModelResults] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [confirm, setConfirm]         = useState(null); // { message, onConfirm }
  const [page, setPage]               = useState(1);
  const PER_PAGE = 10;

  // Fetch data when tab changes 
  useEffect(() => {
    setPage(1);
    fetchTabData(activeTab, 1);
  }, [activeTab]);

  useEffect(() => {
    fetchTabData(activeTab, page);
  }, [page]);

  const fetchTabData = async (tab, pg) => {
    setLoading(true);
    setError('');
    const skip = (pg - 1) * PER_PAGE;
    try {
      switch (tab) {
        case 'overview': {
          const s = await adminAPI.getStats();
          setStats(s);
          break;
        }
        case 'users': {
          const data = await adminAPI.getUsers(skip, PER_PAGE);
          setUsers(Array.isArray(data) ? data : data.data || []);
          break;
        }
        case 'lab-tests': {
          const data = await labTestAPI.getAll(skip, PER_PAGE);
          setLabTests(Array.isArray(data) ? data : data.data || []);
          break;
        }
        case 'model-results': {
          const data = await adminAPI.getModelResults(skip, PER_PAGE);
          setModelResults(Array.isArray(data) ? data : data.data || []);
          break;
        }
        case 'recommendations': {
          const data = await adminAPI.getRecommendations(skip, PER_PAGE);
          setRecommendations(Array.isArray(data) ? data : data.data || []);
          break;
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load data.');
    } finally {
      setLoading(false);
    }
  };

  // Delete handlers 
  const handleDelete = (entity, row) => {
    const idMap = {
      users:           row.id,
      'lab_tests':     row.id,
      'model_results': row.result_id,
      'recommendations': row.recommendation_id,
    };
    const id = idMap[entity];
    setConfirm({
      message: `Delete ${entity.replace('-', ' ')} #${id}? This cannot be undone.`,
      onConfirm: async () => {
        setConfirm(null);
        try {
          await adminAPI.delete(entity, id);
          fetchTabData(activeTab, page);
        } catch (err) {
          setError(err.message || 'Delete failed.');
        }
      },
    });
  };

  const handleDownloadAll = async () => {
    try {
      const blob = await adminAPI.exportTestData();
      const url  = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href  = url;
      link.download = `aquaguard-tests-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message || 'Export failed.');
    }
  };

  // Column definition
  const fmtDate = (v) => v ? new Date(v).toLocaleDateString('en-GB') : '—';
  const truncate = (v, n = 60) => v && v.length > n ? v.slice(0, n) + '…' : v;

  const userCols = [
    { key: 'id',         label: 'ID' },
    { key: 'name',       label: 'Name' },
    { key: 'email',      label: 'Email' },
    { key: 'role',       label: 'Role' },
    { key: 'created_at', label: 'Joined', render: fmtDate },
  ];

  const testCols = [
    { key: 'id',           label: 'ID' },
    { key: 'user_id',      label: 'User ID' },
    { key: 'occupation',   label: 'Occupation' },
    { key: 'date_of_test', label: 'Test Date', render: fmtDate },
    { key: 'ph',           label: 'pH' },
    { key: 'turbidity',    label: 'Turbidity' },
    { key: 'nitrates',     label: 'Nitrates' },
    { key: 'phosphates',   label: 'Phosphates' },
    {key: 'dissolved_oxygen', label: 'Dissolved O₂' },
    {key: 'salinity', label: 'Salinity' },
  ];

  const resultCols = [
    { key: 'result_id',    label: 'Result ID' },
    { key: 'test_id',      label: 'Test ID' },
    { key: 'wqi_score',    label: 'WQI', render: v => v != null ? parseFloat(v).toFixed(1) : '—' },
    { key: 'health_score', label: 'Health %', render: v => v != null ? `${v}%` : '—' },
    { key: 'risk_level',   label: 'Risk' },
    { key: 'ml_confidence',label: 'ML Conf.', render: v => v != null ? `${v}%` : '—' },
    { key: 'analysis_date',label: 'Date', render: fmtDate },
  ];

  const recCols = [
    { key: 'recommendation_id',   label: 'ID' },
    { key: 'test_id',             label: 'Test ID' },
    { key: 'recommendation_type', label: 'Type' },
    { key: 'severity_level',      label: 'Severity' },
    { key: 'recommendation_text', label: 'Text', render: truncate },
    { key: 'generated_at',        label: 'Generated', render: fmtDate },
  ];

  // Render tab content 
  const renderContent = () => {
    switch (activeTab) {

      case 'overview':
        return (
          <>
            <h2 className="admin-heading">Admin Dashboard</h2>
            <div className="admin-stats">
              {[
                { label: 'Total Users',            icon: '👥', value: stats.totalUsers },
                { label: 'Total Tests Submitted',  icon: '📋', value: stats.totalTests },
                { label: 'Total Analysed Tests',        icon: '⏳', value: stats.totalModelResults },
                { label: 'Total Recommendations', icon: '✓',  value: stats.totalRecommendations },
              ].map((s, i) => (
                <div key={i} className="stat-card">
                  <div className="stat-header">
                    <span className="stat-label">{s.label}</span>
                    <span className="stat-icon">{s.icon}</span>
                  </div>
                  <div className="stat-value">{s.value}</div>
                </div>
              ))}
            </div>
            <div className="admin-controls">
              <button onClick={handleDownloadAll} className="btn-download">
                Download All Test Data (CSV)
              </button>
            </div>
          </>
        );

      case 'users':
        return (
          <>
            <h2 className="admin-heading">Users</h2>
            <DataTable columns={userCols} rows={users} loading={loading}
              onDelete={(row) => handleDelete('users', row)} />
            <Pagination current={page} total={Math.ceil(stats.totalUsers / PER_PAGE) || 1} onChange={setPage} />
          </>
        );

      case 'lab-tests':
        return (
          <>
            <h2 className="admin-heading">Lab Tests</h2>
            <DataTable columns={testCols} rows={labTests} loading={loading}
              onDelete={(row) => handleDelete('lab-tests', row)} />
            <Pagination current={page} total={Math.ceil(stats.totalTests / PER_PAGE) || 1} onChange={setPage} />
          </>
        );

      case 'model-results':
        return (
          <>
            <h2 className="admin-heading">Model Results</h2>
            <DataTable columns={resultCols} rows={modelResults} loading={loading}
              onDelete={(row) => handleDelete('model-results', row)} />
            <Pagination current={page} total={Math.ceil(stats.totalTests / PER_PAGE) || 1} onChange={setPage} />
          </>
        );

      case 'recommendations':
        return (
          <>
            <h2 className="admin-heading">Recommendations</h2>
            <DataTable columns={recCols} rows={recommendations} loading={loading}
              onDelete={(row) => handleDelete('recommendations', row)} />
            <Pagination current={page} total={Math.ceil(stats.totalTests / PER_PAGE) || 1} onChange={setPage} />
          </>
        );

      default:
        return null;
    }
  };

  // Layout
  return (
    <div className="admin-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

      {confirm && <ConfirmModal message={confirm.message} onConfirm={confirm.onConfirm} onCancel={() => setConfirm(null)} />}

      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-left">
          <button
            onClick={() => setSidebarOpen(o => !o)}
            style={{ background: 'none', border: 'none', cursor: 'pointer',
                     fontSize: '20px', marginRight: '12px', color: '#374151' }}
            title="Toggle sidebar"
          >
            ☰
          </button>
          <img src={logo} alt="AquaGuard" className="admin-logo" />
          <h1 className="admin-title">Admin Panel</h1>
        </div>
        <div className="admin-header-right">
          <button onClick={onLogout} className="admin-user-avatar" title="Logout">
            {user?.name ? user.name[0].toUpperCase() : '?'}
          </button>
        </div>
      </header>

      {/* Body — sidebar + content */}
      <div style={{ display: 'flex', flex: 1 }}>

        {/* Sidebar */}
        <aside style={{
          width: sidebarOpen ? '220px' : '0',
          overflow: 'hidden',
          transition: 'width 0.25s ease',
          flexDirection: 'column',
          paddingTop: sidebarOpen ? '24px' : '0',
          flexShrink: 0,
          
        }}>
          {NAV_ITEMS.map(item => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '14px 20px', border: 'none', cursor: 'pointer',
                background: activeTab === item.key ? '#3b82f6' : 'transparent',
                color: activeTab === item.key ? '#fff' : '#94a3b8',
                fontSize: '14px', fontWeight: activeTab === item.key ? '600' : '400',
                textAlign: 'left', whiteSpace: 'nowrap', width: '100%',
                borderRadius: activeTab === item.key ? '0 8px 8px 0' : '0',
                transition: 'all 0.15s ease',
              }}
            >
              <span style={{ fontSize: '18px' }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </aside>

        {/* Main content */}
        <main className="admin-content" style={{ flex: 1, overflowX: 'auto' }}>
          {error && (
            <div style={{ background: '#fee2e2', borderRadius: '8px', color: '#ef4444',
                          padding: '12px 16px', marginBottom: '24px', fontSize: '14px' }}>
              {error}
            </div>
          )}
          {renderContent()}
        </main>

      </div>

      <footer className="footer">
        © 2026 Admin Panel. All rights reserved.
      </footer>
    </div>
  );
}