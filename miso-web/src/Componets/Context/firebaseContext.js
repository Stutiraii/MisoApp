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

// Create a Firebase context
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

    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  useEffect(() => {
    if (currentUser) {
      const messaging = getMessaging(app);
  
      // Request permission to show notifications
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          // Get the FCM token
          getToken(messaging, { vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY })
            .then((currentToken) => {
              if (currentToken) {
                setMessagingToken(currentToken); // Store token
                console.log("FCM Token: ", currentToken); // Can be sent to server for push notifications
              } else {
                console.log("No registration token available. Request permission to generate one.");
              }
            })
            .catch((err) => {
              console.error("An error occurred while retrieving token: ", err);
            });
        } else {
          console.log("Notification permission denied.");
        }
      });
    }
  }, [currentUser]);

  // Manually refresh token
  useEffect(() => {
    if (currentUser) {
      const messaging = getMessaging(app);

      const refreshToken = async () => {
        try {
          const newToken = await getToken(messaging, { vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY });
          if (newToken) {
            setMessagingToken(newToken); // Update the token
            console.log("FCM Token refreshed: ", newToken);
          }
        } catch (err) {
          console.error("An error occurred while refreshing token: ", err);
        }
      };

      // Refresh the token when the app is in use or periodically
      refreshToken();
    }
  }, [currentUser]);
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/firebase-messaging-sw.js')
      .then((registration) => {
        console.log('Service Worker registered with scope:', registration.scope);
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
  }
  

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        setMessagingToken(null);  // Clear the token on logout
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
