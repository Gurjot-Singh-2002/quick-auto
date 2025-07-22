// SignupService.js
import { db } from './firebase';
import { collection, addDoc } from 'firebase/firestore';

// Function to store student data
export const storeStudentData = async (studentData) => {
  try {
    const docRef = await addDoc(collection(db, "students"), studentData);
    console.log("Student document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding student document: ", e);
  }
};

// Function to store driver data
export const storeDriverData = async (driverData) => {
  try {
    const docRef = await addDoc(collection(db, "drivers"), driverData);
    console.log("Driver document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding driver document: ", e);
  }
};
