import React, { useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ChatIcon from "@mui/icons-material/Chat";
import ScheduleIcon from "@mui/icons-material/Schedule";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";

import ViewSchedule from "./ViewSchedule";
import Sidebar from "./msgBar/Sidebar";
import Chat from "./msgBar/Chat";
import { MsgContextProvider } from "./Context/MsgContext";

function StaffDashboard() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* Top Navigation Bar */}
      <AppBar position="static" sx={{ backgroundColor: "black" }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={toggleDrawer}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Staff Dashboard
          </Typography>
          <Button color="inherit" startIcon={<ExitToAppIcon />}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      {/* Sidebar Drawer */}
      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer}>
        <List>
          <ListItem
            button
            component={Link}
            to="/sidebar"
            onClick={toggleDrawer}
          >
            <ListItemIcon>
              <ScheduleIcon />
            </ListItemIcon>
            <ListItemText primary="Sidebar" />
          </ListItem>
          <ListItem button component={Link} to="/chat" onClick={toggleDrawer}>
            <ListItemIcon>
              <ChatIcon />
            </ListItemIcon>
            <ListItemText primary="Chat" />
          </ListItem>
        </List>
      </Drawer>

      {/* Main Content Layout */}
      <Box sx={{ flexGrow: 1, padding: 3 }}>
        <Grid container spacing={3}>
          {/* ViewSchedule Component */}
          <Grid size={12} md={6}>
            <Card elevation={4} sx={{ height: "100%" }}>
              <CardContent>
                <ViewSchedule />
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Additional Routes for Sidebar & Chat */}
        <MsgContextProvider>
          <Routes>
            <Route path="/sidebar" element={<Sidebar />} />
            <Route path="/chat" element={<Chat />} />
          </Routes>
        </MsgContextProvider>
      </Box>
    </Box>
  );
}

export default StaffDashboard;
