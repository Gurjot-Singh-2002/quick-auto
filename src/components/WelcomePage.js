// Import necessary libraries
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './WelcomePage.css';

const WelcomePage = () => {
  const navigate = useNavigate();

  // Handler function for navigating to different login pages
  const handleStudentGuestLogin = () => {
    navigate('/login');
  };

  const handleDriverLogin = () => {
    navigate('/driver-login');
  };

  return (
    <div className="welcome-container">
      <div className="background-image"></div>
      
      <div className="welcome-text">
        <h1>Welcome</h1>
        <p>Regular availability of E-rickshaws for students</p>
        <p>anytime, anywhere in the campus</p>
      </div>
      
      <div className="continue-as">
        <p>Continue as</p>
      </div>
      
      <div className="buttonwel-group">
        <button className="loginwel-button" onClick={handleStudentGuestLogin}>
          <img src="/icons/student.png" alt="Student Icon" className="button-icon" />
          Student
        </button>
        <button className="loginwel-button" onClick={handleStudentGuestLogin}>
          <img src="/icons/guest.png" alt="Guest Icon" className="button-icon" />
          Guest
        </button>
        <button className="loginwel-button" onClick={handleDriverLogin}>
          <img src="/icons/driver.png" alt="Driver Icon" className="button-icon" />
          Auto Driver
        </button>
      </div>
    </div>
  );
};

export default WelcomePage;
