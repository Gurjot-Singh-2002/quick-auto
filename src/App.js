// Import necessary libraries

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import WelcomePage from './components/WelcomePage';
import LoginPage from './components/LoginPage';
import SignUpPage from './components/SignUpPage';
import DriverSignUpPage from './components/DriverSignUpPage';
import DriverLoginPage from './components/DriverLoginPage';
import StudentHomePage from './components/StudentHomePage'; 
import FeedbackPage from './components/FeedbackPage';
import RefundPage from './components/RefundPage';
import VipRidePage from './components/VipRidePage';
import AdvanceBookingPage from './components/AdvanceBookingPage';
import ProfilePage from './components/ProfilePage';
import DriverHomePage from './components/DriverHomePage';
import RideBookedPage from './components/RideBookedPage';


//import FirebaseTest from './components/FirebaseTest'; // Import FirebaseTest


function App() {
    

  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/driver-login" element={<DriverLoginPage />} />
        <Route path="/driver-signup" element={<DriverSignUpPage />} />
        <Route path="/home" element={<StudentHomePage />} />
        <Route path="/home" element={<StudentHomePage />} />
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="/refund" element={<RefundPage />} />
        <Route path="/vip-ride" element={<VipRidePage />} />
        <Route path="/advance-booking" element={<AdvanceBookingPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/driver-home" element={<DriverHomePage />} />
        <Route path="/ride-book" element={<RideBookedPage />} />

        {/* Temporary route to test Firebase connection
        <Route path="/firebase-test" element={<FirebaseTest />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
