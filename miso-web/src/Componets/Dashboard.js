import React from "react";
import { useFirebase } from "./firebaseContext";
import { Routes, Route, Link } from "react-router-dom";
import PrivateRoute from "../Componets/PrivateRoute";
import ManageInventory from "./ManageInventory";
import Hours from "./Hours"; // Import the ClockInOut component
import AdminSchedule from "./AdminSchedule"; // Corrected import
import "../styles/App.css";

function Dashboard() {
  const { currentUser } = useFirebase();

  return (
    <div>
      <h2>Welcome, {currentUser ? currentUser.name : "Staff Member"}!</h2>

      <Link to="/AdminSchedule">Admin</Link>
      <Link to="/ManageInventory">Inventory</Link>


      <Routes>
        <Route
          path="/AdminSchedule"
          element={<PrivateRoute user={currentUser} element={<AdminSchedule />} />}
        />

        {/* Add a route for the ManageInventory component */}
         <Route
          path="/ManageInventory"
          element={<PrivateRoute user={currentUser} element={<ManageInventory />} />}
        />
      </Routes>
    </div>
  );
}

export default Dashboard;
