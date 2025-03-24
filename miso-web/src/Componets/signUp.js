import React, { useState } from "react";
import { useFirebase } from "./firebaseContext"; // Import the useFirebase hook
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore"; 
import "../styles/App.css";


function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [error, setError] = useState("");
  const { auth, db } = useFirebase(); // Access auth from Firebase context

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      // Create new user for sign-up
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

       // Add user to Firestore
       await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        name: `${fname} ${lname}`,
        uid: user.uid,
        role: "staff",
        createdAt: new Date(),
      });

      // Send email verification
      await sendEmailVerification(user);

      // Success message (you can use toast or alert)
      alert("Sign Up successful! Please check your email for verification.");

      // Clear the input fields
      setEmail("");
      setPassword("");
      setFname("");
      setLname("");
    } catch (error) {
      setError(error.message); // Display any error messages
    }
  };

  return (
    <form onSubmit={handleSignUp}>
      <div className="Container">
        <div className="auth-container">
          <h1 className="auth-heading">Sign Up Page</h1>
          {error && <p className="error-message">{error}</p>}
          
          <div className="mb-3">
            <label>First name</label>
            <input
              type="text"
              className="auth-input"
              placeholder="First name"
              value={fname}
              onChange={(e) => setFname(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label>Last name</label>
            <input
              type="text"
              className="auth-input"
              placeholder="Last name"
              value={lname}
              onChange={(e) => setLname(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label>Email address</label>
            <input
              type="email"
              className="auth-input"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label>Password</label>
            <input
              type="password"
              className="auth-input"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="d-grid">
            <button type="submit" className="auth-button" disabled={!email || !password}>
              Sign Up
            </button>
          </div>

          <p className="toggle-text" onClick={() => window.location.href = '/login'}>
            Already have an account? Login
          </p>
        </div>
      </div>
    </form>
  );
}

export default SignUp;
