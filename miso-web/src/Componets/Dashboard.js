import React, { useState, useEffect, useContext } from "react";
import { useFirebase } from "./Context/firebaseContext";
import StaffDashboard from "./StaffDashboard";
import ManageInventory from "./ManageInventory";
import ShiftCalendar from "./ShiftCalendar";
import { useNavigate } from "react-router-dom";
import AdminSchedule from "./AdminSchedule";
import Messages from "./msgBar/Messages";
import LogoutIcon from "@mui/icons-material/Logout";
import {
  CalendarMonth,
  Inventory,
  AdminPanelSettings,
  People,
  Message,
} from "@mui/icons-material";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Button,
  Grid,
  CardContent,
  Divider,
  CircularProgress,
  Card as MuiCard,
} from "@mui/material";
import { getDocs, where, query, collection } from "firebase/firestore";
import { styled, useTheme } from "@mui/material/styles";
import ViewSchedule from "./ViewSchedule";
import Stack from "@mui/material/Stack";
import ColorModeContext from "../customizations/ColorModeContext";

const DashboardContainer = styled(Stack)(({ theme }) => ({
  display: "flex",
  minHeight: "100%",
  padding: theme.spacing(2),
  background:
    theme.palette.mode === "dark"
      ? "radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))"
      : "radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))",
}));

const Card = styled(MuiCard)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignSelf: "center",
  width: "100%",
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: "auto",
  transition: "transform 0.2s",
  "&:hover": {
    transform: "scale(1.05)",
    boxShadow: theme.shadows[5],
  },
}));

function Dashboard() {
  const { handleLogout, firebase, db } = useFirebase();
  const [selectedComponent, setSelectedComponent] = useState("StaffDashboard");
  const [totalStaff, setTotalStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [minStock, setMinStock] = useState(1);
  const theme = useTheme();
  const navigate = useNavigate();
  const colorMode = useContext(ColorModeContext);

  useEffect(() => {
    const fetchLowStockItems = async () => {
      const lowStockQuery = query(
        collection(db, "inventory"),
        where("quantity", "<=", minStock)
      );
      const lowStockSnapshot = await getDocs(lowStockQuery);
      const lowStockData = lowStockSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setLowStockItems(lowStockData);
    };
    fetchLowStockItems();
  }, [db, minStock]);

  const components = {
    StaffDashboard: <StaffDashboard />,
    ManageInventory: <ManageInventory />,
    ShiftCalendar: <ShiftCalendar />,
    AdminSchedule: <AdminSchedule />,
    CreateShifts: <ViewSchedule />,
    Messages: <Messages />,
  };

  const handleSidebarItemClick = (componentName) => {
    setSelectedComponent(componentName);
  };

  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        setLoading(true);
        const usersCollectionRef = collection(db, "users");
        const snapshot = await getDocs(usersCollectionRef);
        setTotalStaff(snapshot.size);
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
  };

  const handleViewInventory = () => {
    navigate("/ManageInventory");
  };


  return (
    <DashboardContainer
      direction="column"
      justifyContent="center"
      alignItems="center"
    >
      <Box sx={{ display: "flex", height: "100vh" }}>
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
              <ListItemButton
                onClick={() => setSelectedComponent("StaffDashboard")}
              >
                <ListItemIcon>
                  <People />
                </ListItemIcon>
                <ListItemText primary="Staff Dashboard" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => setSelectedComponent("ManageInventory")}
              >
                <ListItemIcon>
                  <Inventory />
                </ListItemIcon>
                <ListItemText primary="Manage Inventory" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => setSelectedComponent("ShiftCalendar")}
              >
                <ListItemIcon>
                  <CalendarMonth />
                </ListItemIcon>
                <ListItemText primary="Edit Schedule" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={() => setSelectedComponent("Dashboard")}>
                <ListItemIcon>
                  <AdminPanelSettings />
                </ListItemIcon>
                <ListItemText primary="Admin" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => handleSidebarItemClick("Messages")}
              >
                <ListItemIcon>
                  <Message />
                </ListItemIcon>
                <ListItemText primary="Messages" />
              </ListItemButton>
            </ListItem>
          </List>
          <Box sx={{ position: "absolute", bottom: 20, width: "100%" }}>
            <Button
              color="inherit"
              fullWidth
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              sx={{
                justifyContent: "flex-start",
                marginTop: "auto",
              }}
            >
              Logout
            </Button>
          </Box>
        </Drawer>
        {/* Theme toggle button */}
        <Box sx={{ flexGrow: 1, p: 3 }}>
          <Button
            onClick={colorMode.toggleColorMode}
            sx={{ position: "fixed", top: "1rem", right: "1rem" }}
          >
            {theme.palette.mode === "dark" ? "🌞 Light Mode" : "🌙 Dark Mode"}
          </Button>

          {selectedComponent === "Messages" ? (
            components[selectedComponent]
          ) : selectedComponent === "Dashboard" ? (
            <>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  {/* Quick overview cards */}
                  <Card>
                    <CardContent>
                      <People sx={{ fontSize: 40 }} />
                      <Typography variant="h6" mt={1}>
                        Total Staff
                      </Typography>
                      {loading ? (
                        <CircularProgress />
                      ) : (
                        <Typography variant="h4">{totalStaff}</Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Inventory sx={{ fontSize: 40 }} />
                      <Typography variant="h6" mt={1}>
                        Low Inventory Alerts
                      </Typography>
                      <Typography variant="h4">
                        {lowStockItems.length}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
                      {/* /* Quick Actions*/}
              <Typography variant="h5" gutterBottom>
                Quick Actions
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    onClick={handleEditShifts}
                    fullWidth
                    variant="contained"
                    color="primary"
                  >
                    Create Shifts
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    onClick={handleViewInventory}
                    fullWidth
                    variant="contained"
                    color="primary"
                  >
                    View Inventory
                  </Button>
                </Grid>
              </Grid>

              <Divider sx={{ marginY: 2 }} />

              <Typography variant="h5" gutterBottom>
                Shift Calendar
              </Typography>
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
