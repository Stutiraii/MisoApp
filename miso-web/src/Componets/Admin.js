import React, { useState, useEffect } from "react";
import { useFirebase } from "./firebaseContext";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import "../styles/App.css";

function Admin() {
  const { db } = useFirebase();
  const auth = getAuth();

  // State Variables
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [shifts, setShifts] = useState([]);

  const [date, setDate] = useState("");
  const [shiftStart, setShiftStart] = useState("");
  const [shiftEnd, setShiftEnd] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [newRole, setNewRole] = useState("");
  const [error, setError] = useState("");

  // Fetch Users
  useEffect(() => {
    const fetchUsers = async () => {
      const usersRef = collection(db, "users");
      const snapshot = await getDocs(usersRef);
      setUsers(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };

    // Listen for real-time role updates
    const rolesRef = collection(db, "roles");
    const unsubscribeRoles = onSnapshot(rolesRef, (snapshot) => {
      setRoles(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    const fetchShifts = async () => {
      const shiftsRef = collection(db, "shifts");
      const snapshot = await getDocs(shiftsRef);
      setShifts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };

    fetchUsers();
    fetchShifts();
    return () => unsubscribeRoles(); // Cleanup listener
  }, [db]);

  // Handle Adding New Role
  const handleAddRole = async () => {
    if (!newRole.trim()) {
      setError("Role name cannot be empty.");
      return;
    }

    try {
      await addDoc(collection(db, "roles"), { name: newRole });
      setNewRole(""); // Clear input field
      setError("");
    } catch (error) {
      setError("Error adding role: " + error.message);
    }
  };

  // Handle Assigning Shift
  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!date || !shiftStart || !shiftEnd || !selectedRole || !selectedUser) {
      setError("Please fill all fields");
      return;
    }

    const userDetails = users.find((user) => user.id === selectedUser);
    if (!userDetails) {
      setError("Invalid user selection");
      return;
    }

    try {
      await addDoc(collection(db, "shifts"), {
        date,
        shiftStart,
        shiftEnd,
        role: selectedRole,
        userId: userDetails.id,
        username: userDetails.name,
      });

      // Update shift state immediately
      setShifts([...shifts, {
        date,
        shiftStart,
        shiftEnd,
        role: selectedRole,
        userId: userDetails.id,
        username: userDetails.name,
      }]);

      setError("");
      setDate("");
      setShiftStart("");
      setShiftEnd("");
      setSelectedRole("");
      setSelectedUser("");
    } catch (error) {
      setError("Error adding shift: " + error.message);
    }
  };

  // Generate time options (24-hour format, 30-min intervals)
  const timeOptions = [];
  for (let i = 0; i < 24; i++) {
    for (let j = 0; j < 60; j += 30) {
      let hour = i.toString().padStart(2, "0");
      let minute = j.toString().padStart(2, "0");
      timeOptions.push(`${hour}:${minute}`);
    }
  }

  return (
    <div>
      <h2>Assign Staff Schedule</h2>
      {error && <p className="error">{error}</p>}

      {/* Role Management */}
      <div>
        <h3>Add New Role</h3>
        <input
          type="text"
          value={newRole}
          onChange={(e) => setNewRole(e.target.value)}
          placeholder="Enter role name"
        />
        <button onClick={handleAddRole}>Add Role</button>
      </div>

      {/* Assign Schedule Form */}
      <form onSubmit={handleScheduleSubmit}>
        <label>Staff:</label>
        <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
          <option value="">Select a staff</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name} ({user.id})
            </option>
          ))}
        </select>

        <label>Date:</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />

        <label>Shift Start:</label>
        <select value={shiftStart} onChange={(e) => setShiftStart(e.target.value)}>
          <option value="">Select Start Time</option>
          {timeOptions.map((time) => (
            <option key={time} value={time}>
              {time}
            </option>
          ))}
        </select>

        <label>Shift End:</label>
        <select value={shiftEnd} onChange={(e) => setShiftEnd(e.target.value)}>
          <option value="">Select End Time</option>
          {timeOptions.map((time) => (
            <option key={time} value={time}>
              {time}
            </option>
          ))}
        </select>

        <label>Role:</label>
        <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
          <option value="">Select Role</option>
          {roles.map((role) => (
            <option key={role.id} value={role.name}>
              {role.name}
            </option>
          ))}
        </select>

        <button type="submit">Assign Schedule</button>
      </form>

      {/* Display Assigned Schedules */}
      <h3>Assigned Schedules</h3>
      <table>
        <thead>
          <tr>
            <th>Staff</th>
            <th>Date</th>
            <th>Shift Start</th>
            <th>Shift End</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {shifts.map((shift) => (
            <tr key={shift.id}>
              <td>{shift.username}</td>
              <td>{shift.date}</td>
              <td>{shift.shiftStart}</td>
              <td>{shift.shiftEnd}</td>
              <td>{shift.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Admin;
