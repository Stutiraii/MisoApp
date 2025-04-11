importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyAnfnZ6vD2cKjGQb6PKfnFrTjUI06rBdLY",
  authDomain: "misoapp-42785.firebaseapp.com",
  projectId: "misoapp-42785",
  storageBucket: "misoapp-42785.firebasestorage.app",
  messagingSenderId: "1072967183567",
  appId: "1:1072967183567:web:5db3a66e0654ebc25c5bba",
  measurementId: "G-TQT6VJXQNX",
});

const messaging = firebase.messaging();

// [START messaging_on_background_message]
messaging.onBackgroundMessage((payload) => {
  console.log(
    '[firebase-messaging-sw.js] Received background message ',
    payload
  );
  // Customize notification here
  const notificationTitle = 'Background Message Title';
  const notificationOptions = {
    body: 'Background Message body.',
    icon: '/firebase-logo.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
