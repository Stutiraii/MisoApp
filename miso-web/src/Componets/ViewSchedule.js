import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { useFirebase } from "./Context/firebaseContext";
import {
  Box,
  Typography,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
} from "@mui/material";
import { format, startOfWeek, endOfWeek, parseISO, isAfter } from "date-fns";

function ViewSchedule() {
  const { db, currentUser } = useFirebase();
  const [shifts, setShifts] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [activeDocId, setActiveDocId] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [totalHours, setTotalHours] = useState(null);
  const [weeklyHours, setWeeklyHours] = useState(0);
  

  useEffect(() => {
    if (currentUser?.uid) {
      fetchShifts();
      fetchAttendance();
      fetchActiveClockIn();
    }
  }, [currentUser]);

  const fetchShifts = async () => {
    try {
      const shiftsRef = collection(db, "shifts");
      const snapshot = await getDocs(shiftsRef);
      const shiftEvents = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((shift) => shift.userId === currentUser.uid);
      setShifts(shiftEvents);
    } catch (error) {
      console.error("Error fetching shifts:", error);
    }
  };

  const fetchAttendance = async () => {
    try {
      const attendanceRef = collection(db, "attendance");
      const snapshot = await getDocs(attendanceRef);
      const records = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter(
          (record) =>
            record.userId === currentUser.uid && record.status === "Completed"
        );
      setAttendance(records);
      calculateWeeklyHours(records);
    } catch (error) {
      console.error("Error fetching attendance records:", error);
    }
  };

  const calculateWeeklyHours = (records) => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

    const weeklyTotal = records
      .filter((record) => {
        if (!record.startTime) return false;
        const recordDate = parseISO(record.startTime);
        return recordDate >= weekStart && recordDate <= weekEnd;
      })
      .reduce((sum, record) => sum + parseFloat(record.totalHours || 0), 0);

    setWeeklyHours(weeklyTotal.toFixed(2));
  };

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
    }
  };

  // Handle Clock-In
  const handleClockIn = async () => {
    setError(null);
    setLoading(true);
    setTotalHours(null);
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
      const q = query(
        collection(db, "attendance"),
        where("userId", "==", currentUser.uid),
        where("status", "==", "Pending")
      );
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
        totalHours: hoursWorked, 
      });

      setIsClockedIn(false);
      setActiveDocId(null);
      setTotalHours(hoursWorked);
    } catch (err) {
      setError("Error clocking out. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to handle both ISO strings and Firestore Timestamp
  const convertToDate = (value) => {
    if (!value) return null;
    if (typeof value === "string") return parseISO(value);
    if (value.toDate) return value.toDate(); 
    return null;
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh",  backgroundColor: (theme) => theme.palette.background.default, }}>
      <Typography variant="h4">Your Schedule</Typography>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin]}
        initialView="dayGridMonth"
        events={shifts.map((shift) => ({
          id: shift.id,
          title: `${shift.role} (${shift.shiftStart} - ${shift.shiftEnd})`,
          start: `${shift.date}T${shift.shiftStart}`,
          end: `${shift.date}T${shift.shiftEnd}`,
        }))}
        height="auto"
        contentHeight={400}
      />

      <Card sx={{ padding: 2, marginY: 2 }}>
        <Typography variant="h6">
          Weekly Hours Worked: {weeklyHours} hrs
        </Typography>
      </Card>

      <Button
        variant="contained"
        color={isClockedIn ? "secondary" : "primary"}
        sx={{ width: "100%", padding: "12px", fontSize: "16px", marginTop: 2 }}
        onClick={isClockedIn ? handleClockOut : handleClockIn}
      >
        {isClockedIn ? "Clock Out" : "Clock In"}
      </Button>

      {/* Upcoming Shifts Table */}
      <Typography variant="h6" sx={{ marginTop: 2 }}>
        Upcoming Shifts
      </Typography>
      <TableContainer component={Paper} sx={{ marginBottom: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Start Time</TableCell>
              <TableCell>End Time</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {shifts
              .filter((shift) => isAfter(parseISO(shift.date), new Date()))
              .map((shift) => (
                <TableRow key={shift.id}>
                  <TableCell>
                    {format(parseISO(shift.date), "yyyy-MM-dd")}
                  </TableCell>
                  <TableCell>{shift.role}</TableCell>
                  <TableCell>{shift.shiftStart}</TableCell>
                  <TableCell>{shift.shiftEnd}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Attendance Records Table */}
      <Typography variant="h6">Past Attendance</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Start Time</TableCell>
              <TableCell>End Time</TableCell>
              <TableCell>Total Hours</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {attendance.map((record) => {
              let startTime, endTime;

              // Use the helper function to safely handle both ISO strings and Firestore Timestamps
              startTime = convertToDate(record.startTime);
              endTime = convertToDate(record.endTime);

              return (
                <TableRow key={record.id}>
                  <TableCell>
                    {startTime ? format(startTime, "yyyy-MM-dd") : "-"}
                  </TableCell>
                  <TableCell>
                    {startTime ? format(startTime, "HH:mm") : "-"}
                  </TableCell>
                  <TableCell>
                    {endTime ? format(endTime, "HH:mm") : "-"}
                  </TableCell>
                  <TableCell>{record.totalHours} hrs</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default ViewSchedule;
