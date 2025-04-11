import React, { useContext, useState } from "react";
import { useFirebase } from "../Context/firebaseContext";
import { MsgContext } from "../Context/MsgContext";
import {
  arrayUnion,
  doc,
  serverTimestamp,
  Timestamp,
  updateDoc,
  setDoc,
} from "firebase/firestore";
import { v4 as uuid } from "uuid";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";

// Material UI Components
import { TextField, Button, IconButton, CircularProgress } from "@mui/material";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";

const Input = () => {
  const { db, storage, currentUser } = useFirebase();
  const [text, setText] = useState("");
  const [img, setImg] = useState(null);
  const [loading, setLoading] = useState(false); // Loading state for file uploads

  const { data } = useContext(MsgContext);

  // Function to upload image
  const uploadImage = async (file) => {
    const storageRef = ref(storage, `images/${uuid()}`);
    const uploadTask = uploadBytesResumable(storageRef, file);
    return new Promise((resolve, reject) => {
      uploadTask.on("state_changed", null, reject, async () => {
        const imgURL = await getDownloadURL(uploadTask.snapshot.ref());
        resolve(imgURL);
      });
    });
  };

  const handleSend = async () => {
    if (!text.trim() && !img) return; // Prevent sending empty messages

    try {
      setLoading(true);
      let imgURL = null;

      if (img) {
        imgURL = await uploadImage(img); // Upload image and get URL
      }

      // Check if chat document exists, if not create a new one
      const chatDocRef = doc(db, "chats", data.chatId);
      const chatDoc = await chatDocRef.get();

      if (!chatDoc.exists) {
        await setDoc(chatDocRef, {
          messages: [
            {
              id: uuid(),
              text,
              senderId: currentUser.uid,
              date: Timestamp.now(),
              img: imgURL || null,
            },
          ],
        });
      } else {
        // Add message to existing chat
        await updateDoc(chatDocRef, {
          messages: arrayUnion({
            id: uuid(),
            text,
            senderId: currentUser.uid,
            date: Timestamp.now(),
            img: imgURL || null,
          }),
        });
      }

      // Update last message and timestamp in userChats collection
      const lastMessageUpdate = {
        [`${data.chatId}.lastMessage`]: { text },
        [`${data.chatId}.date`]: serverTimestamp(),
      };

      await updateDoc(doc(db, "userChats", currentUser.uid), lastMessageUpdate);
      await updateDoc(doc(db, "userChats", data.user.uid), lastMessageUpdate);

      // Clear input and image state after sending message
      setText("");
      setImg(null);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    <div
      className="input"
      style={{ display: "flex", alignItems: "center", padding: "10px" }}
    >
      <TextField
        label="Type something..."
        variant="outlined"
        fullWidth
        size="small"
        value={text}
        onChange={(e) => setText(e.target.value)}
        sx={{ marginRight: "10px" }}
      />

      {/* Attach File */}
      <IconButton
        color="primary"
        component="label"
        htmlFor="file-upload"
        sx={{ marginRight: "10px" }}
      >
        <AttachFileIcon />
        <input
          type="file"
          id="file-upload"
          hidden
          onChange={(e) => setImg(e.target.files[0])}
        />
      </IconButton>

      {/* Upload Image */}
      <IconButton
        color="primary"
        component="label"
        htmlFor="file-upload"
        sx={{ marginRight: "10px" }}
      >
        <PhotoCameraIcon />
        <input
          type="file"
          id="file-upload"
          hidden
          onChange={(e) => setImg(e.target.files[0])}
        />
      </IconButton>

      {/* Send Button */}
      <Button
        variant="contained"
        color="primary"
        onClick={handleSend}
        disabled={(!text.trim() && !img) || loading}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : "Send"}
      </Button>
    </div>
  );
};

export default Input;
