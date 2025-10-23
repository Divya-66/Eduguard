import React, { useState, useEffect } from 'react';
import { Amplify } from 'aws-amplify';
import { getCurrentUser, signOut } from 'aws-amplify/auth';
import awsconfig from './aws-exports';
import Login from './components/login';
import Upload from './components/Upload';
import Dashboard from './components/Dashboard';

// Configure Amplify for public client (no secret)
Amplify.configure(awsconfig);

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on app load
  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      await getCurrentUser();
      setIsLoggedIn(true);
    } catch (error) {
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => setIsLoggedIn(true);

  const handleLogout = async () => {
    try {
      await signOut();
      setIsLoggedIn(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="app-container">
        {/* Header */}
        <header className="header">
          <div className="header-content">
            <div className="header-inner">
              <h1 className="header-title">
                EduGuard: Smart Exam Platform
              </h1>
            </div>
          </div>
        </header>
        
        {/* Loading content */}
        <main className="loading-container">
          <div style={{ textAlign: 'center' }}>
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="header-inner">
            <h1 className="header-title">
              EduGuard: Smart Exam Platform
            </h1>
            {isLoggedIn && (
              <button
                onClick={handleLogout}
                className="logout-btn"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="main-content">
        <div className="main-container">
          {isLoggedIn ? (
            <div className="content-grid">
              <Upload />
              <Dashboard />
            </div>
          ) : (
            <Login onLogin={handleLogin} />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <p className="footer-text">
            © 2025 EduGuard
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;