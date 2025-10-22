import React, { useState } from 'react';
import { signIn, signUp, confirmSignUp } from 'aws-amplify/auth';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState('');
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signIn({ username: email, password });
      onLogin(); // Callback to switch to dashboard
    } catch (err) {
      setError('Login failed: ' + err.message);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signUp({
        username: email,
        password: password,
        options: {
          userAttributes: {
            email: email
          }
        }
      });
      setNeedsConfirmation(true);
    } catch (err) {
      setError('Sign up failed: ' + err.message);
    }
  };

  const handleConfirmSignUp = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await confirmSignUp({ username: email, confirmationCode });
      setNeedsConfirmation(false);
      setError('Account confirmed! Please login.');
    } catch (err) {
      setError('Confirmation failed: ' + err.message);
    }
  };

  if (needsConfirmation) {
    return (
      <div>
        <h2>Confirm Your Account</h2>
        <p>Please check your email for the confirmation code.</p>
        <form onSubmit={handleConfirmSignUp}>
          <input 
            type="text" 
            placeholder="Confirmation Code" 
            value={confirmationCode} 
            onChange={(e) => setConfirmationCode(e.target.value)} 
            required 
          />
          <button type="submit">Confirm Account</button>
        </form>
        {error && <p style={{color: 'red'}}>{error}</p>}
      </div>
    );
  }

  return (
    <div>
      <h2>{isSignUp ? 'Sign Up for EduGuard' : 'Login to EduGuard'}</h2>
      <form onSubmit={isSignUp ? handleSignUp : handleLogin}>
        <input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
        />
        <button type="submit">{isSignUp ? 'Sign Up' : 'Login'}</button>
      </form>
      <button onClick={() => setIsSignUp(!isSignUp)}>
        {isSignUp ? 'Already have an account? Login' : 'Need an account? Sign Up'}
      </button>
      {error && <p style={{color: 'red'}}>{error}</p>}
    </div>
  );
};

export default Login;