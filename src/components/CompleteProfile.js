import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from './firebase';
import { doc, setDoc } from 'firebase/firestore';

const CompleteProfile = () => {
  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [phone, setPhone] = useState('');
  const navigate = useNavigate();

  const handleCompleteProfile = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      // Store user details in Firestore
      await setDoc(doc(db, 'students', user.uid), {
        uid: user.uid,
        name,
        rollNumber,
        phone,
        email: user.email,
      });
      navigate('/home');
    } catch (error) {
      console.error('Error completing profile:', error);
    }
  };

  return (
    <div className="complete-profile-container">
      <h2>Complete Your Profile</h2>
      <div className="form-group">
        <label>Name</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="form-group">
        <label>Roll Number</label>
        <input type="text" value={rollNumber} onChange={(e) => setRollNumber(e.target.value)} />
      </div>
      <div className="form-group">
        <label>Phone Number</label>
        <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>
      <button onClick={handleCompleteProfile}>Submit</button>
    </div>
  );
};

export default CompleteProfile;
