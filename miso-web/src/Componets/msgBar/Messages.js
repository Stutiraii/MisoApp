import React, { useContext, useState, useEffect } from "react";
import {
  Box,
  Typography,
  Divider,
  IconButton,
  Tooltip,
  useMediaQuery,
  useTheme
} from "@mui/material";
import Search from "./Search";
import Chat from "./Chat";
import { MsgContext } from "../Context/MsgContext";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { styled } from "@mui/material/styles";

const MessagesContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  height: "100vh",
  background: theme.palette.mode === "dark"
    ? "radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))"
    : "radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))",
}));

const Sidebar = styled(Box)(({ theme }) => ({
  width: 280,
  backgroundColor: theme.palette.mode === "dark" ? "#1e1e1e" : "#fff",
  borderRight: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(2),
  overflowY: "auto",
}));

const ChatArea = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
}));

const Messages = () => {
  const [themeMode, setThemeMode] = useState("dark");
  const isMobile = useMediaQuery("(max-width:768px)");
  const theme = useTheme();
  const { data } = useContext(MsgContext);
  const { selectedUser } = data;

  useEffect(() => {
    const savedTheme = localStorage.getItem("themeMode");
    if (savedTheme) setThemeMode(savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = themeMode === "dark" ? "light" : "dark";
    setThemeMode(newTheme);
    localStorage.setItem("themeMode", newTheme);
  };

  return (
    <MessagesContainer>
    {/* Sidebar */}
    <Sidebar>
      <Typography
        variant="h5"
        sx={{
          fontWeight: "bold",
          color: "black",
          textAlign: "center",
          mb: 2,
        }}
      >
       Messages
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <Search />
    </Sidebar>
  
    {/* Chat */}
    {!isMobile && (
      <ChatArea>
        <Box
          sx={{
            flexGrow: 1,
            overflowY: "auto",
            px: 1,
          }}
        >
          {selectedUser ? (
            <Chat />
          ) : (
            <Typography
              textAlign="center"
              sx={{ opacity: 0.6, fontSize: "1.1rem", mt: 4 }}
            >
              Select a user to start chatting.
            </Typography>
          )}
        </Box>
      </ChatArea>
    )}
  
    {/* Theme toggle */}
    <Tooltip title={themeMode === "dark" ? "Light Mode" : "Dark Mode"}>
      <IconButton
        onClick={toggleTheme}
        sx={{
          position: "fixed",
          bottom: 20,
          right: 20,
          backgroundColor: themeMode === "dark" ? "#424242" : "#e0e0e0",
          color: themeMode === "dark" ? "#fff" : "#333",
          borderRadius: "50%",
          boxShadow: 4,
          zIndex: 1500,
          "&:hover": {
            backgroundColor: themeMode === "dark" ? "#616161" : "#d5d5d5",
          },
        }}
      >
        {themeMode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
      </IconButton>
    </Tooltip>
  </MessagesContainer>
  
  );
};

export default Messages;
