import React, { useState, useEffect, useContext } from "react";
import { useFirebase } from "./Context/firebaseContext";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { Grid } from "@mui/material";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  FormControl,
  TextField,
  Button,
  Box,
  FormLabel,
} from "@mui/material";
import MuiCard from "@mui/material/Card";
import { styled, useTheme } from "@mui/material/styles";
import ColorModeContext from "../customizations/ColorModeContext";

function AdminSchedule() {
  const { db } = useFirebase();
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);

  // State variables
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

  // State to manage current week start date and end date
  const [currentWeek, setCurrentWeek] = useState(getCurrentWeekDates());

  // Get the start and end date of the current week (Monday to Sunday)
  function getCurrentWeekDates(date = new Date()) {
    const day = date.getDay(),
      diff = date.getDate() - day + (day == 0 ? -6 : 1); // Adjust to Monday
    const startOfWeek = new Date(date.setDate(diff));
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    return { startOfWeek, endOfWeek };
  }

  const handleToggleWeek = (direction) => {
    // Toggle between previous and next week
    const newStartDate = new Date(currentWeek.startOfWeek);
    newStartDate.setDate(newStartDate.getDate() + direction * 7);
    setCurrentWeek(getCurrentWeekDates(newStartDate));
  };

  // Fetch Users, Shifts, and Roles from DB
  useEffect(() => {
    const fetchUsers = async () => {
      const usersRef = collection(db, "users");
      const snapshot = await getDocs(usersRef);
      setUsers(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };

    const fetchShifts = async () => {
      const shiftsRef = collection(db, "shifts");
      const snapshot = await getDocs(shiftsRef);
      const shiftsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log(shiftsData);
      setShifts(shiftsData);
    };

    const fetchRoles = async () => {
      const rolesRef = collection(db, "roles");
      const snapshot = await getDocs(rolesRef);
      setRoles(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };

    fetchUsers();
    fetchShifts();
    fetchRoles();
  }, [db]);

  const shiftsByUser = shifts.reduce((acc, shift) => {
    const userId = shift.userId;
    const shiftDate = shift.date;
    if (!acc[userId]) {
      acc[userId] = {};
    }

    acc[userId][shiftDate] = {
      shiftStart: shift.shiftStart,
      shiftEnd: shift.shiftEnd,
    };
    return acc;
  }, {});
  console.log("Shifts by User:", shiftsByUser); // Debugging

  // Generate days of the week for the current week
  const daysOfWeek = Array.from({ length: 7 }).map((_, i) => {
    const date = new Date(currentWeek.startOfWeek);
    date.setDate(date.getDate() + i);
    return {
      day: format(date, "EEEE"),
      date: format(date, "yyyy-MM-dd"),
    };
  });

  // handleAddRole function
  const handleAddRole = async () => {
    if (newRole.trim()) {
      // Only add role if not empty
      try {
        await addDoc(collection(db, "roles"), { name: newRole });
        setNewRole("");
        setError("");
      } catch (error) {
        setError("Error adding role: " + error.message);
      }
    }
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Reset error message

    if (!date || !shiftStart || !shiftEnd || !selectedRole || !selectedUser) {
      setError("Please fill all fields");
      return;
    }

    if (shiftStart >= shiftEnd) {
      setError("Shift start time must be earlier than shift end time.");
      return;
    }

    const userDetails = users.find((user) => user.id === selectedUser);
    if (!userDetails) {
      setError("Invalid user selection");
      return;
    }
    const roleToSubmit = selectedRole || null;

    try {
      await addDoc(collection(db, "shifts"), {
        date,
        shiftStart,
        shiftEnd,
        role: roleToSubmit,
        userId: userDetails.id,
        username: userDetails.name,
      });

      setShifts([
        ...shifts,
        {
          date,
          shiftStart,
          shiftEnd,
          role: roleToSubmit,
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
    width: "100%",
    padding: theme.spacing(4),
    boxShadow:
      theme.palette.mode === "dark"
        ? "0px 5px 20px rgba(0,0,0,0.3)"
        : "0px 5px 20px rgba(0,0,0,0.1)",
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    borderRadius: "12px",
    marginBottom: theme.spacing(4),
  }));

  const ScheduleContainer = styled(Box)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: theme.spacing(2),
    height: "100vh",
    background: theme.palette.mode === "dark" ? "#212121" : "#F5F5F5",
  }));
  const TableWrapper = styled(Paper)(({ theme }) => ({
    width: "100%",
    borderRadius: "8px",
    marginTop: theme.spacing(4),
    padding: theme.spacing(2),
  }));
  const FormContainer = styled(Box)(({ theme }) => ({
    width: "100%",
    display: "grid",
    gap: theme.spacing(2),
    marginTop: theme.spacing(2),
  }));

  return (
    <Grid container spacing={4} sx={{ padding: "20px" }}>
      {/* Admin Schedule Form */}
      <Grid item xs={12} sm={6}>
        <ScheduleContainer
          sx={{
            height: "100vh",
            minHeight: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "left",
            padding: "2rem",
          }}
        >
          <Button
            onClick={colorMode.toggleColorMode}
            sx={{ position: "fixed", top: "1rem", left: "1rem" }}
          >
            {theme.palette.mode === "dark" ? "🌞 Light Mode" : "🌙 Dark Mode"}
          </Button>

          <Typography
            component="h1"
            variant="h4"
            sx={{ width: "100%", fontSize: "clamp(2rem, 10vw, 2.15rem)" }}
          >
            Admin Schedule
          </Typography>

          <Card variant="outlined">
            <FormContainer component="form" onSubmit={handleScheduleSubmit}>
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
                  <option value="">Select Shift Start</option>
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
                  <option value="">Select Shift End</option>
                  {timeOptions.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </TextField>
              </FormControl>

              <FormControl fullWidth>
                <FormLabel htmlFor="newRole">Add Role</FormLabel>
                <TextField
                  id="newRole"
                  name="newRole"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  required
                  fullWidth
                  variant="outlined"
                  placeholder="Type or select a role"
                />
                <Button
                  onClick={handleAddRole}
                  fullWidth
                  variant="contained"
                  color="secondary"
                  sx={{ mt: 2 }}
                >
                  Add Role
                </Button>
                {error && (
                  <Typography color="error" sx={{ mt: 2 }}>
                    {error}
                  </Typography>
                )}
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
                  <option value="">Select User</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
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
                  onChange={(e) => {
                    console.log("Selected role:", e.target.value); // Debugging
                    setSelectedRole(e.target.value);
                  }}
                  required
                  fullWidth
                  variant="outlined"
                  SelectProps={{
                    native: true,
                  }}
                >
                  <option value="">Select a Role</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.name}>
                      {role.name}
                    </option>
                  ))}
                </TextField>
              </FormControl>

              {error && <Typography color="error">{error}</Typography>}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                sx={{ py: 2 }}
              >
                Save Shift
              </Button>
            </FormContainer>
          </Card>
        </ScheduleContainer>
      </Grid>

      {/* Shift Table */}
      <Grid item xs={12} sm={6}>
        <TableWrapper>
          <Typography
            variant="h6"
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
              fontSize: "2rem",
              fontWeight: "bold",
            }}
          >
            Shift Table
            <Button onClick={() => handleToggleWeek(-1)}>Previous Week</Button>
            <Button onClick={() => handleToggleWeek(1)}>Next Week</Button>
          </Typography>

          <TableContainer sx={{ minHeight: "400px", maxHeight: "600px" }}>
            <Table sx={{ minWidth: "100%" }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontSize: "1.2rem", fontWeight: "bold" }}>
                    Staff
                  </TableCell>
                  {daysOfWeek.map((day) => (
                    <TableCell
                      key={day.date}
                      sx={{ fontSize: "1.1rem", fontWeight: "bold" }}
                    >
                      {day.day} ({day.date})
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    {daysOfWeek.map((day) => (
                      <TableCell key={day.date}>
                        {shiftsByUser[user.id] &&
                        shiftsByUser[user.id][day.date] ? (
                          <>
                            <Typography variant="body2">
                              {shiftsByUser[user.id][day.date].shiftStart} -{" "}
                              {shiftsByUser[user.id][day.date].shiftEnd}
                            </Typography>
                          </>
                        ) : (
                          <Typography variant="body2" color="textSecondary">
                            No shift
                          </Typography>
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TableWrapper>
      </Grid>
    </Grid>
  );
}
export default AdminSchedule;
