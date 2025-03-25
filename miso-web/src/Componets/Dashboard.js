import React from "react";
import { useFirebase } from "./firebaseContext";
import { Routes, Route, Link } from "react-router-dom";
import PrivateRoute from "../Componets/PrivateRoute";
import Hours from "./Hours"; // Import the ClockInOut component
import AdminSchedule from "./AdminSchedule"; // Corrected import
import "../styles/App.css";

function Dashboard() {
  const { currentUser } = useFirebase();

  return (
    <div>
      <h2>Welcome, {currentUser ? currentUser.name : "Staff Member"}!</h2>

      <Link to="/AdminSchedule">Admin</Link>


      <Routes>
        <Route
          path="/AdminSchedule"
          element={<PrivateRoute user={currentUser} element={<AdminSchedule />} />}
        />
      </Routes>
    </div>
  );
}

export default Dashboard;
