import React, { useState } from "react";
import { useFirebase } from "./firebaseContext"; // Import the useFirebase hook
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import "./styles/App.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSignUp, setIsSignUp] = useState(false); // Track whether user is signing up or logging in
  const { auth } = useFirebase(); // Access auth from FirebaseContext

  const handleAuth = async () => {
    try {
      if (isSignUp) {
        // Sign Up logic
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Send email verification
        await sendEmailVerification(user)
          .then(() => {
            alert("Sign Up successful! Please verify your email.");
          })
          .catch((err) => {
            setError("Error sending verification email: " + err.message);
          });
      } else {
        // Login logic
        await signInWithEmailAndPassword(auth, email, password)
          .then(() => {
            if (!auth.currentUser.emailVerified) {
              setError("Please verify your email before logging in.");
            } else {
              alert("Login successful!");
            }
          })
          .catch((err) => {
            setError("Login failed: " + err.message);
          });
      }
    } catch (err) {
      setError("Error: " + err.message);
    }
  };

  return (
    <div className="Container">
    <div className="auth-container">
      <h1 className="auth-heading">{isSignUp ? "Sign Up" : "Login"} Page</h1>
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
        <button className="auth-button" onClick={handleAuth} disabled={!email || !password}>
          {isSignUp ? "Sign Up" : "Login"}
        </button>
      </div>
      <p className="toggle-text" onClick={() => setIsSignUp(!isSignUp)}>
        {isSignUp ? "Already have an account? Login" : "Don't have an account? Sign Up"}
      </p>
    </div>
    </div>
  );
}
export default Login;
