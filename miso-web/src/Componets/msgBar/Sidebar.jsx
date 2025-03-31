import React, { useState } from "react";
import { Button, Box, Drawer, Divider, Typography, useTheme, ThemeProvider, createTheme, useMediaQuery } from "@mui/material";
import { styled } from "@mui/material/styles";
import Navbar from "./Navbar";
import Search from "./Search";
import Chat from "./Chat";

// Custom themes for light and dark modes
const lightTheme = createTheme({
  palette: {
    mode: "light",
  },
});

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

const Sidebar = () => {
  const [themeMode, setThemeMode] = useState("dark"); // state to toggle theme
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md")); // Detect mobile screens

  // Styled components for MUI
  const SidebarContainer = styled(Box)(({ theme }) => ({
    display: "flex",
    height: "100vh",
    padding: theme.spacing(2),
    background: theme.palette.mode === "dark" ? "rgb(33, 33, 33)" : "white",
    width: "100%",
  }));

  // Toggle theme mode
  const toggleTheme = () => {
    setThemeMode(themeMode === "dark" ? "light" : "dark");
  };

  return (
    <ThemeProvider theme={themeMode === "dark" ? darkTheme : lightTheme}>
      <SidebarContainer>
        {/* Sidebar with Drawer */}
        <Drawer
          sx={{
            width: 240,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: 250,
              boxSizing: "border-box",
              backgroundColor: "#212121", // Dark background for sidebar
              padding: 2,
              color: "#fff", // Light text in dark sidebar
            },
          }}
          variant={isMobile ? "temporary" : "permanent"} // Make sidebar collapsible on mobile
          anchor="left"
          open={!isMobile || undefined} // Conditionally control drawer visibility on mobile
        >
          <Box sx={{ paddingBottom: 2 }}>
            <Typography variant="h6" sx={{ padding: 1, fontWeight: "bold" }}>
              ChatApp
            </Typography>
          </Box>

          <Divider />

          {/* Navbar, Search, and Chats Section */}
          <Box sx={{ paddingTop: 2 }}>
            <Navbar />
            <Search />
            <Chat />
          </Box>
        </Drawer>

        {/* Main Content Section for Messages */}
        <Box sx={{ flexGrow: 1, padding: 3, color: "#fff" }}>
          <Typography
            component="h1"
            variant="h4"
            sx={{
              width: "100%",
              fontSize: "clamp(2rem, 10vw, 2.15rem)",
              textAlign: "center",
              marginBottom: 2,
            }}
          >
            Messages
          </Typography>
          <Chat />
        </Box>
      </SidebarContainer>
      
      {/* Button to toggle theme */}
      <Button
        variant="contained"
        color="secondary"
        sx={{
          position: "fixed",
          bottom: 16,
          right: 16,
          borderRadius: "50%",
          padding: "10px 20px",
        }}
        onClick={toggleTheme}
      >
        {themeMode === "dark" ? "Light Mode" : "Dark Mode"}
      </Button>
    </ThemeProvider>
  );
};

export default Sidebar;
