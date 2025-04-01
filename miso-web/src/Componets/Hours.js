import React, { useState, useEffect } from "react";
import { useFirebase } from "./Context/firebaseContext";
import { collection, addDoc, updateDoc, doc, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { Button, Typography, Card, CardContent, Box, CircularProgress } from "@mui/material";
import { useTheme } from "@mui/material/styles";

function Hours() {
  const { db, currentUser } = useFirebase();
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [activeDocId, setActiveDocId] = useState(null);
  const [error, setError] = useState(null);
  const [time, setTime] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [totalHours, setTotalHours] = useState(null); // New state for total hours worked
  const theme = useTheme();

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch active attendance record on mount
  useEffect(() => {
    if (!currentUser) return;
    const fetchActiveClockIn = async () => {
      try {
        const q = query(
          collection(db, "attendance"),
          where("userId", "==", currentUser.uid),
          where("status", "==", "Pending"),
          orderBy("startTime", "desc"),
          limit(1)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const latestDoc = querySnapshot.docs[0];
          setActiveDocId(latestDoc.id);
          setIsClockedIn(true);
        }
      } catch (err) {
        console.error("Error fetching clock-in status:", err);
        setError("Error checking clock-in status.");
      }
    };
    fetchActiveClockIn();
  }, [currentUser]);

  // Handle Clock-In
  const handleClockIn = async () => {
    setError(null);
    setLoading(true);
    setTotalHours(null); // Reset total hours on new shift
    if (!currentUser || !currentUser.uid) {
      setError("You must be logged in to clock in.");
      setLoading(false);
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
      setLoading(false);
    }
  };

  // Handle Clock-Out
  const handleClockOut = async () => {
    setError(null);
    setLoading(true);
    if (!currentUser || !currentUser.uid) {
      setError("You must be logged in to clock out.");
      setLoading(false);
      return;
    }
    if (!activeDocId) {
      setError("No active clock-in found. Please refresh or clock in first.");
      setLoading(false);
      return;
    }
    try {
      const now = new Date().toISOString();
      const docRef = doc(db, "attendance", activeDocId);

      // Fetch the start time from Firebase
      const q = query(collection(db, "attendance"), where("userId", "==", currentUser.uid), where("status", "==", "Pending"));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError("No active clock-in found.");
        setLoading(false);
        return;
      }

      const latestDoc = querySnapshot.docs[0];
      const startTime = new Date(latestDoc.data().startTime);
      const endTime = new Date(now);

      // Calculate the total hours worked
      const hoursWorked = ((endTime - startTime) / (1000 * 60 * 60)).toFixed(2); // Convert milliseconds to hours

      // Update Firebase with endTime and totalHours
      await updateDoc(docRef, {
        endTime: now,
        status: "Completed",
        totalHours: hoursWorked, // Store total hours worked
      });

      setIsClockedIn(false);
      setActiveDocId(null);
      setTotalHours(hoursWorked); // Store in state for UI display
    } catch (err) {
      setError("Error clocking out. Please try again.");
    } finally {
      setLoading(false);
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

          {/* Display Total Hours Worked */}
          {totalHours !== null && (
            <Typography variant="h6" sx={{ marginTop: 2, color: "green" }}>
              Shift Duration: {totalHours} hours
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

export default Hours;
