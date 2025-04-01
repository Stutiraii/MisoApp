import React, { useState, useEffect } from "react";
import { useFirebase } from "./Context/firebaseContext"; // Assuming Firebase context
import StaffDashboard from "./StaffDashboard";
import ManageInventory from "./ManageInventory";
import ShiftCalendar from "./ShiftCalendar";
import AdminSchedule from "./AdminSchedule";
import LogoutIcon from "@mui/icons-material/Logout";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import { CalendarMonth, Inventory, Schedule, AdminPanelSettings, People, AttachMoney, Warning } from "@mui/icons-material";
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography,
   Button, Grid, Card, CardContent, Divider, CircularProgress,
   AppBar, Toolbar
   } from "@mui/material";
import { getDocs, where, query, collection } from "firebase/firestore";

function Dashboard() {
  const { currentUser, handleLogout, firebase, db } = useFirebase(); // Accessing Firebase context
  const [selectedComponent, setSelectedComponent] = useState("StaffDashboard");
  const [totalStaff, setTotalStaff] = useState(null); // State for storing the total staff count
  const [loading, setLoading] = useState(true); 
  const [lowStockItems, setLowStockItems] = useState([]);
  const [ minStock, setMinStock]= useState(1);
  
  
  // State to manage loading state
  useEffect(() => {
    console.log("minStock Value:", minStock); // Debugging minStock
  
    const fetchLowStockItems = async () => {
      const lowStockQuery = query(
        collection(db, "inventory"),
        where("quantity", "<=", minStock)
      );
  
      const lowStockSnapshot = await getDocs(lowStockQuery);
      console.log("Fetched Documents:", lowStockSnapshot.docs.length); // Debugging the query result
  
      const lowStockData = lowStockSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
  
      console.log("Low Stock Items:", lowStockData); // Check what's being stored
      setLowStockItems(lowStockData);
    };
  
    fetchLowStockItems();
  }, [db, minStock]);
  

  // Define the components to be rendered
  const components = {
    StaffDashboard: <StaffDashboard />,
    ManageInventory: <ManageInventory />,
    ShiftCalendar: <ShiftCalendar />,
    AdminSchedule: <AdminSchedule />,
  };

  // Example data for stats (replace with dynamic data)
  const stats = {
    activeShifts: 15,
    lowInventory: 5,
    totalPayroll: 5000,
    pendingLeaveRequests: 3,
  };

  // Fetch the staff data from Firestore and count the staff
  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        setLoading(true);
        const usersCollectionRef = collection(db, "users");
        const snapshot = await getDocs(usersCollectionRef);
        setTotalStaff(snapshot.size); // snapshot.size gives the count of documents (staff)
      } catch (error) {
        console.error("Error fetching staff data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStaffData();
  }, [firebase]);

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: 240,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: 240,
            boxSizing: "border-box",
            backgroundColor: "#1e2a3a",
            color: "white",
            zIndex: 1200,
          },
        }}
      >
        <Typography variant="h5" sx={{ textAlign: "center", my: 2 }}>
          Dashboard
        </Typography>
        <List>
        <ListItem disablePadding>
  <ListItemButton onClick={() => setSelectedComponent("StaffDashboard")}>
    <ListItemIcon><People /></ListItemIcon>
    <ListItemText primary="Staff Dashboard" />
  </ListItemButton>
</ListItem>
<ListItem disablePadding>
  <ListItemButton onClick={() => setSelectedComponent("ManageInventory")}>
    <ListItemIcon><Inventory /></ListItemIcon>
    <ListItemText primary="Manage Inventory" />
  </ListItemButton>
</ListItem>
<ListItem disablePadding>
  <ListItemButton onClick={() => setSelectedComponent("ShiftCalendar")}>
    <ListItemIcon><CalendarMonth /></ListItemIcon>
    <ListItemText primary="Edit Schedule" />
  </ListItemButton>
</ListItem>
<ListItem disablePadding>
  {/* When clicking "Admin", reset to the main Dashboard */}
  <ListItemButton onClick={() => setSelectedComponent("Dashboard")}>
    <ListItemIcon><AdminPanelSettings /></ListItemIcon>
    <ListItemText primary="Admin" />
  </ListItemButton>
</ListItem>

        </List>
  
        {/* Logout Button */}
        <Box sx={{ position: "absolute", bottom: 20, width: "100%" }}>
          <Button
            color="inherit"
            fullWidth
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{
              color: "#ccc",
              justifyContent: "flex-start",
              marginTop: "auto",
              "&:hover": { backgroundColor: "#444" },
            }}
          >
            Logout
          </Button>
        </Box>
      </Drawer>
  
      <Box sx={{ flexGrow: 1, p: 3 }}>
  <Typography variant="h4" gutterBottom>
    Dashboard Overview
  </Typography>

  {/* If "Dashboard" is selected, show main dashboard stats */}
  {selectedComponent === "Dashboard" ? (
    <>
      {/* Dashboard Cards */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: "#1e2a3a", color: "white" }}>
            <CardContent>
              <People sx={{ fontSize: 40 }} />
              <Typography variant="h6" mt={1}>Total Staff</Typography>
              {loading ? (
                <CircularProgress sx={{ color: "white" }} />
              ) : (
                <Typography variant="h4">{totalStaff}</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: "#1e2a3a", color: "white" }}>
            <CardContent>
              <CalendarMonth sx={{ fontSize: 40 }} />
              <Typography variant="h6" mt={1}>Active Shifts</Typography>
              <Typography variant="h4">{stats.activeShifts}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: "#1e2a3a", color: "white" }}>
            <CardContent>
              <Inventory sx={{ fontSize: 40 }} />
              <Typography variant="h6" mt={1}>Low Inventory Alerts</Typography>
              <Typography variant="h4">{lowStockItems.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: "#1e2a3a", color: "white" }}>
            <CardContent>
              <AttachMoney sx={{ fontSize: 40 }} />
              <Typography variant="h6" mt={1}>Total Payroll</Typography>
              <Typography variant="h4">${stats.totalPayroll}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  ) : (
    components[selectedComponent]
  )}

   {/* Quick Actions Section */}
   <Typography variant="h5" gutterBottom>Quick Actions</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Button fullWidth variant="contained" color="primary">Create/Edit Shifts</Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button fullWidth variant="contained" color="primary">Manage Staff</Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button fullWidth variant="contained" color="primary">Approve Payroll</Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button fullWidth variant="contained" color="primary">View Inventory</Button>
          </Grid>
        </Grid>

        <Divider sx={{ marginY: 2 }} />
        
</Box>
    </Box>
  );
  
}

export default Dashboard;
