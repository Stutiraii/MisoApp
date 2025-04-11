import React, { useState, useEffect, useContext } from "react";
import { useFirebase } from "./Context/firebaseContext";
import { collection, addDoc, getDocs} from "firebase/firestore";
import { Grid } from "@mui/material";
import { getAuth } from "firebase/auth";
import {
  Table, 
  TableBody,
   TableCell,
    TableContainer,
     TableHead,
      TableRow,
       Paper, Typography, FormControl,
  TextField,
  Button,
  Box,
  FormLabel,
} from "@mui/material";
import MuiCard from "@mui/material/Card";
import { styled, useTheme } from "@mui/material/styles";
import Stack from "@mui/material/Stack";
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
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const [selectedShift, setSelectedShift] = useState({});

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
      const shiftsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
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
    
    acc[userId][shiftDate] = { shiftStart: shift.shiftStart, shiftEnd: shift.shiftEnd };
    return acc;
  }, {});
  
  console.log("Shifts by User: ", shiftsByUser);  // Add this log to check the shifts mapping
 // Generate days of the week with date in the correct format
const daysOfWeek = Array.from({ length: 7 }).map((_, i) => {
  const date = new Date(currentWeek.startOfWeek);
  date.setDate(date.getDate() + i); // Increment days
  return { 
    day: date.toLocaleDateString("en-US", { weekday: "long" }), 
    date: date.toLocaleDateString("en-US")  // This will give you a format like "MM/DD/YYYY"
  };
});




 // handleAddRole function 
const handleAddRole = async () => {
  if (newRole.trim()) { // Only add role if not empty
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

    if (!date || !shiftStart || !shiftEnd || !selectedRole || !selectedUser) {
      setError("Please fill all fields");
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

      setError(""); // Clear any previous errors
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

  const generateSchedule = (users) => {
    let schedule = {};
    users.forEach((emp) => {
      schedule[emp.id] = {}; // Initialize schedule for each user
      days.forEach((day) => {
        const randomShift = shifts[Math.floor(Math.random() * shifts.length)];
        schedule[emp.id][day] = randomShift; // Assign random shift for each day
      });
    });
    return schedule;
  };

  

  return (
    <Grid container spacing={4} sx={{ padding: "20px" }}>
       <Grid item xs={12} sm={6}></Grid>
    <ScheduleContainer
      direction="column"
      justifyContent="center"
      alignItems="center"
    >
      <Button
        onClick={colorMode.toggleColorMode}
        sx={{ position: "fixed", top: "1rem", left: "1rem" }}
      >
        {theme.palette.mode === "dark" ? "🌞 Light Mode" : "🌙 Dark Mode"}
      </Button>
      <Card variant="outlined">
        <Typography
          component="h1"
          variant="h4"
          sx={{ width: "100%", fontSize: "clamp(2rem, 10vw, 2.15rem)" }}
        >
          Admin Schedule
        </Typography>
        <Box
          component="form"
          onSubmit={handleScheduleSubmit}
          noValidate
          sx={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            gap: 2,
          }}
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
              <option value="">Select Shift Start</option> {/* Add this */}
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

          <FormControl fullWidth>
            <FormLabel htmlFor="Add Role">Add Role</FormLabel>
            <TextField
              id="Add Role"
              name="Add Role"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              required
              fullWidth
              variant="outlined"
              placeholder="Type or select a role"
              select={false} // Remove `select` to allow text input
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
              <option value="">Select a Role</option>{" "}
              {/* Add a default option */}
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
          </Box>
        </Card>
    
      
  {/* Right Side: Shift Table */}
  <Grid item xs={12} sm={6}>
          <Paper sx={{ padding: "16px" }}>
            <Typography variant="h6" sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              Shift Table
              <Button onClick={() => handleToggleWeek(-1)}>Previous Week</Button>
              <Button onClick={() => handleToggleWeek(1)}>Next Week</Button>
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Staff</TableCell>
                    {daysOfWeek.map((day) => (
                      <TableCell key={day.date}>
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
          {
            shiftsByUser[user.id] && shiftsByUser[user.id][day.date]
              ? `${shiftsByUser[user.id][day.date].shiftStart} - ${shiftsByUser[user.id][day.date].shiftEnd}`
              : '-' // Fallback if no shift is allocated
          }
        </TableCell>
      ))}
    </TableRow>
  ))}
</TableBody>



              </Table>
            </TableContainer>
          </Paper>
        </Grid>
        </ScheduleContainer>
      </Grid>
   
  );
}

export default AdminSchedule;