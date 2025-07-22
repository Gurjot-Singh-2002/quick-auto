import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from './firebase'; // Import Firestore and Firebase Auth configuration
import { collection, addDoc, doc, getDoc } from 'firebase/firestore'; // Firestore functions
import './FeedbackPage.css';

const FeedbackPage = () => {
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState('');
  const [studentRollNo, setStudentRollNo] = useState(null);
  const [message, setMessage] = useState('');

  // Firestore collection reference
  const feedbackCollectionRef = collection(db, 'feedback');

  useEffect(() => {
    // Fetch the student roll number for the logged-in user
    const fetchStudentRollNo = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const userDocRef = doc(db, 'students', user.uid); // Assuming 'students' collection uses UID as the document ID
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setStudentRollNo(userDoc.data().rollNo);
            console.log("Logged-in student roll number:", userDoc.data().rollNo); // Console message
          } else {
            console.error('No student document found for the logged-in user.');
          }
        } catch (error) {
          console.error('Error fetching student roll number:', error);
        }
      } else {
        console.error('No user is logged in.');
      }
    };

    fetchStudentRollNo();
  }, []);

  const handleSubmitFeedback = async () => {
    if (!feedback.trim()) {
      setMessage('Please enter your feedback before submitting.');
      return;
    }

    try {
      // Prepare the feedback data
      const feedbackData = {
        feedback,
        studentRollNo: studentRollNo || 'Unknown', // Use 'Unknown' if roll number is not available
        createdAt: new Date(), // Timestamp of feedback creation
      };

      // Store the feedback in Firestore
      await addDoc(feedbackCollectionRef, feedbackData);

      // Clear the input field and show success message
      setFeedback('');
      setMessage('Feedback sent successfully!');
      console.log("Feedback submitted:", feedbackData);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setMessage('Error sending feedback. Please try again.');
    }
  };

  return (
    <div className="feedback-container">
      {/* Quick Auto logo at the top right to navigate to home */}
      <img
        src="/icons/quickautologo.png"
        alt="Quick Auto Logo"
        className="top-logo"
        onClick={() => navigate('/home')}
      />

      {/* Feedback Input */}
      <div className="feedback-content">
        <h2>Send Feedback</h2>
        <p>Tell us what you love about the app, or what we could be doing better.</p>
        <textarea
          placeholder="Enter Feedback"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          className="feedback-input"
        />
        <button className="submit-button" onClick={handleSubmitFeedback}>
          Submit Feedback
        </button>

        {/* Status Message */}
        {message && <p className="status-message">{message}</p>}
      </div>
    </div>
  );
};

export default FeedbackPage;
