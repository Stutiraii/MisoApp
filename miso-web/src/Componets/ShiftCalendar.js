import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { collection, getDocs, updateDoc, deleteDoc, doc, addDoc } from "firebase/firestore";
import { useFirebase } from "./Context/firebaseContext";
import AdminSchedule from "./AdminSchedule"; // Import the table view
import { styled } from "@mui/material/styles";
import { Typography, Stack, Card } from "@mui/material";
function ShiftCalendar() {
  const { db } = useFirebase();
  const [shifts, setShifts] = useState([]);

  useEffect(() => {
    fetchShifts();
  }, []);

  // Assign colors based on role
  const getShiftColor = (role) => {
    const roleColors = {
      Manager: "#ff5733",
      Barista: "#33b5e5",
      Chef: "#f4c542",
      Waiter: "#4CAF50",
    };
    return roleColors[role] || "#888"; // Default gray
  };

  // Fetch shifts from Firestore
  const fetchShifts = async () => {
    try {
      const shiftsRef = collection(db, "shifts");
      const snapshot = await getDocs(shiftsRef);
      const shiftEvents = snapshot.docs.map((doc) => {
        const data = doc.data();

        return {
          id: doc.id,
          username: data.username || "Unknown",
          role: data.role || "Unassigned",
          date: data.date,
          shiftStart: data.shiftStart,
          shiftEnd: data.shiftEnd,
          userId: data.userId || "N/A",
          color: getShiftColor(data.role),
        };
      });

      setShifts(shiftEvents);
    } catch (error) {
      console.error("Error fetching shifts:", error);
    }
  };

  // Convert shift data for FullCalendar
  const calendarEvents = shifts.map((shift) => ({
    id: shift.id,
    title: `${shift.username} - ${shift.role}`, 
    start: `${shift.date}T${shift.shiftStart}`,
    end: `${shift.date}T${shift.shiftEnd}`,
    color: shift.color,
  }));

  // Handle event edit (drag and drop)
  const handleEventChange = async (changeInfo) => {
    const { id, start, end } = changeInfo.event;
    try {
      await updateDoc(doc(db, "shifts", id), {
        shiftStart: start.toISOString().split("T")[1].slice(0, 5),
        shiftEnd: end.toISOString().split("T")[1].slice(0, 5),
      });
      fetchShifts();
    } catch (error) {
      console.error("Error updating shift:", error);
    }
  };

  // Handle event deletion
  const handleEventDelete = async (clickInfo) => {
    if (window.confirm(`Delete shift for ${clickInfo.event.title}?`)) {
      try {
        await deleteDoc(doc(db, "shifts", clickInfo.event.id));
        fetchShifts();
      } catch (error) {
        console.error("Error deleting shift:", error);
      }
    }
  };

  const handleDateSelect = async (selectInfo) => {
    const username = window.prompt("Enter staff name:");
    const role = window.prompt("Enter role:");
    const shiftStart = selectInfo.startStr.split("T")[1]?.slice(0, 5);
    const shiftEnd = selectInfo.endStr.split("T")[1]?.slice(0, 5);
  
    if (username && role) {
      try {
        // Add new shift to Firestore
        await addDoc(collection(db, "shifts"), {
          username,
          role,
          date: selectInfo.startStr.split("T")[0],
          shiftStart,
          shiftEnd,
          userId: "manual_entry", // Adjust this if you have actual user IDs
        });
  
        // Refresh shifts list
        fetchShifts();
      } catch (error) {
        console.error("Error adding shift:", error);
        alert("There was an error adding the shift.");
      }
    } else {
      alert("Please enter both username and role.");
    }
  };
  
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
    <div>
          <Typography component="h1" variant="h4" sx={{ fontSize: "clamp(2rem, 10vw, 2.15rem)" }}>
          Schedule
          </Typography>
      {/* Calendar View */}
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={calendarEvents}
        editable={true}
        selectable={true}
        eventClick={handleEventDelete}
        eventChange={handleEventChange}
        select={handleDateSelect}
        height="auto" 
        contentHeight={500}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
      />
     
    </div>
  );
}

export default ShiftCalendar;
