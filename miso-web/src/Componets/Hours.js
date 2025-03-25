import React, { useState } from "react";
import { useFirebase } from "./firebaseContext";
import { collection, addDoc, updateDoc, doc, query, where, getDocs } from "firebase/firestore";

function Hours() {
  const { db, currentUser } = useFirebase();
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [activeDocId, setActiveDocId] = useState(null);
  const [error, setError] = useState(null);

  const handleClockIn = async () => {
    setError(null);
    if (!currentUser || !currentUser.uid) {
      setError("You must be logged in to clock in.");
      console.error("Error: currentUser is undefined or has no UID.");
      return;
    }

    try {
      const now = new Date().toISOString();
      const docRef = await addDoc(collection(db, "attendance"), {
        userId: currentUser.uid,
        startTime: now,
        status: "Pending",
      });

      console.log("Clock-in recorded with ID:", docRef.id);
      setActiveDocId(docRef.id);
      setIsClockedIn(true);
    } catch (err) {
      console.error("Error clocking in:", err);
      setError("Error clocking in. Please try again.");
    }
  };

  const handleClockOut = async () => {
    setError(null);
    if (!currentUser || !currentUser.uid) {
      setError("You must be logged in to clock out.");
      console.error("Error: currentUser is undefined or has no UID.");
      return;
    }

    if (!activeDocId) {
      // Find the latest clock-in record if the page was refreshed
      try {
        const q = query(collection(db, "attendance"), where("userId", "==", currentUser.uid), where("status", "==", "Pending"));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const latestDoc = querySnapshot.docs[0]; // Get the latest document
          setActiveDocId(latestDoc.id);
        } else {
          setError("No active clock-in found. Please clock in first.");
          return;
        }
      } catch (err) {
        console.error("Error finding active clock-in:", err);
        return;
      }
    }

    try {
      const now = new Date().toISOString();
      const docRef = doc(db, "attendance", activeDocId);
      await updateDoc(docRef, {
        endTime: now,
        status: "Completed",
      });

      console.log("Clock-out recorded for ID:", activeDocId);
      setIsClockedIn(false);
      setActiveDocId(null);
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
 