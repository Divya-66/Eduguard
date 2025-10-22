import React, { useState } from 'react';
import { signIn, signUp } from '@aws-amplify/auth';
import CryptoJS from 'crypto-js';  // For HMAC in browser

// Generate SECRET_HASH: Base64(HMAC_SHA256(username + clientId, secret))
const generateSecretHash = (username, clientId, clientSecret) => {
  const message = username + clientId;
  const hmac = CryptoJS.HmacSHA256(message, clientSecret);
  return CryptoJS.enc.Base64.stringify(hmac);
};

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Load config from aws-exports
  const awsConfig = require('../aws-exports').default.Auth.Cognito;
  const clientId = awsConfig.userPoolClientId;
  const clientSecret = awsConfig.userPoolClientSecret;

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      const secretHash = generateSecretHash(email, clientId, clientSecret);
      await signUp({
        username: email,
        password,
        attributes: { email },
        options: {  // Pass hash in options for v6
          clientMetadata: { SECRET_HASH: secretHash },
        },
      });
      alert('Sign-up success! Check email for confirmation code.');
    } catch (err) {
      setError('Sign-up failed: ' + err.message);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const secretHash = generateSecretHash(email, clientId, clientSecret);
      await signIn(email, password, {  // Pass hash as option
        secretHash,
      });
      onLogin();
    } catch (err) {
      setError('Login failed: ' + err.message);
    }
  };

  return (
    <div>
      <h2>Login to EduGuard</h2>
      <form onSubmit={handleLogin}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Login</button>
      </form>
      <button onClick={handleSignUp}>Sign Up</button>
      {error && <p style={{color: 'red'}}>{error}</p>}
    </div>
  );
};

export default Login;