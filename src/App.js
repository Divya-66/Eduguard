import React, { useState, useEffect } from 'react';
import { Amplify } from 'aws-amplify';
import { getCurrentUser, signOut } from 'aws-amplify/auth';
import awsconfig from './aws-exports';
import Login from './components/login';
import Upload from './components/Upload';
import Dashboard from './components/Dashboard';

// Configure Amplify
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
      <div className="App">
        <header>
          <h1>EduGuard: Smart Exam Platform</h1>
        </header>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="App">
      <header>
        <h1>EduGuard: Smart Exam Platform</h1>
        {isLoggedIn ? <button onClick={handleLogout}>Logout</button> : null}
      </header>
      {isLoggedIn ? (
        <div>
          <Upload />
          <Dashboard />
        </div>
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  );
}


export default App;