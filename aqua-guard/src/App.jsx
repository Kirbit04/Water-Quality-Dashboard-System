import { useState, useEffect } from 'react';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import LabTest from './components/LabTest';
import About from './components/About';
import Contact from './components/Contact';
import Profile from './components/Profile';
import AdminPanel from './components/AdminPanel';

function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verify user session with backend using HTTP-only cookie
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/users/me', {
        credentials: 'include', // Sends HTTP-only cookie automatically
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setCurrentPage(userData.role === 'admin' ? 'admin' : 'dashboard');
      } else {
        // Cookie invalid or expired
        setUser(null);
        setCurrentPage('login');
      }
      
    } catch (error) {
      console.error('Failed to fetch user:', error);
      // If fetch fails, stay on login
      setUser(null);
      setCurrentPage('login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
    if (userData.role === 'admin') {
      setCurrentPage('admin');
    } else {
      setCurrentPage('dashboard');
    }
  };


  const handleLogout = async () => {
    try {
      await fetch('http://localhost:8000/api/v1/auth/logout', {
        method: 'POST',
        credentials: 'include',  //sends cookies for deletion
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setCurrentPage('login');
    }
  };

  const navigateTo = (page) => {
    setCurrentPage(page);
  };

  // Show loading screen while verifying authentication with cookie
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',
                    justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f5f7fa', gap: '16px' }}>
        <div style={{
          width: '48px', height: '48px', border: '4px solid #e0e0e0',
          borderTop: '4px solid #3b82f6', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <p style={{ color: '#6b7280', fontSize: '14px' }}>Verifying your session...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user && (currentPage === 'dashboard' || currentPage === 'labtest' || currentPage === 'profile' || currentPage === 'about' || currentPage === 'contact' || currentPage === 'admin')) {
    setCurrentPage('login');
  }

  return (
    <main>
      {currentPage === 'login' && (
        <Login onLogin={handleLogin} onSwitchToSignup={() => setCurrentPage('signup')} />
      )}
      {currentPage === 'signup' && (
        <Signup onSignup={handleLogin} onSwitchToLogin={() => setCurrentPage('login')} />
      )}
      {currentPage === 'dashboard' && user && (
        <Dashboard user={user} onNavigate={navigateTo} />
      )}
      {currentPage === 'labtest' && user && (
        <LabTest user={user} onNavigate={navigateTo} />
      )}
      {currentPage === 'about' && user && (
        <About user={user} onNavigate={navigateTo} />
      )}
      {currentPage === 'contact' && user && (
        <Contact user={user} onNavigate={navigateTo} />
      )}
      {currentPage === 'profile' && user && (
        <Profile user={user} onLogout={handleLogout} onNavigate={navigateTo} />
      )}
      {currentPage === 'admin' && user?.role === 'admin' && (
        <AdminPanel user={user} onLogout={handleLogout} onNavigate={navigateTo} />
      )}
    </main>
  );
}

export default App;