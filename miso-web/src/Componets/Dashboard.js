import React from "react";
import { useFirebase } from "./firebaseContext";
import Hours from "./Hours";  // Import the ClockInOut component
import Admin from "./Admin";  // Import the Admin component
import "../styles/App.css";

function Dashboard() {
  const { currentUser } = useFirebase();

  return (
    <div>
      <h2>Welcome, {currentUser ? currentUser.name : "Staff Member"}!</h2>
      <Hours />  {/* Display the Clock In/Out button */}
<Admin />  {/* Display the Admin button */}
    </div>
  );
}

export default Dashboard;
