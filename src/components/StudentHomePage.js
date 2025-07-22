import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from './firebase'; 
import { collection, addDoc, updateDoc, doc, deleteDoc, getDoc, onSnapshot } from 'firebase/firestore'; 
import './StudentHomePage.css';

const StudentHomePage = () => {
  const navigate = useNavigate();

  // State variables
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [amount, setAmount] = useState(10); // Starting bid amount
  const [status, setStatus] = useState('idle');
  const [rideId, setRideId] = useState(null);
  const [rideNumber, setRideNumber] = useState('');
  const [rollNo, setRollNo] = useState(null);
  const [message, setMessage] = useState('Submit to Driver'); // Default message
  const [transactionId, setTransactionId] = useState(null);

  const normalRidesCollectionRef = collection(db, 'normalRides');

  useEffect(() => {
    const generateRideNumber = () => `NR${Math.floor(Math.random() * 1000000)}`;
    setRideNumber(generateRideNumber());

    const fetchRollNo = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, 'students', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setRollNo(userDoc.data().rollNo);
          console.log("Student roll number fetched successfully:", userDoc.data().rollNo); 
        } else {
          console.error('No student document found for the logged-in user.');
        }
      }
    };

    fetchRollNo();
  }, []);

  useEffect(() => {
    if (status === 'pending') {
      const timer = setTimeout(() => {
        if (amount < 40) {
          setMessage('Consider increasing the amount to pay.');
          setStatus('idle'); // Reset to allow resubmission
        } else if (amount === 40 && status !== 'accepted') {
          setStatus('no-driver');
          setMessage('No Driver Available, Retry');
          if (rideId) {
            updateRideStatus(rideId, { status: 'no-driver' });
          }
        }
      }, 30000);

      return () => clearTimeout(timer); // Clear timer if status changes
    }
  }, [status, amount, rideId]);

  const handleIncreaseAmount = () => {
    if (amount < 40) {
      setAmount(amount + 10);
      setMessage('Bid amount increased. Please resubmit.');
      setStatus('idle'); // Reset status to allow resubmission
    }
  };

  const handleSubmitToDriver = async () => {
    try {
      const user = auth.currentUser;
      if (!user || !rollNo) {
        console.error('No user is logged in or rollNo is not set.');
        return;
      }

      setStatus('pending');
      setMessage('Waiting for driver acceptance...');

      const newRide = {
        rollNo,
        source,
        destination,
        amount,
        rideNumber,
        status: 'pending',
        transactionId: 'Pending',
        createdAt: new Date(),
      };

      if (rideId) {
        await updateDoc(doc(db, 'normalRides', rideId), { amount, status: 'pending' });
        console.log("Bid amount updated in Firestore.");
      } else {
        const rideDocRef = await addDoc(normalRidesCollectionRef, newRide);
        setRideId(rideDocRef.id); 
        console.log("Normal ride added with ID:", rideDocRef.id);

        const unsubscribeStatus = onSnapshot(doc(db, 'normalRides', rideDocRef.id), (docSnapshot) => {
          if (docSnapshot.exists()) {
            const rideData = docSnapshot.data();
            const newStatus = rideData.status;
            setStatus(newStatus);

            if (newStatus === 'accepted') {
              setMessage('Ride accepted by driver.');
            } else if (newStatus === 'rejected') {
              setMessage('Ride rejected by driver.');
              setStatus('idle'); 
            } else if (newStatus === 'no-driver') {
              setMessage('No Driver Available, Retry');
            }
          }
        });

        return () => unsubscribeStatus();
      }
    } catch (error) {
      console.error('Error adding or updating normal ride in Firestore:', error);
    }
  };

  const handleCancelRide = async () => {
    setStatus('idle');
    setMessage('Ride has been canceled.');
    if (rideId) {
      try {
        await deleteDoc(doc(db, 'normalRides', rideId));
        console.log('Ride entry deleted from Firestore.');
      } catch (error) {
        console.error('Error deleting ride entry:', error);
      }
    }
    setSource('');
    setDestination('');
    setAmount(10);
    setRideId(null);
  };

  const handlePayment = () => {
    if (status === 'accepted') {
      const txnId = `TXN${Math.floor(Math.random() * 1000000)}`;
      console.log('Proceeding to payment... Transaction ID:', txnId);
      setTransactionId(txnId);
      if (rideId) {
        updateRideStatus(rideId, { transactionId: txnId, status: 'paid' });
        console.log('Ride status updated to "paid" with transaction ID:', txnId);
      }
      
      // Navigate to RideBookedPage with rideId and rideType as normal
      navigate(`/ridebooked/${rideId}`, { state: { rideId, rideType: 'normal' } });
    }
  };

  const updateRideStatus = async (id, statusUpdates) => {
    const rideDocRef = doc(db, 'normalRides', id);
    try {
      await updateDoc(rideDocRef, statusUpdates);
      console.log('Ride status updated in Firestore.');
    } catch (error) {
      console.error('Error updating ride status:', error);
    }
  };

  return (
    <div className="student-home-container">
      <div className="top-symbol-container">
        <img src="/icons/quickautologo.png" alt="Quick Auto" className="top-symbol" />
      </div>

      <img
        src="/icons/profile.png"
        alt="Profile"
        className="toph-logo"
        onClick={() => navigate('/profile')}
      />

      <div className="action-buttons">
        <button className="action-button">
          <img src="/icons/home.png" alt="Home" />
          Home
        </button>
        <button className="action-button" onClick={() => navigate('/advance-booking')}>
          <img src="/icons/book.png" alt="Advance Booking" />
          Advance Booking
        </button>
        <button className="action-button" onClick={() => navigate('/vip-ride')}>
          <img src="/icons/vip.jpg" alt="VIP Ride" />
          VIP Ride
        </button>
        <button className="action-button">
          <img src="/icons/complaint.jpg" alt="Complaint" />
          Complaint
        </button>
      </div>

      <div className="ride-details-section">
        <div className="location-inputs">
          <input type="text" value={source} onChange={(e) => setSource(e.target.value)} placeholder="Enter Source" />
          <input type="text" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Enter Destination" />
        </div>

        <div className="amount-selector">
          <span>Amount to Pay: Rs. {amount}</span>
          <button onClick={handleIncreaseAmount} disabled={amount >= 40}>+</button>
        </div>

        <p className="status-text"><strong>Status:</strong> {message}</p>

        <button
          className={`send-button ${status === 'accepted' ? 'accepted' : ''} ${status === 'no-driver' ? 'no-driver' : ''}`}
          onClick={status === 'idle' ? handleSubmitToDriver : null}
          disabled={status !== 'idle'}
        >
          {status === 'accepted' ? 'Accepted' : status === 'no-driver' ? 'No Driver Available, Retry' : status === 'pending' ? 'Waiting for Acceptance' : 'Submit to Driver'}
        </button>

        {status !== 'idle' && (
          <button className="cancel-button" onClick={handleCancelRide}>
            Cancel Ride
          </button>
        )}

        <button
          className="pay-button"
          onClick={handlePayment}
          disabled={status !== 'accepted'}
        >
          Proceed to Pay
        </button>
      </div>

      <div className="bottom-buttons">
        <button className="feedback-button" onClick={() => navigate('/feedback')}>
          <img src="/icons/feedback.png" alt="Feedback" className="button-icon" />
          Feedback
        </button>
        <button className="refund-button" onClick={() => navigate('/refund')}>
          <img src="/icons/refund.png" alt="Refund" className="button-icon" />
          Refund
        </button>
      </div>
    </div>
  );
};

export default StudentHomePage;
