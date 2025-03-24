import React, { useEffect } from "react";
import { Routes, Route, Link } from "react-router-dom";
import Login from "./Componets/Login";
import SignUp from "./Componets/signUp";  // Import SignUp component
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

    // Cleanup on component unmount
    return () => unsubscribe();
  }, [auth]);

  return (
    <div>
      <nav>
        <Link to="/">Home</Link> | <Link to="/login">Login</Link> | <Link to="/dashboard">Dashboard</Link> | <Link to="/signup">Sign Up</Link>
      </nav>

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} /> {/* Add the route for SignUp */}
        {/* Protected Route for Dashboard */}
        <Route
          path="/dashboard"
          element={<PrivateRoute user={user} element={<Dashboard />} />}
        />
      </Routes>
    </div>
  );
}

export default App;
