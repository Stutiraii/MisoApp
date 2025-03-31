import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import Hours from "./Hours";
import ViewSchedule from "./ViewSchedule";
import { MsgContextProvider } from "./Context/MsgContext";
import ChatPage from "./MessageContainer"; // Import the ChatPage component
import SidebarPage from "./MessageContainer"; // If you have SidebarPage

import "../styles/App.css";

function StaffDashboard() {
  return (
    <div className="dashboard-container">
      <h2>Staff Dashboard</h2>

      {/* Always visible components */}
      <Hours />
      <ViewSchedule />

      {/* Links for Sidebar and Chat navigation */}
      <nav>
        <Link to="/sidebar">Go to Sidebar</Link>
        <br />
        <Link to="/chat">Go to Chat</Link>
      </nav>

      {/* Message context provider for chat-related components */}
      <MsgContextProvider>
        <Routes>
          {/* Define route for sidebar */}
          <Route path="/sidebar" element={<SidebarPage />} />
          {/* Define route for chat */}
          <Route path="/chat" element={<ChatPage />} />
          
          {/* Catch-all or default route */}
          <Route path="*" element={<div>Select an option from above.</div>} />
        </Routes>
      </MsgContextProvider>
    </div>
  );
}

export default StaffDashboard;
