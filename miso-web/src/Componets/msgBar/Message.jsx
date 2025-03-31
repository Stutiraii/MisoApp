import React, { useContext, useEffect, useRef } from "react";
import { MsgContext } from "../Context/MsgContext"; 
import { useFirebase } from "../Context/firebaseContext"; 
import { getAuth } from "firebase/auth";  // Firebase Authentication
import { Box, Typography, Avatar } from "@mui/material";  // MUI Avatar for better image handling

// Message component to display individual messages
const Message = ({ message }) => {
    const auth = getAuth();
    const currentUser = auth.currentUser;  // Get current user from Firebase auth
    const { db } = useFirebase();  // Firebase setup (optional, depending on your Firebase logic)
    const { data } = useContext(MsgContext);  // Assuming you're using MsgContext to store user data

    const ref = useRef();

    useEffect(() => {
        // Scroll the message into view when a new message arrives
        ref.current?.scrollIntoView({ behavior: "smooth" });
    }, [message]);

    if (!message || !currentUser) return null;  // Return null if there's no message or current user

    // Format the timestamp (optional)
    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        return `${date.getHours()}:${date.getMinutes()}`;
    };

    return (
        <Box
            ref={ref}
            sx={{
                display: "flex",
                flexDirection: message.senderId === currentUser.uid ? "row-reverse" : "row",  // Align based on sender
                marginBottom: 2,
                padding: 2,
                backgroundColor: message.senderId === currentUser.uid ? "#3b82f6" : "#e5e7eb", // Different background colors
                borderRadius: 2,
                maxWidth: "70%",
                alignSelf: message.senderId === currentUser.uid ? "flex-end" : "flex-start", // Align message right/left
                transition: "background-color 0.3s ease", // Smooth transition effect for background color
            }}
        >
            {/* Sender's Avatar */}
            <Box sx={{ display: "flex", alignItems: "center", marginRight: 1 }}>
                <Avatar
                    src={
                        message.senderId === currentUser.uid
                            ? currentUser.photoURL
                            : data?.user?.photoURL || "default-avatar.png"
                    }
                    alt="User Avatar"
                    sx={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        objectFit: "cover",
                    }}
                />
            </Box>

            {/* Message Content */}
            <Box sx={{ flex: 1 }}>
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                    <Typography
                        variant="body2"
                        sx={{
                            fontSize: "14px",
                            color: message.senderId === currentUser.uid ? "white" : "black",
                            wordBreak: "break-word",  // Ensure long words break and don't overflow
                        }}
                    >
                        {message.text || "No message content"}
                    </Typography>

                    {/* Optional image attachment */}
                    {message.img && (
                        <Box sx={{ marginTop: 1 }}>
                            <img
                                src={message.img}
                                alt="Attachment"
                                style={{ maxWidth: "100%", borderRadius: 8 }}
                            />
                        </Box>
                    )}
                </Box>

                {/* Timestamp */}
                <Typography
                    variant="body2"
                    sx={{
                        fontSize: "10px",
                        color: "#9ca3af",
                        textAlign: "right",
                        marginTop: 1,
                    }}
                >
                    {message.timestamp ? formatTimestamp(message.timestamp) : "just now"}
                </Typography>
            </Box>
        </Box>
    );
};

export default Message;
