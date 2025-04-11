import React, { createContext, useContext, useState, useEffect } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

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
      const fetchToken = async () => {
        try {
          const token = await getToken(messaging, {
            vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY,
          });
          if (token) {
            setMessagingToken(token);
            console.log("FCM Token: ", token);
          } else {
            console.log("No registration token available.");
          }
        } catch (err) {
          console.error("Error getting token: ", err);
        }
      };
      fetchToken();
    }
  }, [currentUser]);

  // Handle incoming messages when the app is in the foreground
  useEffect(() => {
    if (currentUser) {
      const messaging = getMessaging(app);
      const unsubscribeMessage = onMessage(messaging, (payload) => {
        console.log("Message received: ", payload);
        // Handle the message as needed
      });
      return () => unsubscribeMessage();
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

  const requestNotificationPermission = async () => {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      console.log("Notification permission granted.");
    } else {
      console.log("Unable to get permission for notifications.");
    }
  };

  const deleteFCMToken = async () => {
    try {
      const messaging = getMessaging(app);
      await messaging.deleteToken();
      console.log("FCM Token deleted.");
    } catch (err) {
      console.log("Unable to delete FCM Token: ", err);
    }
  };

  return (
    <FirebaseContext.Provider
      value={{
        auth,
        currentUser,
        db,
        messagingToken,
        handleLogout,
        requestNotificationPermission,
        deleteFCMToken,
      }}
    >
      {children}
    </FirebaseContext.Provider>
  );
};

// Custom hook to use Firebase context
export const useFirebase = () => useContext(FirebaseContext);