import React, { useContext, useState } from "react";
import { useFirebase } from "../Context/firebaseContext";
import { useChat } from "../Context/ChatContext";
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  setDoc,
  updateDoc,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { MsgContext } from "../Context/MsgContext";

const Search = () => {
  const { db } = useFirebase();
  const auth = getAuth();
  const { selectedUser, setSelectedUser } = useContext(MsgContext);
  const [username, setUsername] = useState("");
  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!auth.currentUser) {
      console.error("No authenticated user found.");
      return;
    }

    if (!username.trim()) {
      setErr(true);
      return;
    }

    setLoading(true);
    setErr(false);

    const q = query(collection(db, "users"), where("name", "==", username));

    try {
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        console.log("✅ User found:", userData);
        setSelectedUser(userData);
        setErr(false);
      } else {
        console.warn("⚠ User not found.");
        setErr(true);
      }
    } catch (error) {
      console.error("🚨 Error searching user:", error);
      setErr(true);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleSelect = async () => {
    if (!auth.currentUser || !selectedUser) {
      console.error("⚠ Cannot start chat: Missing currentUser or selectedUser.");
      return;
    }

    const combinedId =
      auth.currentUser.uid > selectedUser.uid
        ? auth.currentUser.uid + selectedUser.uid
        : selectedUser.uid + auth.currentUser.uid;

    try {
      const chatDocRef = doc(db, "chats", combinedId);
      const chatDoc = await getDoc(chatDocRef);

      if (!chatDoc.exists()) {
        console.log("💬 Creating a new chat...");

        await setDoc(chatDocRef, { messages: [] });

        const currentUserInfo = {
          uid: auth.currentUser.uid,
          displayName: auth.currentUser.displayName || "Unknown",
          photoURL: auth.currentUser.photoURL || null,
        };

        const otherUserInfo = {
          uid: selectedUser.uid,
          displayName: selectedUser.name,
          photoURL: selectedUser.photoURL || null,
        };

        await updateDoc(doc(db, "userChats", auth.currentUser.uid), {
          [`${combinedId}.userInfo`]: otherUserInfo,
          [`${combinedId}.date`]: serverTimestamp(),
        });

        await updateDoc(doc(db, "userChats", selectedUser.uid), {
          [`${combinedId}.userInfo`]: currentUserInfo,
          [`${combinedId}.date`]: serverTimestamp(),
        });

        console.log("✅ Chat successfully created!");
      } else {
        console.log("⚡ Chat already exists.");
      }
    } catch (error) {
      console.error("🚨 Error handling chat selection:", error);
    }

    // Preserve selectedUser but clear the input field
    setUsername("");
  };

  console.log("🔍 Selected User:", selectedUser);

  return (
    <SearchContainer>
      <TextField
        label="Search User"
        variant="outlined"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        onKeyDown={handleKey}
        sx={{ marginBottom: 2, width: "100%", maxWidth: "400px" }}
        error={err}
        helperText={err ? "User not found" : ""}
      />

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <Button
          variant="contained"
          onClick={handleSearch}
          sx={{ marginRight: 2, width: "150px" }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Search"}
        </Button>
      </Box>

      {selectedUser && (
        <Box sx={{ marginTop: 2, textAlign: "center" }}>
          <Typography variant="h6">{selectedUser.name}</Typography>
          <Button onClick={handleSelect} variant="contained" sx={{ marginTop: 1 }}>
            Start Chat
          </Button>
        </Box>
      )}
    </SearchContainer>
  );
};

const SearchContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  height: "100vh",
  padding: theme.spacing(2),
  width: "100%",
  backgroundColor: theme.palette.background.paper,
}));

export default Search;
