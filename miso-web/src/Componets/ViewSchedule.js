import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import { collection, getDocs } from "firebase/firestore";
import { useFirebase } from "./firebaseContext";
import { Box, Button, Typography, Stack, Card, FormControl, FormLabel } from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";

function ViewSchedule() {
  const { db, currentUser } = useFirebase();
  const [shifts, setShifts] = useState([]);
  const theme = useTheme();

  useEffect(() => {
    if (currentUser) {
      fetchShifts();
    }
  }, [currentUser]);

  // Function to assign colors based on role
  const getShiftColor = (role) => {
    const roleColors = {
      Manager: "#ff5733",
      Barista: "#33b5e5",
      Chef: "#f4c542",
      Waiter: "#4CAF50",
    };
    return roleColors[role] || "#888"; // Default gray
  };

  // Fetch shifts for the logged-in staff only
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

  // Convert shift data for FullCalendar
  const calendarEvents = shifts.map((shift) => ({
    id: shift.id,
    title: `${shift.role} (${shift.shiftStart} - ${shift.shiftEnd})`,
    start: `${shift.date}T${shift.shiftStart}`,
    end: `${shift.date}T${shift.shiftEnd}`,
    color: getShiftColor(shift.role),
  }));

  const ScheduleContainer = styled(Stack)(({ theme }) => ({
    height: "100vh",
    minHeight: "100%",
    padding: theme.spacing(2),
    [theme.breakpoints.up("sm")]: {
      padding: theme.spacing(4),
    },
    background:
      theme.palette.mode === "dark"
        ? "radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))"
        : "radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))",
  }));

  const CardContainer = styled(Card)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    alignSelf: "center",
    width: "100%",
    padding: theme.spacing(4),
    gap: theme.spacing(2),
    margin: "auto",
    [theme.breakpoints.up("sm")]: {
      maxWidth: "900px",
    },
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
  }));

  return (
    <ScheduleContainer direction="column" justifyContent="center" alignItems="center">
      <CardContainer variant="outlined">
        <Typography component="h1" variant="h4" sx={{ width: "100%", fontSize: "clamp(2rem, 10vw, 2.15rem)" }}>
          Your Schedule
        </Typography>

        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin]}
          initialView="dayGridMonth"
          events={calendarEvents}
          height="auto"
          contentHeight={400}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek",
          }}
        />

        <Box sx={{ marginTop: theme.spacing(4) }}>
          <Typography variant="h6" sx={{ marginBottom: theme.spacing(2) }}>
            Your Upcoming Shifts
          </Typography>
          <table border="1" cellPadding="10" cellSpacing="0" style={{ width: "100%" }}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Role</th>
                <th>Start Time</th>
                <th>End Time</th>
              </tr>
            </thead>
            <tbody>
              {shifts.map((shift) => (
                <tr key={shift.id}>
                  <td>{shift.date}</td>
                  <td>{shift.role}</td>
                  <td>{shift.shiftStart}</td>
                  <td>{shift.shiftEnd}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      </CardContainer>
    </ScheduleContainer>
  );
}

export default ViewSchedule;
