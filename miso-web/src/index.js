import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FirebaseProvider } from "./Componets/Context/firebaseContext";
import App from "./App";
import  {ChatProvider} from "./Componets/Context/ChatContext"; // Import ChatProvider

const root = ReactDOM.createRoot(document.getElementById("root"));
// Register the service worker if it’s not already registered
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/firebase-messaging-sw.js')
    .then(function(registration) {
      console.log('Service Worker registered with scope:', registration.scope);
    }).catch(function(err) {
      console.log('Service Worker registration failed:', err);
    });
}


root.render(
  <React.StrictMode>
    <FirebaseProvider>
      <BrowserRouter>
      <ChatProvider>
        <App />
        </ChatProvider>
      </BrowserRouter>
    </FirebaseProvider>
  </React.StrictMode>
);
