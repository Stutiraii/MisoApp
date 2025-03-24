import React, { useState } from "react";
import { useFirebase } from "./firebaseContext";
import { collection, addDoc } from "firebase/firestore";

function Hours() {
  const { db, currentUser } = useFirebase();
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [error, setError] = useState(null);

  const handleClockIn = async () => {
    if (!currentUser) {
      setError("You must be logged in to clock in.");
      return;
    }
    try {
      const now = new Date().toISOString(); // Fixed method name
      setStartTime(now);
      await addDoc(collection(db, "attendance"), {
        userId: currentUser.uid,
        name: currentUser.name,
        startTime: now,
        status: "Pending",
      });
      setIsClockedIn(true); // Update clock-in state
    } catch (err) {
      console.error("Error clocking in:", err);
      setError("Error clocking in. Please try again.");
    }
  };

  const handleClockOut = async () => {
    if (!currentUser) {
      setError("You must be logged in to clock out.");
      return;
    }
    try {
      const now = new Date().toISOString(); // Fixed method name
      setEndTime(now);
      await addDoc(collection(db, "attendance"), {
        userId: currentUser.uid,
        endTime: now,
        status: "Completed",
      });
      setIsClockedIn(false); // Update clock-in state
    } catch (err) {
      console.error("Error clocking out:", err);
      setError("Error clocking out. Please try again.");
    }
  };

  return (
    <div>
      <h2>Clock In/Out</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {isClockedIn ? (
        <button onClick={handleClockOut}>Clock Out</button>
      ) : (
        <button onClick={handleClockIn}>Clock In</button>
      )}
    </div>
  );
}

export default Hours;
