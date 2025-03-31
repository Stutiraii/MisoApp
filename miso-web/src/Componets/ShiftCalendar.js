import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { collection, getDocs, updateDoc, deleteDoc, doc, addDoc } from "firebase/firestore";
import { useFirebase } from "./Context/firebaseContext";
import AdminSchedule from "./AdminSchedule"; // Import the table view

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
        console.log("Shift Data:", data); // Debugging log

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
    title: `${shift.username} - ${shift.role}`, // Uses correct username
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

  // Handle adding new shifts from the calendar
  const handleDateSelect = async (selectInfo) => {
    const username = prompt("Enter staff name:");
    const role = prompt("Enter role:");
    const shiftStart = selectInfo.startStr.split("T")[1]?.slice(0, 5);
    const shiftEnd = selectInfo.endStr.split("T")[1]?.slice(0, 5);

    if (username && role) {
      try {
        await addDoc(collection(db, "shifts"), {
          username,
          role,
          date: selectInfo.startStr.split("T")[0],
          shiftStart,
          shiftEnd,
          userId: "manual_entry", // If you have a proper userId system, replace this
        });
        fetchShifts();
      } catch (error) {
        console.error("Error adding shift:", error);
      }
    }
  };

  return (
    <div>
      <h2>Manage Staff Schedule</h2>

      {/* Admin Schedule Table */}
      <AdminSchedule shifts={shifts} fetchShifts={fetchShifts} />

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
        height="auto" // Auto height to fit container
        contentHeight={500} // Adjust event container height
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
