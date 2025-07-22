// FirebaseTest.js
import React, { useEffect } from 'react';
import { getDatabase, ref, set } from "firebase/database";
import { app } from "./firebase"; // Import Firebase app initialization

function FirebaseTest() {
  useEffect(() => {
    // Function to write test data to Firebase
    const writeTestData = () => {
      const db = getDatabase(app); // Initialize the database instance
      set(ref(db, "test/gs"), {
        message: "Firebase connection test",
        timestamp: Date.now(),
      })
      .then(() => {
        console.log("Data written successfully!");
      })
      .catch((error) => {
        console.error("Error writing data:", error);
      });
    };

    writeTestData(); // Call function to test Firebase
  }, []);

  return <div>Testing Firebase connection...</div>;
}

export default FirebaseTest;
