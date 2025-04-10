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

  return selectedUser ? (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "75vh",
        maxHeight: "75vh",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        padding: 2,
        backgroundColor: "background.paper",
      }}
    >
      <Typography variant="h6" sx={{ mb: 2 }}>
        Chat with {selectedUser.name}
      </Typography>

      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          paddingRight: 1,
          marginBottom: 2,
        }}
      >
        <Stack spacing={1}>
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
                    maxWidth: "80%", // slightly wider bubbles
                    backgroundColor:
                      m.senderId === auth.currentUser.uid
                        ? "primary.main"
                        : "grey.300",
                    color:
                      m.senderId === auth.currentUser.uid
                        ? "#fff"
                        : "text.primary",
                  }}
                >
                  <Typography variant="body1">{m.text}</Typography>
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

      <Box
        component="form"
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        sx={{ display: "flex", gap: 1 }}
      >
        <TextField
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
          placeholder="Type a message..."
          fullWidth
          size="small"
          variant="outlined"
        />
        <Button
          type="submit"
          variant="contained"
          size="small"
          sx={{ whiteSpace: "nowrap" }}
        >
          Send
        </Button>
      </Box>
    </Box>
  ) : (
    <Typography align="center" sx={{ mt: 4 }} color="text.secondary">
      Select a user to start chatting
    </Typography>
  );
};

export default Chat;
