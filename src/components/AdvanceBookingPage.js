import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from './firebase';
import { collection, addDoc, updateDoc, doc, getDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import './AdvanceBookingPage.css';

const AdvanceBookingPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [numPersons, setNumPersons] = useState(1);
  const [studentsWithLuggage, setStudentsWithLuggage] = useState(0);
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [status, setStatus] = useState('idle');
  const [rideId, setRideId] = useState(null);
  const [rideNumber, setRideNumber] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [transactionId, setTransactionId] = useState(null);
  const [amount, setAmount] = useState(0);

  const bookingsCollectionRef = collection(db, 'advanceBookings');

  useEffect(() => {
    const generateRideNumber = () => `RN${Math.floor(Math.random() * 1000000)}`;
    setRideNumber(generateRideNumber());

    const fetchRollNo = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, 'students', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setRollNo(userDoc.data().rollNo);
        } else {
          console.error('No such student document found!');
        }
      } else {
        console.error('No user is logged in.');
      }
    };

    fetchRollNo();
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0];

  const calculateAmount = () => {
    const baseFare = 10;
    const studentFare = numPersons * 10;
    const luggageFare = studentsWithLuggage * 10;
    const totalAmount = studentFare + luggageFare + baseFare;
    setAmount(totalAmount);
  };

  useEffect(() => {
    calculateAmount();
  }, [numPersons, studentsWithLuggage]);

  const handleSendToDriver = async () => {
    try {
      const user = auth.currentUser;
      if (!user || !rollNo) {
        console.error("No user is logged in or rollNo is not set.");
        return;
      }

      setStatus("pending");

      const newBooking = {
        name,
        phone,
        date,
        time,
        numPersons,
        studentsWithLuggage,
        source,
        destination,
        status: "pending",
        transactionId: "Pending",
        rollNo,
        rideNumber,
        amount,
        createdAt: new Date(),
      };

      const bookingDocRef = await addDoc(bookingsCollectionRef, newBooking);
      setRideId(bookingDocRef.id);
      console.log("Booking added with ID:", bookingDocRef.id);

      const unsubscribeStatus = onSnapshot(doc(db, 'advanceBookings', bookingDocRef.id), (docSnapshot) => {
        if (docSnapshot.exists()) {
          const bookingData = docSnapshot.data();
          setStatus(bookingData.status);
        }
      });

      setTimeout(() => {
        if (status === "pending") {
          setStatus("no-driver");
          updateBookingStatus(bookingDocRef.id, { status: "no-driver" });
          console.log("No driver available, retrying...");
        }
      }, 60000);

      return () => unsubscribeStatus();
    } catch (error) {
      console.error("Error adding booking to Firestore:", error);
    }
  };

  const updateBookingStatus = async (id, statusUpdates) => {
    const bookingDocRef = doc(db, 'advanceBookings', id);
    try {
      await updateDoc(bookingDocRef, statusUpdates);
      console.log("Booking status updated in Firestore.");
    } catch (error) {
      console.error("Error updating booking status:", error);
    }
  };

  const handleCancelRide = async () => {
    setStatus("idle");
    if (rideId) {
      try {
        await deleteDoc(doc(db, 'advanceBookings', rideId));
        console.log("Ride entry deleted from Firestore.");
      } catch (error) {
        console.error("Error deleting ride entry:", error);
      }
    }

    setName('');
    setPhone('');
    setDate('');
    setTime('');
    setNumPersons(1);
    setStudentsWithLuggage(0);
    setSource('');
    setDestination('');
    setRideId(null);
    setStatus('idle');
  };

  const handlePayment = () => {
    if (status === "accepted") {
      const txnId = `TXN${Math.floor(Math.random() * 1000000)}`;
      console.log("Proceeding to payment... Transaction ID:", txnId);
      setTransactionId(txnId);

      if (rideId) {
        updateBookingStatus(rideId, { transactionId: txnId, status: "paid" });
        console.log('Ride status updated to "paid" with transaction ID:', txnId);
      }

      navigate(`/ridebooked/${rideId}`, { state: { rideId, rideType: 'advance' } });
    }
  };

  return (
    <div className="adv-booking-container">
      <img
        src="/icons/quickautologo.png"
        alt="Quick Auto Logo"
        className="top-logo"
        onClick={() => navigate('/home')}
      />

      <div className="adv-booking-content">
        <h2>Advance Booking</h2>

        <div className="form-group">
          <label>Enter Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter name" />
        </div>

        <div className="form-group">
          <label>Phone No</label>
          <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Enter phone number" />
        </div>

        <div className="form-group">
          <label>Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={today}
            max={tomorrow}
          />
        </div>

        <div className="form-group">
          <label>Time</label>
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </div>

        <div className="form-group">
          <label>Number of Persons</label>
          <div className="num-persons">
            <button onClick={() => setNumPersons(numPersons > 1 ? numPersons - 1 : 1)}>-</button>
            <span>{numPersons}</span>
            <button onClick={() => setNumPersons(numPersons < 4 ? numPersons + 1 : numPersons)}>+</button>
          </div>
        </div>

        <div className="form-group">
          <label>Students with Luggage</label>
          <div className="num-persons">
            <button onClick={() => setStudentsWithLuggage(studentsWithLuggage > 0 ? studentsWithLuggage - 1 : 0)}>-</button>
            <span>{studentsWithLuggage}</span>
            <button onClick={() => setStudentsWithLuggage(studentsWithLuggage < 4 ? studentsWithLuggage + 1 : studentsWithLuggage)}>+</button>
          </div>
        </div>

        <div className="form-group">
          <label>Enter Source</label>
          <input type="text" value={source} onChange={(e) => setSource(e.target.value)} placeholder="Enter source" />
        </div>

        <div className="form-group">
          <label>Enter Destination</label>
          <input type="text" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Enter destination" />
        </div>

        <p className="amount-display"><strong>Total Fare:</strong> Rs. {amount}</p>

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

export default AdvanceBookingPage;
