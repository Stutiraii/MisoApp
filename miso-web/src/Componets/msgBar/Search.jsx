import React, { useContext, useState } from "react";
import { useFirebase } from "../Context/firebaseContext";
import { useChat } from "../Context/ChatContext";
import { Box, Button, TextField, Typography, CircularProgress } from "@mui/material";
import { styled } from "@mui/material/styles";
import { collection, getDocs, query, where, doc, setDoc, updateDoc, serverTimestamp, getDoc } from "firebase/firestore";
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
      if (!auth.currentUser) return;
  
      setLoading(true);
      setErr(false);
  
      const q = query(collection(db, "users"), where("name", "==", username));
  
      try {
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          console.log("User found:", querySnapshot.docs[0].data());
          setSelectedUser(querySnapshot.docs[0].data()); // Update selectedUser here
          setErr(false);
        } else {
          setErr(true);
        }
      } catch (error) {
        console.error("Error searching user:", error);
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
      if (!auth.currentUser || !selectedUser) return;
  
      const combinedId =
        auth.currentUser.uid > selectedUser.uid
          ? auth.currentUser.uid + selectedUser.uid
          : selectedUser.uid + auth.currentUser.uid;
  
      try {
        const res = await getDoc(doc(db, "chats", combinedId));
  
        if (!res.exists()) {
          await setDoc(doc(db, "chats", combinedId), { messages: [] });
  
          const currentUserInfo = {
            uid: auth.currentUser.uid,
            displayName: auth.currentUser.displayName,
          };
          const otherUserInfo = {
            uid: selectedUser.uid,
            displayName: selectedUser.name,
          };
  
          if (auth.currentUser.photoURL) {
            currentUserInfo.photoURL = auth.currentUser.photoURL;
          }
          if (selectedUser.photoURL) {
            otherUserInfo.photoURL = selectedUser.photoURL;
          }
  
          await setDoc(doc(db, "userChats", auth.currentUser.uid), {}, { merge: true });
          await setDoc(doc(db, "userChats", selectedUser.uid), {}, { merge: true });
  
          await updateDoc(doc(db, "userChats", auth.currentUser.uid), {
            [`${combinedId}.userInfo`]: otherUserInfo,
            [`${combinedId}.date`]: serverTimestamp(),
          });
  
          await updateDoc(doc(db, "userChats", selectedUser.uid), {
            [`${combinedId}.userInfo`]: currentUserInfo,
            [`${combinedId}.date`]: serverTimestamp(),
          });
        }
      } catch (error) {
        console.error("Error handling chat selection:", error);
      }
  
      // Set selected user and clear the username input
      setSelectedUser(null); // Clear selected user after starting the chat
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
          helperText={err && "User not found"}
        />
  
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%" }}>
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
            <Button onClick={handleSelect}>Start Chat</Button>
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
