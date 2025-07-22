import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';


const firebaseConfig = {
    apiKey: "AIzaSyBb4aq5X8C6FUYLVDwNZ9XpKDRgLebolO4",
    authDomain: "quick-auto-f621d.firebaseapp.com",
    projectId: "quick-auto-f621d",
    storageBucket: "quick-auto-f621d.firebasestorage.app",
    messagingSenderId: "343542778633",
    appId: "1:343542778633:web:b94a18e3efc77704f1a1d8",
    measurementId: "G-QL7EPTW132",
    databaseURL: "https://quick-auto-f621d-default-rtdb.firebaseio.com/"
  };

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const storage = getStorage(app);
  const auth = getAuth(app);

  export { db, storage, auth };
