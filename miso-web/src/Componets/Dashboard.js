import React from "react";
import { useFirebase } from "./firebaseContext";
import Hours from "./Hours"; // Import the ClockInOut component
import Admin from "./AdminSchedule"; // Import the Admin component
import "../styles/App.css";
import AdminSchedule from "./AdminSchedule";

function Dashboard() {
  const { currentUser } = useFirebase();

  return (
    <div>
      {/* <h2>Welcome, {currentUser ? currentUser.name : "Staff Member"}!</h2> */}
      <AdminSchedule /> {/* Display the Admin button */}
    </div>
  );
}

export default Dashboard;
