import React from "react";
import { useFirebase } from "./firebaseContext";
import { Routes, Route, Link } from "react-router-dom";
import PrivateRoute from "../Componets/PrivateRoute";
import StaffDashboard from "./StaffDashboard";
import ManageInventory from "./ManageInventory";
import Hours from "./Hours"; // Import the ClockInOut component
import ShiftCalendar from "./ShiftCalendar";
import ViewSchedule from "./ViewSchedule";
import AdminSchedule from "./AdminSchedule";
import "../styles/App.css";

function Dashboard() {
  const { currentUser } = useFirebase();

  return (
    <div className="dashboard-container">
      <h2>Dashboard</h2>
      <nav>
        <Link to="/AdminSchedule" className="nav-link">Admin</Link>
        <Link to="/ManageInventory" className="nav-link">Inventory</Link>
        <Link to="/calendar" className="nav-link">View Schedule</Link>
        <Link to="/Dashboard" className="nav-link">Staff</Link>
        
                <Link to="ViewSchedule" className="nav-link">View Schedule</Link>
                <Link to="hours" className="nav-link">Clock In/Out</Link>
      </nav>

      <Routes>
        <Route
          path="/AdminSchedule"
          element={
            <PrivateRoute user={currentUser} element={<AdminSchedule />} />
          }
        />

        <Route
          path="/ManageInventory"
          element={
            <PrivateRoute user={currentUser} element={<ManageInventory />} />
          }
        />

        <Route path="/calendar" element={<ShiftCalendar />} />
          
        <Route path="/StaffDashboard/*" 
         element={<PrivateRoute user={currentUser} element={<StaffDashboard />} />}
/>
<Route path="hours" element={<Hours />} />
        <Route
          path="ViewSchedule"
          element={
            <PrivateRoute user={currentUser} element={<ViewSchedule />} />
          }
        />

      </Routes>
    </div>
  );
}

export default Dashboard;
