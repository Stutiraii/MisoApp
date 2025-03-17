import React, { createContext, useContext,useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { initializeApp } from "firebase/app";

// Firebase configuration (use .env variables)
  const firebaseConfig = {
    apiKey: "AIzaSyAnfnZ6vD2cKjGQb6PKfnFrTjUI06rBdLY",
    authDomain: "misoapp-42785.firebaseapp.com",
    projectId: "misoapp-42785",
    storageBucket: "misoapp-42785.firebasestorage.app",
    messagingSenderId: "1072967183567",
    appId: "1:1072967183567:web:5db3a66e0654ebc25c5bba",
    measurementId: "G-TQT6VJXQNX"
  };


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const [currentUser, setCurrentUser] = useState(null);

// Create a Firebase context
const FirebaseContext = createContext(null);
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    setCurrentUser(user);
  });

  return () => unsubscribe();
}, []);


// Firebase provider component
export const FirebaseProvider = ({ children }) => {
  return (
    <FirebaseContext.Provider value={{ auth, currentUser }}>
      {children}
    </FirebaseContext.Provider>
  );
};

// Custom hook to use Firebase context
export const useFirebase = () => useContext(FirebaseContext);
