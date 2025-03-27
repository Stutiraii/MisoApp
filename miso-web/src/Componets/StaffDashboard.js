import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import PrivateRoute from "../Componets/PrivateRoute";
import Hours from "./Hours";
import ViewSchedule from "./ViewSchedule";
import "../styles/App.css";

function StaffDashboard() {
  return (
    <div className="dashboard-container">
      <h2>Staff Dashboard</h2>
      <nav>
        <Link to="ViewSchedule" className="nav-link">View Schedule</Link>
        <Link to="hours" className="nav-link">Clock In/Out</Link>
      </nav>

      <Routes>
        <Route
          path="ViewSchedule"
          element={<PrivateRoute element={<ViewSchedule />} />}
        />
        <Route path="hours" element={<Hours />} />
        {/* Catch-all or default route for staff dashboard */}
        <Route path="*" element={<div>Select an option from above.</div>} />
      </Routes>
    </div>
  );
}

export default StaffDashboard;
