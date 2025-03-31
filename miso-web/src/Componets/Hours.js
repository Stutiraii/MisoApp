import React, { useState, useEffect } from "react";
import { useFirebase } from "./Context/firebaseContext";
import { collection, addDoc, updateDoc, doc, query, where, getDocs } from "firebase/firestore";
import { Button, Typography, Paper, Card, CardContent, Box, CircularProgress } from "@mui/material";
import { useTheme } from "@mui/material/styles";

function Hours() {
  const { db, currentUser } = useFirebase();
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [activeDocId, setActiveDocId] = useState(null);
  const [error, setError] = useState(null);
  const [time, setTime] = useState(new Date());
  const [loading, setLoading] = useState(false); // Added loading state
  const theme = useTheme();

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleClockIn = async () => {
    setError(null);
    setLoading(true); // Start loading
    if (!currentUser || !currentUser.uid) {
      setError("You must be logged in to clock in.");
      setLoading(false); // Stop loading
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
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const handleClockOut = async () => {
    setError(null);
    setLoading(true); // Start loading
    if (!currentUser || !currentUser.uid) {
      setError("You must be logged in to clock out.");
      setLoading(false); // Stop loading
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
          setLoading(false); // Stop loading
          return;
        }
      } catch (err) {
        setError("Error finding active clock-in.");
        setLoading(false); // Stop loading
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
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <Card elevation={6} sx={{ maxWidth: 400, margin: "0 auto", backgroundColor: theme.palette.background.paper }}>
      <CardContent>
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          {/* Time Display */}
          <Typography variant="h3" sx={{ marginBottom: 2 }}>
            {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </Typography>

          {/* Error Message */}
          {error && (
            <Typography color="error" sx={{ marginBottom: 2 }}>
              {error}
            </Typography>
          )}

          {/* Loading Indicator */}
          {loading ? (
            <CircularProgress />
          ) : (
            <Button
              variant="contained"
              color={isClockedIn ? "secondary" : "primary"}
              sx={{ width: "100%", padding: "12px", fontSize: "16px", marginTop: 2 }}
              onClick={isClockedIn ? handleClockOut : handleClockIn}
            >
              {isClockedIn ? "Clock Out" : "Clock In"}
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

export default Hours;
