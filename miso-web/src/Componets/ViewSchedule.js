import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import { collection, getDocs } from "firebase/firestore";
import { useFirebase } from "./Context/firebaseContext";
import { Box, Typography, Stack, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";

function ViewSchedule() {
  const { db, currentUser } = useFirebase();
  const [shifts, setShifts] = useState([]);
  const theme = useTheme();

  useEffect(() => {
    if (currentUser?.uid) {
      fetchShifts();
    }
  }, [currentUser]);

  const getShiftColor = (role) => {
    const roleColors = {
      Manager: "#ff5733",
      Barista: "#33b5e5",
      Chef: "#f4c542",
      Waiter: "#4CAF50",
    };
    return roleColors[role] || "#888";
  };

  const fetchShifts = async () => {
    try {
      const shiftsRef = collection(db, "shifts");
      const snapshot = await getDocs(shiftsRef);
      const shiftEvents = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((shift) => shift.userId && shift.userId === currentUser.uid);
      setShifts(shiftEvents);
    } catch (error) {
      console.error("Error fetching shifts:", error);
    }
  };

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
    padding: theme.spacing(4),
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
    maxWidth: "900px",
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
  }));

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <ScheduleContainer direction="column" justifyContent="center" alignItems="center">
        <CardContainer variant="outlined">
          <Typography component="h1" variant="h4" sx={{ fontSize: "clamp(2rem, 10vw, 2.15rem)" }}>
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
            <TableContainer component={Paper}>
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
                  {shifts.map((shift) => (
                    <TableRow key={shift.id}>
                      <TableCell>{shift.date}</TableCell>
                      <TableCell>{shift.role}</TableCell>
                      <TableCell>{shift.shiftStart}</TableCell>
                      <TableCell>{shift.shiftEnd}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </CardContainer>
      </ScheduleContainer>
    </Box>
  );
}

export default ViewSchedule;
