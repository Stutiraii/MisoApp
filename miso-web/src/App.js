import React, { useEffect } from "react";
import { Routes, Route, Link } from "react-router-dom";
import Login from "./Componets/Login";
import SignUp from "./Componets/SignUp";
import PrivateRoute from "./Componets/PrivateRoute";
import Dashboard from "./Componets/Dashboard";
import { useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import "./styles/App.css";

function App() {
  const [user, setUser] = useState(null);
  const auth = getAuth();

  useEffect(() => {
    // Set up authentication state listener
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe(); // Cleanup function
  }, [auth]);

  return (
    <div>
      {/* <nav>
        <Link to="/">Home</Link> | <Link to="/login">Login</Link> | 
        <Link to="/signup">Sign Up</Link> | <Link to="/dashboard">Dashboard</Link>
      </nav> */}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route
          path="/dashboard"
          element={<PrivateRoute user={user} element={<Dashboard />} />}
        />
      </Routes>
    </div>
  );
}

export default App;
