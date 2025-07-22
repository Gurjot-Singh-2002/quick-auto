// Import necessary libraries
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BackToWelcome from './BackToWelcome';
import './LoginPage.css'; // Custom styling
import { auth, db } from './firebase'; // Import Firebase auth and Firestore
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore'; // Firestore functions

// Main LoginPage Component
const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignUp = () => {
    navigate('/signup');
  };

  // Function to handle manual login with email and password
  const handleLogin = async () => {
    try {
      if (!email || !password) {
        setError('Please enter both email and password.');
        return;
      }
  
      console.log('Attempting to sign in with:', { email, password });
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('User logged in:', userCredential.user);
  
      navigate('/home');
    } catch (error) {
      console.error('Login error details:', error);
      if (error.code === 'auth/user-not-found') {
        setError("Account doesn't exist. Please sign up first.");
      } else if (error.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.');
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid email format. Please check and try again.');
      } else {
        setError('Login failed. Please try again.');
      }
    }
  };
  
  // Function to handle Google Sign-In
  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log('User signed in with Google:', user);

      // Check if the user's email exists in Firestore
      const usersRef = collection(db, 'students');
      const q = query(usersRef, where('email', '==', user.email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        // If no additional details in Firestore, redirect to signup with pre-filled data
        console.log('Account does not exist in Firestore. Redirecting to sign up.');
        navigate('/signup', { state: { email: user.email, isGoogleSignIn: true } });
      } else {
        console.log('Account found in Firestore. Redirecting to home.');
        navigate('/home');
      }
    } catch (error) {
      console.error('Error signing in with Google:', error);
      setError('Failed to sign in with Google. Please try again.');
    }
  };

  return (
    <div className="login-container">
      <BackToWelcome /> {/* Back icon to navigate to WelcomePage */}
      {/* Background Image */}
      <div className="background-image"></div>

      {/* Login Content */}
      <div className="login-content">
        {error && <p className="error-message">{error}</p>}

        <div className="form-group">
          <label>Email Address</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="form-links">
          <a href="#" className="forgot-password">Forgot Password</a>
        </div>

        {/* Log In Button */}
        <button className="login-button" onClick={handleLogin}>Log In</button>

        {/* Or Separator */}
        <p className="or-separator">Or</p>

        {/* Sign In with Google Button */}
        <button className="google-button" onClick={handleGoogleSignIn}>
          <img src="/icons/googleicon.png" alt="Google Icon" className="google-icon" />
          Sign in with Google
        </button>

        {/* Sign Up Link */}
        <p className="sign-up-text">
          Don't have an account? <span onClick={handleSignUp} className="sign-up-link">Sign Up</span>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
