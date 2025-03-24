import React from "react";
import { useFirebase } from "./firebaseContext";
import Hours from "./Hours";  // Import the ClockInOut component
import "../styles/App.css";

function Dashboard() {
  const { currentUser } = useFirebase();

  return (
    <div>
      <h2>Welcome, {currentUser ? currentUser.name : "Staff Member"}!</h2>
      <Hours />  {/* Display the Clock In/Out button */}
    </div>
  );
}

export default Dashboard;
