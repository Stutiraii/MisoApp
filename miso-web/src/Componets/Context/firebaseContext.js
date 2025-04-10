import React, { createContext, useContext, useState, useEffect } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
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
const FirebaseContext = createContext(null);

// Firebase provider component
export const FirebaseProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [messagingToken, setMessagingToken] = useState(null);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Get FCM token (without asking for notification permission)
  useEffect(() => {
    if (currentUser) {
      const messaging = getMessaging(app);
      getToken(messaging, { vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY })
        .then((currentToken) => {
          if (currentToken) {
            setMessagingToken(currentToken);
            console.log("FCM Token: ", currentToken);
          } else {
            console.log("No registration token available.");
          }
        })
        .catch((err) => {
          console.error("An error occurred while retrieving token: ", err);
        });
    }
  }, [currentUser]);

  // Optionally refresh token manually
  useEffect(() => {
    if (currentUser) {
      const messaging = getMessaging(app);
      const refreshToken = async () => {
        try {
          const newToken = await getToken(messaging, { vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY });
          if (newToken) {
            setMessagingToken(newToken);
            console.log("FCM Token refreshed: ", newToken);
          }
        } catch (err) {
          console.error("An error occurred while refreshing token: ", err);
        }
      };
      refreshToken();
    }
  }, [currentUser]);

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        setMessagingToken(null);
        console.log("User logged out");
      })
      .catch((error) => {
        console.error("Error logging out: ", error);
      });
  };

  return (
    <FirebaseContext.Provider value={{ auth, currentUser, db, messagingToken, handleLogout }}>
      {children}
    </FirebaseContext.Provider>
  );
};

// Custom hook to use Firebase context
export const useFirebase = () => useContext(FirebaseContext);
