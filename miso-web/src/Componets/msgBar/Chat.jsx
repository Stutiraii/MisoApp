import React, { useState, useEffect } from "react"; // Make sure Firebase is properly initialized
import { collection, query, where, onSnapshot, addDoc } from "firebase/firestore";
import { TextField, Button, CircularProgress } from "@mui/material";
import Message from "./Message"; // Assuming you have a Message component to display each 
import { useFirebase } from "../Context/firebaseContext"; // Firebase context for accessing the 
import { useChat } from "../Context/ChatContext";

const Chat = ({ data, displayName }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const { db } = useFirebase();
  const { selectedUser } = useChat(); 
  useEffect(() => {
    if (!data || !data.chatId) {
      setError("Chat ID not available.");
      setLoading(false);
      return;
    }

    const messagesRef = collection(db, "chats", data.chatId, "messages");
    const q = query(messagesRef);

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const messagesArray = [];
        querySnapshot.forEach((doc) => {
          messagesArray.push({ ...doc.data(), id: doc.id });
        });
        setMessages(messagesArray);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching messages:", err);
        setError("Error fetching messages.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [data]);

  const handleSendMessage = async () => {
    if (!message.trim()) return; // Don't send empty messages

    setLoading(true);
    try {
      await addDoc(collection(db, "chats", data.chatId, "messages"), {
        text: message,
        sender: displayName,
        timestamp: new Date(),
      });
      setMessage(""); // Clear the input after sending
      setLoading(false);
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Error sending message.");
      setLoading(false);
    }
  };

  return (
    <div>
      {loading && !error ? (
        <CircularProgress />
      ) : error ? (
        <div>{error}</div>
      ) : (
        <>
          <div>
            {messages.map((msg) => (
              <Message key={msg.id} sender={msg.sender} text={msg.text} />
            ))}
          </div>

          <TextField
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSendMessage();
            }}
            variant="outlined"
            fullWidth
            multiline
            rows={2}
            placeholder="Type a message..."
          />

          <Button
            onClick={handleSendMessage}
            variant="contained"
            color="primary"
            disabled={loading || !message.trim()}
          >
            Send
          </Button>
        </>
      )}
    </div>
  );
};

export default Chat;
