import React, { useContext, useState } from "react";
import { MsgContext } from "./Context/MsgContext";
import { styled, useTheme } from "@mui/material/styles";
import { Box, Divider, Typography, Stack } from "@mui/material";

// Import images
import Cam from "./img/cam.png";
import Add from "./img/add.png";
import More from "./img/more.png";
import Input from "./msgBar/Input";
import Messages from "./msgBar/Message";
import Sidebar from "./msgBar/Sidebar"; // Import Sidebar Component

const PageContainer = styled(Stack)(({ theme }) => ({
  display: "flex",
  height: "100vh",
  flexDirection: "row", // Sidebar on the left, Chat on the right
  background: theme.palette.mode === "dark"
    ? "radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))"
    : "radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))",
}));

const SidebarWrapper = styled(Box)(({ theme }) => ({
  width: "250px", // Sidebar width
  backgroundColor: theme.palette.background.paper,
  boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
}));

const ChatContainer = styled(Box)(({ theme }) => ({
  flexGrow: 1, // Chat will take up the remaining space
  padding: theme.spacing(2),
  display: "flex",
  flexDirection: "column",
  background:
    theme.palette.mode === "dark"
      ? "radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))"
      : "radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))",
}));

const ChatInfo = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  paddingBottom: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const ChatIcons = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(1),
}));

const Chat = () => {
  const { data } = useContext(MsgContext); // Pulling user data from context
  const theme = useTheme(); // Using the theme for dynamic styling

  if (!data || !data.user) {
    return <div>Loading...</div>; // Prevent crashes if data or user info is not available
  }

  // Extract user information from the context
  const { displayName } = data.user;

  return (
    <ChatContainer>
      {/* Chat Info Section */}
      <ChatInfo>
        <Typography variant="h6">{displayName}</Typography>
        <ChatIcons>
          <img src={Cam} alt="Camera" />
          <img src={Add} alt="Add" />
          <img src={More} alt="More options" />
        </ChatIcons>
      </ChatInfo>

      {/* Divider between chat header and messages */}
      <Divider sx={{ borderColor: theme.palette.divider }} />

      {/* Messages Section */}
      <Messages />

      {/* Input Section */}
      <Input />
    </ChatContainer>
  );
};

const ChatPage = () => {
  return (
    <PageContainer>
      {/* Sidebar */}
      <SidebarWrapper>
        <Sidebar />
      </SidebarWrapper>

      {/* Chat Section */}
      <Chat />
    </PageContainer>
  );
};

export default ChatPage;
