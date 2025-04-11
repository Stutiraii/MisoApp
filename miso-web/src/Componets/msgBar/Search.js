import React, { useContext, useState, useEffect } from "react";
import { useFirebase } from "../Context/firebaseContext";
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Paper,
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
  const { data, setSelectedUser } = useContext(MsgContext);
  const { selectedUser } = data;

  const [username, setUsername] = useState("");
  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(false);
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    // Fetch all users when component mounts
    const fetchUsers = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, "users"));
        const users = usersSnapshot.docs
          .map((doc) => doc.data())
          .filter((user) => user.uid !== auth.currentUser?.uid); // exclude self
        setAllUsers(users);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, [db, auth.currentUser]);

  const handleSearch = async () => {
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
        setSelectedUser(userData);
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

  const handleSelect = async (user = selectedUser) => {
    if (!auth.currentUser || !user) return;

    const combinedId =
      auth.currentUser.uid > user.uid
        ? auth.currentUser.uid + user.uid
        : user.uid + auth.currentUser.uid;

    try {
      const chatDocRef = doc(db, "chats", combinedId);
      const chatDoc = await getDoc(chatDocRef);

      if (!chatDoc.exists()) {
        await setDoc(chatDocRef, { messages: [] });

        const currentUserInfo = {
          uid: auth.currentUser.uid,
          displayName: auth.currentUser.displayName || "Unknown",
          photoURL: auth.currentUser.photoURL || null,
        };

        const otherUserInfo = {
          uid: user.uid,
          displayName: user.name,
          photoURL: user.photoURL || null,
        };

        await updateDoc(doc(db, "userChats", auth.currentUser.uid), {
          [`${combinedId}.userInfo`]: otherUserInfo,
          [`${combinedId}.date`]: serverTimestamp(),
        });

        await updateDoc(doc(db, "userChats", user.uid), {
          [`${combinedId}.userInfo`]: currentUserInfo,
          [`${combinedId}.date`]: serverTimestamp(),
        });
      }

      setSelectedUser(user);
      setUsername("");
    } catch (error) {
      console.error("Error handling chat selection:", error);
    }
  };

  return (
    <SearchContainer>
      <TextField
        label="Search User"
        variant="outlined"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        onKeyDown={handleKey}
        sx={{ mb: 2, width: "100%", maxWidth: "400px" }}
        error={err}
        helperText={err ? "User not found" : ""}
      />

      <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
        <Button
          variant="contained"
          fontWeight="bold"
          onClick={handleSearch}
          sx={{ width: "150px" }}
          color="black"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Search"}
        </Button>
      </Box>

      <Paper
        elevation={2}
        sx={{
          width: "100%",
          maxWidth: "400px",
          maxHeight: "300px",
          overflowY: "auto",
          p: 1,
        }}
      >
        <Typography variant="subtitle1" sx={{ mb: 1, textAlign: "center" }}>
          All Users
        </Typography>
        <List>
          {allUsers.map((user) => (
            <ListItem
              key={user.uid}
              button
              onClick={() => handleSelect(user)}
              sx={{
                borderRadius: 2,
                "&:hover": {
                  backgroundColor: "action.hover",
                },
              }}
            >
              <ListItemAvatar>
                <Avatar src={user.photoURL || ""}>
                  {user.name?.charAt(0)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary={user.name} />
            </ListItem>
          ))}
        </List>
      </Paper>
    </SearchContainer>
  );
};

const SearchContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: theme.spacing(2),
}));

export default Search;
