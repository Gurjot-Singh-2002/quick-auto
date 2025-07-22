import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import './ProfilePage.css';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [isStudent, setIsStudent] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          console.log("Attempting to fetch user data with UID:", user.uid);

          // Attempt to fetch student data
          const studentDocRef = doc(db, 'students', user.uid);
          const studentDoc = await getDoc(studentDocRef);

          if (studentDoc.exists()) {
            console.log("Student data found for UID:", user.uid);
            setUserData(studentDoc.data());
            setIsStudent(true);
          } else {
            // Attempt to fetch driver data if no student data found
            console.log("No student data found. Checking driver data for UID:", user.uid);
            const driverDocRef = doc(db, 'drivers', user.uid);
            const driverDoc = await getDoc(driverDocRef);

            if (driverDoc.exists()) {
              console.log("Driver data found for UID:", user.uid);
              setUserData(driverDoc.data());
              setIsStudent(false);
            } else {
              console.error("No profile data found for UID:", user.uid);
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        console.error("No user is logged in.");
      }
    };

    fetchUserData();
  }, []);

  // Logout function
  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("User signed out successfully.");
      navigate(isStudent ? '/login' : '/driver-login');
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div className="profile-page-container">
      {userData ? (
        <>
          <div className="profile-box">
            <img src="/icons/profile.png" alt="Profile" className="profile-pic" />
            <div className="profile-details">
              <h2 className="profile-name">{userData.name}</h2>
              {isStudent ? (
                <>
                  <p><strong>Roll Number:</strong> {userData.rollNo}</p>
                  <p><strong>Phone:</strong> {userData.phone}</p>
                  <p><strong>Email:</strong> {userData.email}</p>
                </>
              ) : (
                <>
                  <p><strong>Auto Rickshaw No:</strong> {userData.autoRickshawNo}</p>
                  <p><strong>Auto No:</strong> {userData.autoNo}</p>
                  <p><strong>Phone:</strong> {userData.phone}</p>
                </>
              )}
            </div>
          </div>

          <img
            src="/icons/quickautologo.png"
            alt="Quick Auto Logo"
            className="top-logo"
            onClick={() => navigate('/home')}
          />

          <div className="buttons-section">
            <button className="profile-button" onClick={() => navigate('/about')}>
              <img src="/icons/about.png" alt="About Icon" className="button-icon" />
              About
            </button>
            <button className="profile-button" onClick={() => navigate('/contact')}>
              <img src="/icons/contact.png" alt="Contact Icon" className="button-icon" />
              Contact Us
            </button>
            <button className="profile-button" onClick={() => navigate('/faq')}>
              <img src="/icons/faq.png" alt="FAQ Icon" className="button-icon" />
              FAQ
            </button>
            <button className="profile-button" onClick={() => navigate('/rules')}>
              <img src="/icons/rules.png" alt="Rules Icon" className="button-icon" />
              Rules
            </button>
            <button className="profile-button" onClick={() => navigate('/privacy')}>
              <img src="/icons/privacy.png" alt="Privacy Icon" className="button-icon" />
              Privacy
            </button>
            <button className="profile-button" onClick={() => navigate('/settings')}>
              <img src="/icons/settings.png" alt="Settings Icon" className="button-icon" />
              Settings
            </button>
            {isStudent && (
              <button className="profile-button" onClick={() => navigate('/vip-subscription')}>
                <img src="/icons/vipp.png" alt="VIP Icon" className="button-icon" />
                VIP Subscription
              </button>
            )}
            <button className="profile-button logout" onClick={handleLogout}>
              <img src="/icons/logout.png" alt="Log Out Icon" className="button-icon" />
              Log Out
            </button>
          </div>
        </>
      ) : (
        <p>No profile data available.</p>
      )}
      <img src="/icons/quickautologo.png" alt="Quick Auto Logo" className="quickauto-logo" />
    </div>
  );
};

export default ProfilePage;
