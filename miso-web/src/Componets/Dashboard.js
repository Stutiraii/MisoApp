import React, { useState, useEffect, useContext } from "react";
import { useFirebase } from "./Context/firebaseContext"; // Assuming Firebase context
import StaffDashboard from "./StaffDashboard";
import ManageInventory from "./ManageInventory";
import ShiftCalendar from "./ShiftCalendar";
import { useNavigate } from "react-router-dom"; // Import useNavigate for routing
import AdminSchedule from "./AdminSchedule";
import Sidebar from "./msgBar/Sidebar";
import LogoutIcon from "@mui/icons-material/Logout";
import { CalendarMonth, Inventory, AdminPanelSettings, People } from "@mui/icons-material";
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography,
   Button, Grid, CardContent, Divider, CircularProgress,
   } from "@mui/material";
import { getDocs, where, query, collection } from "firebase/firestore";
import MuiCard from "@mui/material/Card";
import { styled, useTheme } from "@mui/material/styles";
import ViewSchedule from "./ViewSchedule";
import Stack from "@mui/material/Stack";
import ColorModeContext from "../customizations/ColorModeContext";


function Dashboard() {
  const { handleLogout, firebase, db } = useFirebase(); // Accessing Firebase context
  const [selectedComponent, setSelectedComponent] = useState("StaffDashboard");
  const [totalStaff, setTotalStaff] = useState(null); // State for storing the total staff count
  const [loading, setLoading] = useState(true); 
  const [lowStockItems, setLowStockItems] = useState([]);
  const [ minStock, setMinStock]= useState(1);
  const theme = useTheme();
  const navigate = useNavigate();
  const colorMode = useContext(ColorModeContext);
  const [drawerOpen, setDrawerOpen] = useState(false); 

  
  
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
    CreateShifts: <ViewSchedule />,
    Messages: <Sidebar />
  };

  // Example data for stats (replace with dynamic data)
  const stats = {
 
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

  const handleEditShifts = () => {
    navigate("/AdminSchedule");
  }
  const handleViewInventory = () => {
    navigate("/ManageInventory")
  }
    const DashboardContainer = styled(Stack)(({ theme }) => ({
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
    const handleToggleDrawer = () => {
      setDrawerOpen(!drawerOpen);
    };
  

  return (
    <DashboardContainer
      direction="column"
      justifyContent="center"
      alignItems="center"
    >
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
             
              justifyContent: "flex-start",
              marginTop: "auto"
             
            }}
          >
            Logout
          </Button>
        </Box>
      </Drawer>

      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Button onClick={colorMode.toggleColorMode} sx={{ position: "fixed", top: "1rem", right: "1rem" }}>
          {theme.palette.mode === "dark" ? "🌞 Light Mode" : "🌙 Dark Mode"}
        </Button>


        <Typography variant="h4" gutterBottom>
          Dashboard Overview
        </Typography>

          {/* Dashboard Content */}
          {selectedComponent === "Dashboard" ? (
          <>
            {/* Dashboard Cards */}
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <People sx={{ fontSize: 40 }} />
                    <Typography variant="h6" mt={1}>Total Staff</Typography>
                    {loading ? <CircularProgress/> : <Typography variant="h4">{totalStaff}</Typography>}
                  </CardContent>
                </Card>
              </Grid>
          
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Inventory sx={{ fontSize: 40 }} />
                    <Typography variant="h6" mt={1}>Low Inventory Alerts</Typography>
                    <Typography variant="h4">{lowStockItems.length}</Typography>
                  </CardContent>
                </Card>
              </Grid>
             
            </Grid>

            {/* Quick Actions Section */}
           <Typography variant="h5" gutterBottom>Quick Actions</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Button onClick={handleEditShifts} fullWidth variant="contained" color="primary">Create Shifts</Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button fullWidth variant="contained" color="primary">Manage Staff</Button>
              </Grid>
      
              <Grid item xs={12} sm={6} md={3}>
                <Button onClick={handleViewInventory}fullWidth variant="contained" color="primary">View Inventory</Button>
              </Grid>
            </Grid>

            <Divider sx={{ marginY: 2 }} />

            {/* Calendar (ViewSchedule) Section */}
            <Typography variant="h5" gutterBottom>Shift Calendar</Typography>
            <ShiftCalendar />
          </>
        ) : (
          components[selectedComponent]
        )}
      </Box>
    </Box>
    </DashboardContainer>
  );

  }
  
  export default Dashboard;