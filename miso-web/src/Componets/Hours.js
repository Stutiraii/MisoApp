import React, { useState, useEffect } from "react";
import { useFirebase } from "./Context/firebaseContext";
import { collection, addDoc, updateDoc, doc, query, where, getDocs } from "firebase/firestore";
import { Button, Typography, Paper } from "@mui/material";
import { useTheme } from "@mui/material/styles";

function Hours() {
  const { db, currentUser } = useFirebase();
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [activeDocId, setActiveDocId] = useState(null);
  const [error, setError] = useState(null);
  const [time, setTime] = useState(new Date());
  const theme = useTheme();

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleClockIn = async () => {
    setError(null);
    if (!currentUser || !currentUser.uid) {
      setError("You must be logged in to clock in.");
      return;
    }
    try {
      const now = new Date().toISOString();
      const docRef = await addDoc(collection(db, "attendance"), {
        userId: currentUser.uid,
        startTime: now,
        status: "Pending",
      });
      setActiveDocId(docRef.id);
      setIsClockedIn(true);
    } catch (err) {
      setError("Error clocking in. Please try again.");
    }
  };

  const handleClockOut = async () => {
    setError(null);
    if (!currentUser || !currentUser.uid) {
      setError("You must be logged in to clock out.");
      return;
    }
    if (!activeDocId) {
      try {
        const q = query(
          collection(db, "attendance"),
          where("userId", "==", currentUser.uid),
          where("status", "==", "Pending")
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const latestDoc = querySnapshot.docs[0];
          setActiveDocId(latestDoc.id);
        } else {
          setError("No active clock-in found. Please clock in first.");
          return;
        }
      } catch (err) {
        setError("Error finding active clock-in.");
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
      setIsClockedIn(false);
      setActiveDocId(null);
    } catch (err) {
      setError("Error clocking out. Please try again.");
    }
  };

  return (
    <Paper elevation={3} style={{ padding: "20px", textAlign: "center", backgroundColor: theme.palette.background.default }}>
      <Typography variant="h4" gutterBottom>
        {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
      </Typography>
      {error && <Typography color="error">{error}</Typography>}
      {isClockedIn ? (
        <Button variant="contained" color="secondary" onClick={handleClockOut}>
          Clock Out
        </Button>
      ) : (
        <Button variant="contained" color="primary" onClick={handleClockIn}>
          Clock In
        </Button>
      )}
    </Paper>
  );
}

export default Hours;
