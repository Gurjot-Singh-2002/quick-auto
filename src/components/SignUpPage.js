// Import necessary libraries
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth, db } from './firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import BackToWelcome from './BackToWelcome';
import './SignUpPage.css';

const SignUpPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const isGoogleSignIn = location.state?.isGoogleSignIn || false;

  useEffect(() => {
    if (isGoogleSignIn && location.state?.email) {
      setEmail(location.state.email); // Prefill email if coming from Google Sign-In
    }
  }, [isGoogleSignIn, location.state]);


  const handleSignUp = async () => {
    try {
      
      if (isGoogleSignIn) {
        const user = auth.currentUser;
        if (!user) {
          console.error("No Google user is logged in.");
          setError("Please sign in with Google again.");
          return;
        }

        // Set document with UID as the document ID
        await setDoc(doc(db, 'students', user.uid), {
          uid: user.uid,
          rollNo,
          name,
          phone,
          email,
          rollNo,
          createdAt: new Date(),
        });
        console.log("Student data added successfully for Google Sign-In with roll number:", rollNo);
        navigate('/home');
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Set document with UID as the document ID
        await setDoc(doc(db, 'students', user.uid), {
          uid: user.uid,
          rollNo,
          name,
          phone,
          email,
          rollNo,
          createdAt: new Date(),
        });
        console.log("Student added successfully with roll number:", rollNo);
        navigate('/login');
      }
    } catch (error) {
      console.error("Error signing up:", error);
      setError(error.message || 'Failed to create an account. Please try again.');
    }
  };

  return (
    <div className="signup-container">
      <BackToWelcome />
      <div className="logo-container">
        <img src="/icons/quickautologo.png" alt="App Logo" className="app-logo" />
      </div>

      <div className="signup-content">
        {error && <p className="error-message">{error}</p>}

        <div className="form-group">
          <label>Enter Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name" />
        </div>

        <div className="form-group">
          <label>Phone No</label>
          <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Enter your phone number" />
        </div>

        <div className="form-group">
          <label>E-mail</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" disabled={isGoogleSignIn} />
        </div>

        <div className="form-group">
          <label>Roll No</label>
          <input type="text" value={rollNo} onChange={(e) => setRollNo(e.target.value)} placeholder="Enter your roll number" />
        </div>

        {!isGoogleSignIn && (
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" />
          </div>
        )}

        <button className="signup-button" onClick={handleSignUp}>Sign Up</button>

        <p className="login-text">
          Already have an account? <span onClick={() => navigate('/login')} className="login-link">Log In</span>
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;
