import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, doc, updateDoc, onSnapshot, getDoc, arrayUnion } from 'firebase/firestore';
import { db, auth } from './firebase'; // Firestore and Auth setup
import './DriverHomePage.css';

const DriverHomePage = () => {
  const navigate = useNavigate();
  const [driverName, setDriverName] = useState('');
  const [driverId, setDriverId] = useState(''); // Store driver ID (uid)
  const [normalRides, setNormalRides] = useState([]);
  const [vipRides, setVipRides] = useState([]);
  const [advanceBookings, setAdvanceBookings] = useState([]);
  const [tempRejectedRides, setTempRejectedRides] = useState([]); // Temporarily rejected rides for 5 seconds

  useEffect(() => {
    const fetchDriverInfo = async () => {
      const user = auth.currentUser;
      if (user) {
        setDriverId(user.uid);
        const driverDocRef = doc(db, 'drivers', user.uid);
        const driverDoc = await getDoc(driverDocRef);
        if (driverDoc.exists()) {
          setDriverName(driverDoc.data().name);
        }
      }
    };
    fetchDriverInfo();
  }, []);

  useEffect(() => {
    const unsubNormalRides = onSnapshot(collection(db, 'normalRides'), (snapshot) => {
      setNormalRides(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    const unsubVipRides = onSnapshot(collection(db, 'vipRides'), (snapshot) => {
      setVipRides(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    const unsubAdvanceBookings = onSnapshot(collection(db, 'advanceBookings'), (snapshot) => {
      setAdvanceBookings(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubNormalRides();
      unsubVipRides();
      unsubAdvanceBookings();
    };
  }, []);

  const handleAcceptRide = async (rideType, ride) => {
    const collectionName = rideType === "normal" ? "normalRides" : rideType === "vip" ? "vipRides" : "advanceBookings";
    const rideRef = doc(db, collectionName, ride.id);

    try {
      await updateDoc(rideRef, { status: "accepted", acceptedBy: driverId });
      console.log(`Ride ${ride.id} status updated to accepted by driver ${driverId}.`);
    } catch (error) {
      console.error("Error updating ride status:", error);
    }
  };

  const handleRejectRide = async (rideType, rideId) => {
    const collectionName = rideType === "normal" ? "normalRides" : rideType === "vip" ? "vipRides" : "advanceBookings";
    const rideRef = doc(db, collectionName, rideId);
  
    try {
      // Fetch the current ride data to check its status
      const rideDoc = await getDoc(rideRef);
      const rideData = rideDoc.data();
  
      if (rideData.status === "paid") {
        // If the ride is "paid," update Firestore to "cancelled after paid"
        await updateDoc(rideRef, { status: "cancelled after paid" });
        console.log(`Ride ${rideId} canceled after payment by driver ${driverId}. Entry remains in Firestore for records.`);
  
        // Temporarily add ride ID to tempRejectedRides to show "Ride Rejected" for 5 seconds
        setTempRejectedRides((prev) => [...prev, rideId]);
  
        // Set a 5-second timer to remove the ride from the dashboard
        setTimeout(() => {
          setTempRejectedRides((prev) => prev.filter((id) => id !== rideId));
          // Remove the ride from the dashboard state
          setNormalRides((prev) => prev.filter((ride) => ride.id !== rideId));
          setVipRides((prev) => prev.filter((ride) => ride.id !== rideId));
          setAdvanceBookings((prev) => prev.filter((ride) => ride.id !== rideId));
        }, 5000); // 5-second timer
      } else {
        // If the ride is not "paid," proceed with normal rejection process
        if (!rideData.rejectedBy) {
          // Initialize the rejectedBy array if it doesn't exist
          await updateDoc(rideRef, { rejectedBy: [driverId], status: "rejected" });
        } else {
          await updateDoc(rideRef, {
            rejectedBy: arrayUnion(driverId),
            status: "rejected"
          });
        }
        console.log(`Ride ${rideId} rejected by driver ${driverId} and added to rejectedBy array.`);
  
        // Temporarily add ride ID to tempRejectedRides for this driver
        setTempRejectedRides((prev) => [...prev, rideId]);
  
        // Set a 5-second timer to remove the ride from the dashboard
        setTimeout(() => {
          setTempRejectedRides((prev) => prev.filter((id) => id !== rideId));
          setNormalRides((prev) => prev.filter((ride) => ride.id !== rideId));
          setVipRides((prev) => prev.filter((ride) => ride.id !== rideId));
          setAdvanceBookings((prev) => prev.filter((ride) => ride.id !== rideId));
        }, 5000); // 5-second timer
      }
    } catch (error) {
      console.error("Error updating ride status:", error);
    }
  };
  
    


  const handlePaymentConfirmed = async (rideType, rideId) => {
    const collectionName = rideType === "normal" ? "normalRides" : rideType === "vip" ? "vipRides" : "advanceBookings";
    const rideRef = doc(db, collectionName, rideId);

    try {
      await updateDoc(rideRef, { status: "paid" });
      console.log(`Ride ${rideId} status updated to paid.`);
    } catch (error) {
      console.error("Error updating payment status:", error);
    }
  };

  const handleCancelAfterPay = async (rideType, rideId) => {
    const collectionName = rideType === "normal" ? "normalRides" : rideType === "vip" ? "vipRides" : "advanceBookings";
    const rideRef = doc(db, collectionName, rideId);

    try {
      await updateDoc(rideRef, { status: "cancelled after paid" });
      console.log(`Ride ${rideId} status updated to "cancelled after paid" by driver ${driverId}.`);
    } catch (error) {
      console.error("Error updating ride status after payment cancellation:", error);
    }
  };

  return (
    <div className="driver-home-container">
      <div className="header">
        <h1 className="welcome-textdh">Welcome, {driverName}</h1>
        <img src="/icons/quickautologo.png" alt="Quick Auto Logo" className="quick-auto-icondh" />
        <img src="/icons/profile.png" alt="Profile" className="profile-icon" onClick={() => navigate('/profile')} />
      </div>

      <RideSection
        title="Normal Ride Offers"
        rides={normalRides.filter(ride => (!ride.rejectedBy || !ride.rejectedBy.includes(driverId)) && (ride.acceptedBy === driverId || !ride.acceptedBy))}
        rideType="normal"
        handleAcceptRide={handleAcceptRide}
        handleRejectRide={handleRejectRide}
        handlePaymentConfirmed={handlePaymentConfirmed}
        handleCancelAfterPay={handleCancelAfterPay}
        tempRejectedRides={tempRejectedRides}
      />
      <RideSection
        title="VIP Booking Offers"
        rides={vipRides.filter(ride => (!ride.rejectedBy || !ride.rejectedBy.includes(driverId) || tempRejectedRides.includes(ride.id)) && (ride.acceptedBy === driverId || !ride.acceptedBy))}
        rideType="vip"
        handleAcceptRide={handleAcceptRide}
        handleRejectRide={handleRejectRide}
        handlePaymentConfirmed={handlePaymentConfirmed}
        handleCancelAfterPay={handleCancelAfterPay}
        tempRejectedRides={tempRejectedRides}
      />
      <RideSection
        title="Advance Booking Offers"
        rides={advanceBookings.filter(ride => (!ride.rejectedBy || !ride.rejectedBy.includes(driverId)) && (ride.acceptedBy === driverId || !ride.acceptedBy))}
        rideType="advance"
        handleAcceptRide={handleAcceptRide}
        handleRejectRide={handleRejectRide}
        handlePaymentConfirmed={handlePaymentConfirmed}
        handleCancelAfterPay={handleCancelAfterPay}
        tempRejectedRides={tempRejectedRides}
      />
    </div>
  );
};

const RideSection = ({ title, rides, rideType, handleAcceptRide, handleRejectRide, handlePaymentConfirmed, handleCancelAfterPay, tempRejectedRides }) => (
  <div className="ride-section">
    <h2>{title}</h2>
    {rides.length === 0 ? (
      <p className="no-rides-message">No {rideType} rides available.</p>
    ) : (
      rides.map((ride) => (
        <div className="ride-offer" key={ride.id}>
          <p><strong>Source:</strong> {ride.source} | <strong>Destination:</strong> {ride.destination}</p>
          {rideType === "normal" && <p><strong>Bid Amount:</strong> Rs. {ride.amount}</p>}
          {rideType === "vip" && <><p><strong>Amount:</strong> Rs. 40</p><p><strong>Student Name:</strong> {ride.name}</p></>}
          {rideType === "advance" && (
            <>
              <p><strong>Date:</strong> {ride.date}</p>
              <p><strong>Time:</strong> {ride.time}</p>
              <p><strong>Number of students:</strong> {ride.numPersons}</p>
              <p><strong>Students with luggage:</strong> {ride.studentsWithLuggage}</p>
              <p><strong>Student Name:</strong> {ride.name}</p>
              <p><strong>Amount:</strong> Rs. {ride.amount}</p>
            </>
          )}
          <div className="ride-actions">
  {/* Display accepted or confirmed messages based on status */}
  {ride.status === "accepted" && (
    <p className="ride-accepted-message">Ride Accepted</p>
  )}
  {ride.status === "paid" && (
    <p className="ride-confirmed-message">Ride Confirmed</p>
  )}

  {/* If temporarily rejected, show rejected message */}
  {tempRejectedRides.includes(ride.id) ? (
    <p className="ride-rejected-message">Ride Rejected</p>
  ) : (
    <>
      {/* Show Accept button only if ride is not accepted or paid */}
      {ride.status !== "accepted" && ride.status !== "paid" && (
        <button className="accept-button" onClick={() => handleAcceptRide(rideType, ride)}>✓</button>
      )}

      {/* Always show Reject button (✗) for the option to cancel */}
      <button className="reject-button" onClick={() => handleRejectRide(rideType, ride.id)}>✗</button>
    </>
  )}
</div>
        </div>
      ))
    )}
  </div>
);

export default DriverHomePage;