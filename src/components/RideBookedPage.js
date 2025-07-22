import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { db } from './firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore'; // Add updateDoc to the imports
import './RideBookedPage.css';

const RideBookedPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { rideId, rideType } = state || {}; // Destructure rideId and rideType from state

  // State to store ride details
  const [rideDetails, setRideDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (rideId && rideType) {
      fetchRideDetails();
    } else {
      console.error("Ride ID or ride type not found.");
      navigate('/'); // Redirect to home if rideId or rideType is missing
    }
  }, [rideId, rideType]);

  const fetchRideDetails = async () => {
    try {
      const rideDocRef = doc(db, rideType === 'vip' ? 'vipRides' : rideType === 'normal' ? 'normalRides' : 'advanceBookings', rideId);
      const rideDoc = await getDoc(rideDocRef);

      if (rideDoc.exists()) {
        setRideDetails(rideDoc.data());
      } else {
        console.error("No such ride document found!");
      }
    } catch (error) {
      console.error("Error fetching ride details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEndRide = () => {
    // Mark the ride as finished in the database
    if (rideId) {
      updateRideStatus(rideId, { status: "finished" });
      console.log("Ride marked as finished.");
      navigate('/home'); // Redirect to home after finishing ride
    }
  };

  const updateRideStatus = async (id, statusUpdates) => {
    const rideDocRef = doc(db, rideType === 'vip' ? 'vipRides' : rideType === 'normal' ? 'normalRides' : 'advanceBookings', id);
    try {
      await updateDoc(rideDocRef, statusUpdates); // updateDoc is now defined and can be used
      console.log("Ride status updated in Firestore.");
    } catch (error) {
      console.error("Error updating ride status:", error);
    }
  };

  if (loading) {
    return <div>Loading ride details...</div>;
  }

  if (!rideDetails) {
    return <div>Ride details not available.</div>;
  }

  return (
    <div className="ride-booked-container">
      <h2>Ride Details</h2>
      <div className="ride-details">
        <p><strong>Driver Name:</strong> {rideDetails.driverName || 'N/A'}</p>
        <p><strong>Student Name:</strong> {rideDetails.name}</p>
        <p><strong>Phone:</strong> {rideDetails.phone}</p>
        <p><strong>Source:</strong> {rideDetails.source}</p>
        <p><strong>Destination:</strong> {rideDetails.destination}</p>
        <p><strong>Ride Number:</strong> {rideDetails.rideNumber}</p>
        <p><strong>Status:</strong> {rideDetails.status}</p>
      </div>
      <button className="end-ride-button" onClick={handleEndRide}>End Ride</button>
    </div>
  );
};

export default RideBookedPage;
