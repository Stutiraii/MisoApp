import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./Componets/Login";
import SignUp from "./Componets/SignUp";
import PrivateRoute from "./Componets/PrivateRoute";
import Dashboard from "./Componets/Dashboard";
import AdminSchedule from "./Componets/AdminSchedule"; // Import AdminSchedule
import ManageInventory from "./Componets/ManageInventory"; // Import ManageInventory
import { getAuth, onAuthStateChanged } from "firebase/auth";
import "./styles/App.css";

function App() {
  const [user, setUser] = useState(null);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, [auth]);

  return (
    <div>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        
        {/* Dashboard Route */}
        <Route
          path="/dashboard/*"
          element={<PrivateRoute user={user} element={<Dashboard />} />}
        />

        <Route
          path="/AdminSchedule"
          element={<PrivateRoute user={user} element={<AdminSchedule />} />}
        />
          <Route
          path="/ManageInventory"
          element={<PrivateRoute user={user} element={<ManageInventory />} />}
        />
      </Routes>
    </div>
  );
}

export default App;
