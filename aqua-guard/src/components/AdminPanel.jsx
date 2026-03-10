import { useState, useEffect } from 'react';
import { adminAPI } from '../api';
import logo from '../assets/AquAguard.png';

export default function AdminPanel({ user, onLogout, onNavigate }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTests: 0,
    pendingReviews: 0,
    successfulSubmissions: 0,
  });

  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const itemsPerPage = 6;

  useEffect(() => {
    fetchAdminData();
  }, [currentPage]);

  const fetchAdminData = async () => {
    setLoading(true);
    setError('');

    try {
      const [statsData, testsData] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getSubmittedTests(currentPage, itemsPerPage),
      ]);

      setStats(statsData);
      setTests(testsData.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load admin data');
      setStats({
        totalUsers: 0,
        totalTests: 0,
        pendingReviews: 0,
        successfulSubmissions: 0,
      });
      setTests([]);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil((stats.totalTests || 0) / itemsPerPage);
  const displayedData = tests;

  const getStatusClass = (status) => {
    switch (status) {
      case 'Completed':
        return 'status-completed';
      case 'Pending':
        return 'status-pending';
      case 'Rejected':
        return 'status-rejected';
      default:
        return '';
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleDownloadAll = async () => {
    try {
      const blob = await adminAPI.exportTestData();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `aquaguard-tests-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message || 'Failed to download data');
    }
  };

  return (
    <div className="admin-container">
      {/* Admin Header */}
      <header className="admin-header">
        <div className="admin-header-left">
          <img src= {logo} alt="AquaGuard" className="admin-logo" />
          <h1 className="admin-title">Admin Panel</h1>
        </div>
        <div className="admin-header-right">
          <button
            onClick={onLogout}
            className="admin-user-avatar"
            title="Logout"
          >
            {user?.name ? user.name[0].toUpperCase() : '?'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="admin-content">
        <h2 className="admin-heading">Admin Dashboard</h2>
        
        {error && (
          <div
            style={{
              backgroundColor: '#ffe6e6',
              borderRadius: '8px',
              color: '#ff3333',
              padding: '12px 16px',
              marginBottom: '24px',
              fontSize: '14px',
            }}
          >
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px 24px', color: '#666' }}>
            Loading dashboard data...
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="admin-stats">
              <div className="stat-card">
                <div className="stat-header">
                  <span className="stat-label">Total Users</span>
                  <span className="stat-icon">👥</span>
                </div>
                <div className="stat-value">{stats.totalUsers}</div>
              </div>

              <div className="stat-card">
                <div className="stat-header">
                  <span className="stat-label">Total Tests Submitted</span>
                  <span className="stat-icon">📋</span>
                </div>
                <div className="stat-value">{stats.totalTests}</div>
              </div>

              <div className="stat-card">
                <div className="stat-header">
                  <span className="stat-label">Pending Reviews</span>
                  <span className="stat-icon">⏳</span>
                </div>
                <div className="stat-value">{stats.pendingReviews}</div>
              </div>

              <div className="stat-card">
                <div className="stat-header">
                  <span className="stat-label">Successful Submissions</span>
                  <span className="stat-icon">✓</span>
                </div>
                <div className="stat-value">{stats.successfulSubmissions}</div>
              </div>
            </div>

            {/* Download Button */}
            <div className="admin-controls">
              <button onClick={handleDownloadAll} className="btn-download">
                Download All Test Data(CSV)
              </button>
            </div>

            {/* Tests Table */}
            <div className="admin-section">
              <h3 className="admin-section-title">Submitted Tests</h3>

              <div className="table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Test ID</th>
                      <th>User</th>
                      <th>Submission Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedData.map((test, index) => (
                      <tr key={index}>
                        <td className="table-id">{test.id}</td>
                        <td>{test.user}</td>
                        <td>{test.date}</td>
                        <td>
                          <span className={`table-status ${getStatusClass(test.status)}`}>
                            {test.status}
                          </span>
                        </td>
                        <td>
                          <div className="table-actions">
                            <button className="btn-action btn-action-download" title="Download">
                              Download
                            </button>
                            <button className="btn-action btn-action-view" title="View Details">
                              View Details
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="pagination">
                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  ← Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    className={`pagination-btn ${page === currentPage ? 'active' : ''}`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                ))}

                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next →
                </button>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="footer">
        © 2026 Admin Panel. All rights reserved.
      </footer>
    </div>
  );
}
