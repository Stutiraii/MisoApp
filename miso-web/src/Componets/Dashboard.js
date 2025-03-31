import React, { useState } from "react";
import { useFirebase } from "./Context/firebaseContext";
import StaffDashboard from "./StaffDashboard";
import ManageInventory from "./ManageInventory";
import Hours from "./Hours"; 
import ShiftCalendar from "./ShiftCalendar";
import ViewSchedule from "./ViewSchedule";
import AdminSchedule from "./AdminSchedule";
import "../styles/App.css";
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography } from "@mui/material";
import { CalendarMonth, Inventory, Schedule, AccessTime, AdminPanelSettings } from "@mui/icons-material";

function Dashboard() {
  const { currentUser } = useFirebase();
  const [selectedComponent, setSelectedComponent] = useState("StaffDashboard");

  const components = {
    StaffDashboard: <StaffDashboard />,
    ManageInventory: <ManageInventory />,
    Hours: <Hours />,
    ShiftCalendar: <ShiftCalendar />,
    ViewSchedule: <ViewSchedule />,
    AdminSchedule: <AdminSchedule />,
  };

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      {/* Sidebar */}
      <Drawer variant="permanent" sx={{ width: 240, flexShrink: 0, "& .MuiDrawer-paper": { width: 240, boxSizing: "border-box" } }}>
        <Typography variant="h5" sx={{ textAlign: "center", my: 2 }}>Dashboard</Typography>
        <List>
          <ListItem disablePadding>
            <ListItemButton onClick={() => setSelectedComponent("AdminSchedule")}> 
              <ListItemIcon><AdminPanelSettings /></ListItemIcon>
              <ListItemText primary="Admin" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => setSelectedComponent("ManageInventory")}>
              <ListItemIcon><Inventory /></ListItemIcon>
              <ListItemText primary="Inventory" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => setSelectedComponent("ShiftCalendar")}>
              <ListItemIcon><CalendarMonth /></ListItemIcon>
              <ListItemText primary="Edit Schedule" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => setSelectedComponent("StaffDashboard")}>
              <ListItemIcon><Schedule /></ListItemIcon>
              <ListItemText primary="Staff" />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, p: 3 }}>
        {components[selectedComponent]}
      </Box>
    </Box>
  );
}

export default Dashboard;
