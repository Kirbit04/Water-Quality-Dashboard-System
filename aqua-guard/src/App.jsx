'use client';

import { useState, useEffect } from 'react';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import LabTest from './components/LabTest';
import About from './components/About';
import Contact from './components/Contact';
import Profile from './components/Profile';

export default function Home() {
  const [currentPage, setCurrentPage] = useState('login');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('aquaguardUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setCurrentPage('dashboard');
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('aquaguardUser', JSON.stringify(userData));
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('aquaguardUser');
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
    </main>
  );
}
