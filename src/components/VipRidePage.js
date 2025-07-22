import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from './firebase'; // Import Firestore and Firebase Auth configuration
import { collection, addDoc, updateDoc, doc, getDocs, query, where, onSnapshot, deleteDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth'; // Import auth state change listener
import './VipRidePage.css';

const VipRidePage = () => {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [status, setStatus] = useState('idle');
  const [rideId, setRideId] = useState(null);
  const [rideNumber, setRideNumber] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [transactionId, setTransactionId] = useState(null);
  const [amount] = useState(40);

  const vipRidesCollectionRef = collection(db, 'vipRides');

  useEffect(() => {
    const generateRideNumber = () => `VIP${Math.floor(Math.random() * 1000000)}`;
    setRideNumber(generateRideNumber());

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const studentQuery = query(collection(db, 'students'), where('uid', '==', user.uid));
          const querySnapshot = await getDocs(studentQuery);

          if (!querySnapshot.empty) {
            const studentDoc = querySnapshot.docs[0];
            setRollNo(studentDoc.data().rollNo);
            console.log("Student roll number fetched successfully:", studentDoc.data().rollNo);
          } else {
            console.error('No student document found for the logged-in user.');
          }
        } catch (error) {
          console.error('Error fetching rollNo:', error);
        }
      } else {
        console.error('No user is logged in.');
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const handleSendToDriver = async () => {
    const user = auth.currentUser;
    if (!user || !rollNo || !name || !phone || !source || !destination) {
      console.error('Please fill in all fields.');
      return;
    }

    try {
      setStatus("pending");

      const newRide = {
        name,
        phone,
        source,
        destination,
        status: "pending",
        transactionId: "Pending",
        rollNo,
        rideNumber,
        amount,
        createdAt: new Date(),
      };

      const rideDocRef = await addDoc(vipRidesCollectionRef, newRide);
      setRideId(rideDocRef.id);
      console.log('VIP Ride added with ID:', rideDocRef.id);

      const unsubscribeStatus = onSnapshot(doc(db, 'vipRides', rideDocRef.id), (docSnapshot) => {
        if (docSnapshot.exists()) {
          const rideData = docSnapshot.data();
          const newStatus = rideData.status;
          if (newStatus === "accepted") {
            setStatus("accepted");
          } else if (newStatus === "no-driver") {
            setStatus("no-driver");
          }
        }
      });

      setTimeout(() => {
        if (status === "pending") {
          setStatus("no-driver");
          updateRideStatus(rideDocRef.id, { status: "no-driver" });
          console.log("No driver available, retrying...");
        }
      }, 30000);

      return () => unsubscribeStatus();
    } catch (error) {
      console.error('Error adding VIP ride to Firestore:', error);
    }
  };

  const updateRideStatus = async (id, statusUpdates) => {
    const rideDocRef = doc(db, 'vipRides', id);
    try {
      await updateDoc(rideDocRef, statusUpdates);
      console.log('VIP Ride status updated in Firestore.');
    } catch (error) {
      console.error('Error updating VIP ride status:', error);
    }
  };

  const handleCancelRide = async () => {
    setStatus("idle");
    if (rideId) {
      try {
        await deleteDoc(doc(db, 'vipRides', rideId));
        console.log('Ride entry deleted from Firestore.');
      } catch (error) {
        console.error('Error deleting ride entry:', error);
      }
    }
    setName('');
    setPhone('');
    setSource('');
    setDestination('');
    setRideId(null);
    setStatus('idle');
  };

  const handlePayment = () => {
    if (status === "accepted") {
      const txnId = `TXN${Math.floor(Math.random() * 1000000)}`;
      setTransactionId(txnId);

      if (rideId) {
        updateRideStatus(rideId, { transactionId: txnId, status: "paid" });
        console.log('Ride status updated to "paid" with transaction ID:', txnId);
      }
      
      navigate(`/ridebooked/${rideId}`, { state: { rideId, rideType: 'vip' } });
    }
  };

  return (
    <div className="vip-ride-container">
      <img
        src="/icons/quickautologo.png"
        alt="Quick Auto Logo"
        className="top-logo"
        onClick={() => navigate('/home')}
      />

      <div className="vip-ride-content">
        <h2>VIP Ride Booking</h2>

        <div className="form-group">
          <label>Enter Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter name" />
        </div>

        <div className="form-group">
          <label>Phone No</label>
          <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Enter phone number" />
        </div>

        <div className="form-group">
          <label>Enter Source</label>
          <input type="text" value={source} onChange={(e) => setSource(e.target.value)} placeholder="Enter source" />
        </div>

        <div className="form-group">
          <label>Enter Destination</label>
          <input type="text" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Enter destination" />
        </div>

        <p className="amount-display"><strong>Fare Amount:</strong> Rs. {amount}</p>

        <p className="ride-status"><strong>Status:</strong> {status === "idle" ? "Ready to send" : status}</p>

        <button
          className={`send-button ${status === 'accepted' ? 'accepted' : ''} ${status === 'no-driver' ? 'no-driver' : ''}`}
          onClick={handleSendToDriver}
          disabled={status !== 'idle'}
        >
          {status === 'accepted' ? 'Accepted' : status === 'no-driver' ? 'No Driver Available, Retry' : status === 'pending' ? 'Waiting for Acceptance' : 'Send to Driver'}
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
    </div>
  );
};

export default VipRidePage;
