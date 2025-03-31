import React, { createContext, useContext, useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { collection, addDoc } from "firebase/firestore";
import { getMessaging, getToken } from "firebase/messaging";


// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Create a Firebase context
const FirebaseContext = createContext(null);

// // Initialize Firebase Cloud Messaging and get a reference to the service
// const messaging = getMessaging(app);
// getToken(messaging, {vapidKey: "9iOV50RgeTzLXEDAqk7dDfXTXGM3LENwjzt7bW4ElQQ"});

// Firebase provider component
export const FirebaseProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [messagingToken, setMessagingToken] = useState(null);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  // // Initialize Firebase Cloud Messaging and get a reference to the service
  // useEffect(() => {
  //   if (currentUser) {
  //     const messaging = getMessaging(app);

  //     // Get the FCM token
  //     getToken(messaging, { vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY })
  //       .then((currentToken) => {
  //         if (currentToken) {
  //           setMessagingToken(currentToken); // Store token
  //           console.log("FCM Token: ", currentToken); // Can be sent to server for push notifications
  //         } else {
  //           console.log("No registration token available. Request permission to generate one.");
  //         }
  //       })
  //       .catch((err) => {
  //         console.error("An error occurred while retrieving token: ", err);
  //       });
  //   }
  // }, [currentUser]);



  return (
    <FirebaseContext.Provider value={{ auth, currentUser, db }}>
      {children}
    </FirebaseContext.Provider>
  );
};

// Custom hook to use Firebase context
export const useFirebase = () => useContext(FirebaseContext);
