import { useState, useEffect } from 'react';
import Navigation from './Navigation';
import { userAPI } from '../api';

export default function Profile({ user, onLogout, onNavigate }) {
  const [profileData, setProfileData] = useState(user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserProfile();
  }, [user?.id]);

  const fetchUserProfile = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const data = await userAPI.getProfile(user.id);
      setProfileData(data);
    } catch (err) {
      console.log('[v0] Profile fetch error:', err.message);
      setProfileData(user);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      onLogout();
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
      <Navigation currentPage="profile" onNavigate={onNavigate} />

      <main className="profile-container">
        <div className="profile-card">
          {/* Profile Header */}
          <div className="profile-header">
            <div className="profile-avatar">👤</div>
            <div className="profile-info">
              <h2>{profileData.name || user.name}</h2>
              <p>{profileData.email || user.email}</p>
            </div>
          </div>

          {/* User Details */}
          <div>
            {error && (
              <div
                style={{
                  backgroundColor: '#ffe6e6',
                  borderRadius: '8px',
                  color: '#ff3333',
                  padding: '12px 16px',
                  marginBottom: '16px',
                  fontSize: '14px',
                }}
              >
                {error}
              </div>
            )}

            <div className="profile-field">
              <span className="profile-label">Full Name</span>
              <p className="profile-value">{profileData.name || user.name}</p>
            </div>

            <div className="profile-field">
              <span className="profile-label">Email Address</span>
              <p className="profile-value">{profileData.email || user.email}</p>
            </div>

            <div className="profile-field">
              <span className="profile-label">Phone Number</span>
              <p className="profile-value">{profileData.phone || user.phone}</p>
            </div>

            <div className="profile-field">
              <span className="profile-label">Account Role</span>
              <p className="profile-value">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
            </div>

            <div className="profile-field">
              <span className="profile-label">Member Since</span>
              <p className="profile-value">
                {new Date().toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>

          {/* Account Status */}
          <div style={{ backgroundColor: '#e6f7ed', borderRadius: '12px', padding: '24px', marginBottom: '32px', border: '1px solid #00c853' }}>
            <h3 style={{ fontWeight: 600, color: '#00c853', marginBottom: '8px' }}>✓ Account Active</h3>
            <p style={{ fontSize: '14px', color: '#00c853' }}>
              Your account is in good standing and all services are active.
            </p>
          </div>

          {/* Logout Button */}
          <div className="profile-actions">
            <button
              onClick={handleLogout}
              className="btn-logout"
            >
              Logout
            </button>
          </div>

          {/* Additional Options */}
          <div style={{ marginTop: '32px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <button style={{ padding: '12px 16px', border: '1px solid #e0e6ed', borderRadius: '8px', color: '#1a1a1a', backgroundColor: 'transparent', cursor: 'pointer', fontWeight: 500, transition: 'all 0.2s ease' }}>
              Edit Profile
            </button>
            <button style={{ padding: '12px 16px', border: '1px solid #e0e6ed', borderRadius: '8px', color: '#1a1a1a', backgroundColor: 'transparent', cursor: 'pointer', fontWeight: 500, transition: 'all 0.2s ease' }}>
              Change Password
            </button>
            <button style={{ padding: '12px 16px', border: '1px solid #e0e6ed', borderRadius: '8px', color: '#1a1a1a', backgroundColor: 'transparent', cursor: 'pointer', fontWeight: 500, transition: 'all 0.2s ease' }}>
              Privacy Settings
            </button>
            <button style={{ padding: '12px 16px', border: '1px solid #e0e6ed', borderRadius: '8px', color: '#1a1a1a', backgroundColor: 'transparent', cursor: 'pointer', fontWeight: 500, transition: 'all 0.2s ease' }}>
              Support
            </button>
          </div>
        </div>
      </main>

      <footer className="footer">
        © 2026 AquaGuard. All rights reserved.
      </footer>
    </div>
  );
}
