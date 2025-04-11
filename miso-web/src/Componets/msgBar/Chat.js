import React, { useContext, useEffect, useState, useRef } from "react";
import { MsgContext } from "../Context/MsgContext";
import { getAuth } from "firebase/auth";
import {
  doc,
  onSnapshot,
  arrayUnion,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { useFirebase } from "../Context/firebaseContext";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Stack,
} from "@mui/material";
import { styled } from "@mui/material/styles";

const Chat = () => {
  const { data } = useContext(MsgContext);
  const { selectedUser } = data;
  const [messages, setMessages] = useState([]);
  const { db } = useFirebase();
  const auth = getAuth();
  const [newMsg, setNewMsg] = useState("");
  const chatEndRef = useRef(null);

  const combinedId =
    auth.currentUser.uid > selectedUser?.uid
      ? auth.currentUser.uid + selectedUser?.uid
      : selectedUser?.uid + auth.currentUser.uid;

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (!selectedUser || !combinedId) return;

    const unsub = onSnapshot(doc(db, "chats", combinedId), (docSnap) => {
      if (docSnap.exists()) {
        setMessages(docSnap.data().messages || []);
      }
    });

    return () => unsub();
  }, [selectedUser, db, combinedId]);

  const handleSend = async () => {
    if (!newMsg.trim()) return;

    await updateDoc(doc(db, "chats", combinedId), {
      messages: arrayUnion({
        id: Date.now(),
        text: newMsg,
        senderId: auth.currentUser.uid,
        date: Timestamp.now(),
      }),
    });

    setNewMsg("");
  };

  // Chat Container Styles
  const ChatContainer = styled(Box)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    height: "100%",
    maxHeight: "100%",
    width: "100%",
    border: "1px solid",
    alignItems: "center",
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
  }));

  return selectedUser ? (
    <ChatContainer>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          maxHeight: "100%",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          padding: 2,
          backgroundColor: "background.paper",
        }}
      >
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
          {selectedUser.name}
        </Typography>

        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            paddingRight: 1,
            marginBottom: 2,
            display: "flex",
            flexDirection: "column-reverse", // ensures new messages appear at the bottom
          }}
        >
          <Stack spacing={2}>
            {messages.length > 0 ? (
              messages.map((m) => (
                <Box
                  key={m.id}
                  sx={{
                    display: "flex",
                    justifyContent:
                      m.senderId === auth.currentUser.uid
                        ? "flex-end"
                        : "flex-start",
                  }}
                >
                  <Paper
                    elevation={3}
                    sx={{
                      px: 3,
                      py: 1.5,
                      borderRadius: 3,
                      maxWidth: "80%",
                      backgroundColor:
                        m.senderId === auth.currentUser.uid
                          ? "primary.main"
                          : "grey.300",
                      color:
                        m.senderId === auth.currentUser.uid
                          ? "#fff"
                          : "text.primary",
                      boxShadow: 2,
                    }}
                  >
                    <Typography variant="body1" sx={{ fontWeight: 400 }}>
                      {m.text}
                    </Typography>
                  </Paper>
                </Box>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary" align="center">
                No messages yet
              </Typography>
            )}

            <div ref={chatEndRef} />
          </Stack>
        </Box>

        {/* Message Input Section */}
        <Box
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          sx={{
            display: "flex",
            gap: 1,
            marginTop: 2,
            paddingBottom: 2,
            alignItems: "center",
          }}
        >
          <TextField
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            placeholder="Type a message..."
            fullWidth
            size="small"
            variant="outlined"
            sx={{
              backgroundColor: "#f5f5f5",
              borderRadius: "20px",
              fontSize: "0.875rem", // adjust text size
            }}
          />
          <Button
            type="submit"
            variant="contained"
            size="small"
            sx={{
              whiteSpace: "nowrap",
              borderRadius: "20px",
              padding: "8px 16px",
              boxShadow: 2,
              fontSize: "0.875rem", // adjust button size
            }}
          >
            Send
          </Button>
        </Box>
      </Box>
    </ChatContainer>
  ) : (
    <Typography align="center" sx={{ mt: 4 }} color="text.secondary">
      Select a user to start chatting
    </Typography>
  );
};

export default Chat;
