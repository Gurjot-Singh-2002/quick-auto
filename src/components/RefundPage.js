import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from './firebase'; // Import Firestore and Firebase Auth configuration
import { collection, addDoc, doc, getDoc } from 'firebase/firestore'; // Firestore functions
import './RefundPage.css';

const RefundPage = () => {
  const navigate = useNavigate();

  // State variables for form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [riderName, setRiderName] = useState('');
  const [rideNo, setRideNo] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [receivingNumber, setReceivingNumber] = useState('');
  const [reason, setReason] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [studentRollNo, setStudentRollNo] = useState(null);
  const [message, setMessage] = useState('');

  // Firestore collection reference
  const refundCollectionRef = collection(db, 'refunds');

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

  const handleSubmit = async () => {
    if (!name || !email || !riderName || !rideNo || !refundAmount || !receivingNumber || !reason || !transactionId) {
      setMessage('Please fill in all required fields.');
      return;
    }

    try {
      // Prepare the refund data
      const refundData = {
        name,
        email,
        riderName,
        rideNo,
        refundAmount,
        receivingNumber,
        reason,
        transactionId,
        studentRollNo: studentRollNo || 'Unknown',
        createdAt: new Date(), // Timestamp of request creation
        // screenshot, // Uncomment if you decide to store the image file in the future
      };

      // Store the refund request in Firestore
      await addDoc(refundCollectionRef, refundData);

      // Clear form fields and show success message
      setName('');
      setEmail('');
      setRiderName('');
      setRideNo('');
      setRefundAmount('');
      setReceivingNumber('');
      setReason('');
      setTransactionId('');
      setScreenshot(null);
      setMessage('Refund request sent successfully!');
      console.log("Refund request submitted:", refundData);
    } catch (error) {
      console.error('Error submitting refund request:', error);
      setMessage('Error sending refund request. Please try again.');
    }
  };

  return (
    <div className="refund-container">
      {/* Quick Auto logo at the top right to navigate to home */}
      <img
        src="/icons/quickautologo.png"
        alt="Quick Auto Logo"
        className="top-logo"
        onClick={() => navigate('/home')}
      />

      {/* Refund Content */}
      <div className="refund-content">
        <h2>Submit Refund Request</h2>

        <div className="form-group">
          <label>Enter Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter name" />
        </div>

        <div className="form-group">
          <label>Enter Email ID</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter email" />
        </div>

        <div className="form-group">
          <label>Rider Name</label>
          <input type="text" value={riderName} onChange={(e) => setRiderName(e.target.value)} placeholder="Enter rider name" />
        </div>

        <div className="form-group">
          <label>Ride No</label>
          <input type="text" value={rideNo} onChange={(e) => setRideNo(e.target.value)} placeholder="Enter ride number" />
        </div>

        <div className="form-group">
          <label>Amount to Pay</label>
          <input type="text" value={refundAmount} onChange={(e) => setRefundAmount(e.target.value)} placeholder="Enter refund amount" />
        </div>

        <div className="form-group">
          <label>Receiving Number</label>
          <input type="text" value={receivingNumber} onChange={(e) => setReceivingNumber(e.target.value)} placeholder="Enter receiving number" />
        </div>

        <div className="form-group">
          <label>Reason</label>
          <div className="reason-options">
            <label>
              <input type="radio" value="Cancel ride by driver" checked={reason === 'Cancel ride by driver'} onChange={() => setReason('Cancel ride by driver')} />
              Cancel ride by driver
            </label>
            <label>
              <input type="radio" value="Not coming" checked={reason === 'Not coming'} onChange={() => setReason('Not coming')} />
              Not coming
            </label>
          </div>
        </div>

        <div className="form-group">
          <label>Upload Screenshot</label>
          <input type="file" accept="image/*" onChange={(e) => setScreenshot(e.target.files[0])} />
        </div>

        <div className="form-group">
          <label>Enter Transaction ID</label>
          <input type="text" value={transactionId} onChange={(e) => setTransactionId(e.target.value)} placeholder="Enter transaction ID" />
        </div>

        {/* Submit Button */}
        <button className="submit-button" onClick={handleSubmit}>Submit Request</button>

        {/* Status Message */}
        {message && <p className="status-message">{message}</p>}
      </div>
    </div>
  );
};

export default RefundPage;
