// DriverSignUpPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db, storage } from './firebase'; // Import Firebase Auth, Firestore, and Storage
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import BackToWelcome from './BackToWelcome';
import './DriverSignUpPage.css';

const DriverSignUpPage = () => {
  const navigate = useNavigate();

  // State variables for form fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState(''); // Phone number will be used as a username
  const [autoRickshawNo, setAutoRickshawNo] = useState('');
  const [autoNo, setAutoNo] = useState(''); // Unique identifier based on auto number
  const [password, setPassword] = useState(''); // Driver-provided password
  const [idCard, setIdCard] = useState(null);
  const [driverPicture, setDriverPicture] = useState(null);
  const [aadharCard, setAadharCard] = useState(null);
  const [error, setError] = useState('');

  // Function to handle driver signup and store data
  const handleSignUp = async () => {
    try {
      // Use phone as a unique part of email format
      const email = `${phone.trim()}@quickauto.com`;

      // Create a new user in Firebase Authentication with the password provided by the driver
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Upload images to Firebase Storage and get URLs if needed (optional)
      // const idCardUrl = idCard ? await uploadImage(idCard, `drivers/${phone}_idCard`) : '';
      // const driverPictureUrl = driverPicture ? await uploadImage(driverPicture, `drivers/${phone}_driverPicture`) : '';
      // const aadharCardUrl = aadharCard ? await uploadImage(aadharCard, `drivers/${phone}_aadharCard`) : '';

      // Store driver data in Firestore using the UID as the document ID
      await setDoc(doc(db, 'drivers', user.uid), {
        uid: user.uid, // Store Firebase Authentication UID
        name: name,
        phone: phone,
        autoRickshawNo: autoRickshawNo,
        autoNo: autoNo,
        password: password, // Store the password in Firestore if needed (not recommended for security)
        createdAt: new Date(),
      });

      console.log("Driver added successfully with UID:", user.uid);
      navigate('/driver-login'); // Redirect to driver login page after successful signup
    } catch (error) {
      console.error("Error during driver signup:", error);
      setError("Failed to sign up. Please try again.");
    }
  };

  return (
    <div className="signup-container">
      <BackToWelcome />
      <div className="logodri-container">
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
          <label>Auto Rickshaw No</label>
          <input type="text" value={autoRickshawNo} onChange={(e) => setAutoRickshawNo(e.target.value)} placeholder="Enter auto rickshaw number" />
        </div>

        <div className="form-group">
          <label>Auto No</label>
          <input type="text" value={autoNo} onChange={(e) => setAutoNo(e.target.value)} placeholder="Enter auto number" />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" />
        </div>

        <button className="signup-button" onClick={handleSignUp}>Sign Up</button>

        <p className="login-text">
          Already have an account? <span onClick={() => navigate('/driver-login')} className="login-link">Log In</span>
        </p>
      </div>
    </div>
  );
};

export default DriverSignUpPage;
