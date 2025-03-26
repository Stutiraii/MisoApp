import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import { collection, getDocs } from "firebase/firestore";
import { useFirebase } from "./firebaseContext";

function ViewSchedule() {
  const { db, currentUser } = useFirebase();  // Destructure currentUser from context
  const [shifts, setShifts] = useState([]);

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
        .filter((shift) => shift.userId === currentUser.uid);  // Use currentUser.uid

      setShifts(shiftEvents);
    } catch (error) {
      console.error("Error fetching shifts:", error);
    }
  };

  // Convert shift data for FullCalendar
  const calendarEvents = shifts.map((shift) => ({
    id: shift.id,
    title: `${shift.role} (${shift.shiftStart} - ${shift.shiftEnd})`, // Shows role and time
    start: `${shift.date}T${shift.shiftStart}`,
    end: `${shift.date}T${shift.shiftEnd}`,
    color: getShiftColor(shift.role),
  }));

  return (
    <div>

      
      <h2>Your Schedule</h2>

      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        events={calendarEvents}
        height="auto"
        contentHeight={400}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth",
        }}
      />
  <table border="1"cellPadding="10" cellSpacing="0">
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

    </div>

    
  );
}

export default ViewSchedule;
