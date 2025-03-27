import React, { useState, useEffect, useContext } from "react";
import { useFirebase } from "./firebaseContext";
import {
  collection,
  addDoc,
  getDocs,
  onSnapshot,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import {
  TextField,
  Button,
  Typography,
  Box,
  FormControl,
  FormLabel,
} from "@mui/material";
import MuiCard from "@mui/material/Card";
import { styled, useTheme } from "@mui/material/styles";
import Stack from "@mui/material/Stack";
import ColorModeContext from "../customizations/ColorModeContext";

function AdminSchedule() {
  const { db } = useFirebase();
  const auth = getAuth();
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);

  // State variables
  const [schedule, setSchedule] = useState("");
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

  // Fetch Users, Roles, and Shifts
  useEffect(() => {
    const fetchUsers = async () => {
      const usersRef = collection(db, "users");
      const snapshot = await getDocs(usersRef);
      setUsers(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };

    const unsubscribeRoles = onSnapshot(collection(db, "roles"), (snapshot) => {
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

  // Handle adding new role
  const handleAddRole = async () => {
    if (!newRole.trim()) {
      setError("Role name cannot be empty.");
      return;
    }

    try {
      await addDoc(collection(db, "roles"), { name: newRole });
      setNewRole("");
      setError("");
    } catch (error) {
      setError("Error adding role: " + error.message);
    }
  };

  // Handle scheduling shifts
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

      setShifts([
        ...shifts,
        {
          date,
          shiftStart,
          shiftEnd,
          role: selectedRole,
          userId: userDetails.id,
          username: userDetails.name,
        },
      ]);

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

  // Styled components for MUI
  const Card = styled(MuiCard)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    alignSelf: "center",
    width: "100%",
    padding: theme.spacing(4),
    gap: theme.spacing(2),
    margin: "auto",
    [theme.breakpoints.up("sm")]: {
      maxWidth: "450px",
    },
    boxShadow:
      theme.palette.mode === "dark"
        ? "hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px"
        : "hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px",
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
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

  return (
    <ScheduleContainer direction="column" justifyContent="center" alignItems="center">
      <Button onClick={colorMode.toggleColorMode} sx={{ position: "fixed", top: "1rem", left: "1rem" }}>
        {theme.palette.mode === "dark" ? "🌞 Light Mode" : "🌙 Dark Mode"}
      </Button>
      <Card variant="outlined">
        <Typography component="h1" variant="h4" sx={{ width: "100%", fontSize: "clamp(2rem, 10vw, 2.15rem)" }}>
          Admin Schedule
        </Typography>
        <Box
          component="form"
          onSubmit={handleScheduleSubmit}
          noValidate
          sx={{ display: "flex", flexDirection: "column", width: "100%", gap: 2 }}
        >
          <FormControl>
            <FormLabel htmlFor="date">Date</FormLabel>
            <TextField
              id="date"
              type="date"
              name="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              fullWidth
              variant="outlined"
            />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="shiftStart">Shift Start</FormLabel>
            <TextField
              id="shiftStart"
              select
              name="shiftStart"
              value={shiftStart}
              onChange={(e) => setShiftStart(e.target.value)}
              required
              fullWidth
              variant="outlined"
              SelectProps={{
                native: true,
              }}
            >
              {timeOptions.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </TextField>
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="shiftEnd">Shift End</FormLabel>
            <TextField
              id="shiftEnd"
              select
              name="shiftEnd"
              value={shiftEnd}
              onChange={(e) => setShiftEnd(e.target.value)}
              required
              fullWidth
              variant="outlined"
              SelectProps={{
                native: true,
              }}
            >
              {timeOptions.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </TextField>
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="role">Role</FormLabel>
            <TextField
              id="role"
              select
              name="role"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              required
              fullWidth
              variant="outlined"
              SelectProps={{
                native: true,
              }}
            >
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </TextField>
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="user">User</FormLabel>
            <TextField
              id="user"
              select
              name="user"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              required
              fullWidth
              variant="outlined"
              SelectProps={{
                native: true,
              }}
            >
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </TextField>
          </FormControl>
          {error && <Typography color="error">{error}</Typography>}
          <Button type="submit" fullWidth variant="contained" color="primary" sx={{ py: 2 }}>
            Save Shift
          </Button>
        </Box>
      </Card>
    </ScheduleContainer>
  );
}

export default AdminSchedule;
