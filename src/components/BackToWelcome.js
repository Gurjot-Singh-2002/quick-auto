// BackToWelcome.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './BackToWelcome.css'; // Custom styling

const BackToWelcome = () => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate('/');
  };

  return (
    <div className="back-to-welcome" onClick={handleBackClick}>
      <img src="/icons/quickautologo.png" alt="Back to Welcome" className="back-icon" />
    </div>
  );
};

export default BackToWelcome;
