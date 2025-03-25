import React, { useState } from "react";
import { useFirebase } from "./firebaseContext"; // Import the useFirebase hook
import { signInWithEmailAndPassword } from "firebase/auth";
import "../styles/App.css";
import { useNavigate } from "react-router-dom"; // Import useNavigate for routing

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { auth } = useFirebase(); // Access auth from FirebaseContext
  const navigate = useNavigate(); // Use useNavigate for navigation

  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    try {
      // Login logic
      await signInWithEmailAndPassword(auth, email, password)
        .then(() => {
          if (!auth.currentUser.emailVerified) {
            setError("Please verify your email before logging in.");
          } else {
            alert("Login successful!");
            redirectToDashboard(); // Redirect to the dashboard
          }
        })
        .catch((err) => {
          setError("Login failed: " + err.message);
        });
    } catch (err) {
      setError("Error: " + err.message);
    }
  };

  const redirectToDashboard = () => {
    navigate("/Dashboard"); // Redirect to the dashboard
  };

  const redirectToSignUp = () => {
    navigate("/SignUp"); // Redirect to the sign-up page
  };

  return (
    <div className="Container">
      <div className="auth-container">
        <h1 className="auth-heading">Login Page</h1>
        {error && <p className="error-message">{error}</p>}
        <div className="auth-form">
          <input
            className="auth-input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="auth-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            className="auth-button"
            onClick={handleLogin}
            disabled={!email || !password}
          >
            Login
          </button>
        </div>
        <p className="toggle-text" onClick={redirectToSignUp}>
          Don't have an account? Sign Up
        </p>
      </div>
    </div>
  );
}

export default Login;
