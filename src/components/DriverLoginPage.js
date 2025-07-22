import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';
import BackToWelcome from './BackToWelcome';
import './LoginPage.css';

const DriverLoginPage = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState(''); // Phone number as username
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      const email = `${phone.trim()}@quickauto.com`; // Generate email format from phone
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      console.log("Driver login successful!");
      navigate('/driver-home'); // Redirect to driver home page on successful login
    } catch (error) {
      console.error("Error logging in driver:", error);

      // Display specific error messages
      if (error.code === 'auth/user-not-found') {
        setError("No account found with this phone number. Please sign up first.");
      } else if (error.code === 'auth/wrong-password') {
        setError("Incorrect password. Please try again.");
      } else {
        setError("Login failed. Please check your credentials.");
      }
    }
  };

  return (
    <div className="login-container">
      <BackToWelcome />
      <div className="background-image"></div>

      <div className="login-content">
        {error && <p className="error-message">{error}</p>}

        <div className="form-group">
          <label>Phone Number</label>
          <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Enter your phone number" />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" />
        </div>

        <button className="login-button" onClick={handleLogin}>Log In</button>

        <p className="sign-up-text">
          Don't have an account? <span onClick={() => navigate('/driver-signup')} className="sign-up-link">Sign Up</span>
        </p>
      </div>
    </div>
  );
};

export default DriverLoginPage;
