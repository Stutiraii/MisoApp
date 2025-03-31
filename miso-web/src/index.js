import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FirebaseProvider } from "./Componets/Context/firebaseContext";
import App from "./App";
import  {ChatProvider} from "./Componets/Context/ChatContext"; // Import ChatProvider

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <FirebaseProvider>   {/* Ensure FirebaseProvider wraps the entire app */}
      <BrowserRouter>
      <ChatProvider>
        <App />
        </ChatProvider>
      </BrowserRouter>
    </FirebaseProvider>
  </React.StrictMode>
);
