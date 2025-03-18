import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import Login from "./Login";
import "./styles/App.css";
import PrivateRoute from "./PrivateRoute";
import Dashboard from "./Dashboard";

function App() {
  return (
    <div>
      <nav>
        <Link to="/">Home</Link> | <Link to="/login">Login</Link>
      </nav>
      
      <Routes>
        <Route path="/" element={< Dashboard />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </div>
  );
}

export default App;
