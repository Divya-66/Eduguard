import React, { useState } from 'react';
import { signIn, signUp } from '@aws-amplify/auth';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await signUp({
        username: email,
        password,
        attributes: { email },
      });
      alert('Sign-up success! Check email for confirmation code.');
    } catch (err) {
      setError('Sign-up failed: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await signIn({
        username: email,
        password,
      });
      onLogin();
    } catch (err) {
      setError('Login failed: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Login Card */}
        <div className="card">
          {/* Logo */}
          <div className="login-logo">
            <h1>EduGuard</h1>
            <p>Smart Exam Platform</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                placeholder="Enter your email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                placeholder="Enter your password"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="error-message">
                <p className="error-text">{error}</p>
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary"
            >
              {isLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div className="btn-spinner"></div>
                  Signing In...
                </div>
              ) : (
                'Login'
              )}
            </button>
          </form>

          {/* Sign Up Button */}
          <div style={{ marginTop: '1.5rem' }}>
            <button
              onClick={handleSignUp}
              disabled={isLoading}
              className="btn btn-secondary"
            >
              {isLoading ? 'Processing...' : 'Sign Up'}
            </button>
          </div>

          {/* Additional Info */}
          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
              Secure authentication powered by AWS Cognito
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;