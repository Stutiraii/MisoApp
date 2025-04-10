import React, { useState, useContext } from "react";
import {
  Box,
  Button,
  Drawer,
  Divider,
  Typography,
  useTheme,
  ThemeProvider,
  createTheme,
  useMediaQuery,
  IconButton,
  Tooltip,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import Search from "./Search";
import Chat from "./Chat";
import { MsgContext } from "../Context/MsgContext";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";

// Custom themes
const lightTheme = createTheme({
  palette: {
    mode: "light",
    background: {
      default: "#f7f7f7",
    },
  },
});

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#121212",
    },
  },
});

const Sidebar = () => {
  const [themeMode, setThemeMode] = useState("dark");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { data, setSelectedUser } = useContext(MsgContext);
  const { selectedUser } = data;

  const SidebarContainer = styled(Box)(({ theme }) => ({
    display: "flex",
    height: "100vh",
    width: "100%",
    background: theme.palette.background.default,
  }));

  const toggleTheme = () => {
    setThemeMode(themeMode === "dark" ? "light" : "dark");
  };

  return (
    <ThemeProvider theme={themeMode === "dark" ? darkTheme : lightTheme}>
      <SidebarContainer>
        {/* Sidebar / Drawer */}
        <Drawer
          sx={{
            width: 280,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: 280,
              boxSizing: "border-box",
              backgroundColor: themeMode === "dark" ? "#1e1e1e" : "#ffffff",
              padding: 2,
              color: themeMode === "dark" ? "#fff" : "#000",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              boxShadow: "2px 0 8px rgba(0,0,0,0.1)",
            },
          }}
          variant={isMobile ? "temporary" : "permanent"}
          anchor="left"
          open={!isMobile || undefined}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: "bold",
              pl: 1,
              color: themeMode === "dark" ? "#90caf9" : "#1976d2",
              letterSpacing: 1,
            }}
          >
            ChatApp
          </Typography>
          <Divider />
          <Search />
        </Drawer>

        {/* Main Chat Section */}
        <Box
          sx={{
            flexGrow: 1,
            padding: 3,
            overflowY: "auto",
            backgroundColor: themeMode === "dark" ? "#121212" : "#f5f5f5",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Typography
            component="h1"
            variant="h4"
            sx={{
              fontSize: "clamp(1.8rem, 4vw, 2.4rem)",
              textAlign: "center",
              mb: 3,
              color: themeMode === "dark" ? "#fff" : "#333",
            }}
          >
            {selectedUser ? `Chat with ${selectedUser.name}` : "Messages"}
          </Typography>

          {selectedUser ? (
            <Chat />
          ) : (
            <Typography textAlign="center" sx={{ opacity: 0.7 }}>
              Select a user to start chatting.
            </Typography>
          )}
        </Box>
      </SidebarContainer>

      {/* Floating Theme Toggle */}
      <Tooltip title={themeMode === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}>
        <IconButton
          onClick={toggleTheme}
          sx={{
            position: "fixed",
            bottom: 20,
            right: 20,
            backgroundColor: themeMode === "dark" ? "#424242" : "#e0e0e0",
            color: themeMode === "dark" ? "#fff" : "#333",
            borderRadius: "50%",
            boxShadow: 3,
            zIndex: 1300,
            "&:hover": {
              backgroundColor: themeMode === "dark" ? "#616161" : "#d5d5d5",
            },
          }}
        >
          {themeMode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>
      </Tooltip>
    </ThemeProvider>
  );
};

export default Sidebar;
