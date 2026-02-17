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
    // Check if user has a saved auth token
    const token = localStorage.getItem('authToken');
    
    if (token) {
      // Fetch fresh user data from your FastAPI backend
      fetchUserProfile(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async (token) => {
    try {
      const response = await fetch('http://localhost:8000/api/users/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setCurrentPage('dashboard');
      } else {
        // Token invalid, clear it
        localStorage.removeItem('authToken');
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      localStorage.removeItem('authToken');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData) => {
    // Store only the token in localStorage
    localStorage.setItem('authToken', userData.token);
    setUser(userData);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('authToken');
    setCurrentPage('login');
  };

  const navigateTo = (page) => {
    setCurrentPage(page);
  };

  if (!user && (currentPage === 'dashboard' || currentPage === 'labtest' || currentPage === 'profile' || currentPage === 'about' || currentPage === 'contact')) {
    setCurrentPage('login');
  }

  return (
    <main className="min-h-screen bg-white">
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
        <About onNavigate={navigateTo} />
      )}
      {currentPage === 'contact' && user && (
        <Contact onNavigate={navigateTo} />
      )}
      {currentPage === 'profile' && user && (
        <Profile user={user} onLogout={handleLogout} onNavigate={navigateTo} />
      )}
      {currentPage === 'admin' && user && user.role === 'admin' && (
        <AdminPanel user={user} onNavigate={navigateTo} />
      )}
    </main>
  );
}

export default App;