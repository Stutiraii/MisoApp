import { doc, onSnapshot } from "firebase/firestore";
import React, { useContext, useEffect, useState } from "react";
import { useFirebase } from "../Context/firebaseContext";
import { MsgContext } from "../Context/MsgContext";

const Chats = () => {
  const { db, currentUser } = useFirebase(); // Destructure to get both db and currentUser
  const [chats, setChats] = useState({}); // Initialize chats as an empty object
  const { data, dispatch } = useContext(MsgContext); // Access state from MsgContext

  useEffect(() => {
    if (!currentUser?.uid) return; // Make sure currentUser is available
  
    const getChats = () => {
      const unsub = onSnapshot(doc(db, "userChats", currentUser.uid), (docSnapshot) => {
        const data = docSnapshot.data(); // This will give you the user's chat data
        setChats(data || {});  // This will be an object with chatIds and chat data
      });
  
      return () => unsub(); // Cleanup the subscription
    };
  
    getChats();
  }, [currentUser?.uid, db]);

  useEffect(() => {
    if (!data.chatId) return; // If chatId is null, don't fetch messages
  
    const chatRef = doc(db, "chats", data.chatId); // Reference to the chat document in `chats` collection
    const unsub = onSnapshot(chatRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        dispatch({ type: "SET_MESSAGES", payload: docSnapshot.data().messages });  // Set the messages in state
      } else {
        dispatch({ type: "SET_MESSAGES", payload: [] });  // If no messages, set an empty array
      }
    });
  
    return () => unsub(); // Cleanup the subscription
  }, [data.chatId, db, dispatch]);

  const handleSelect = (u) => {
    dispatch({ type: "CHANGE_USER", payload: u });
  };

  return (
    <div className="chats">
      {Object.entries(chats) // Safely use Object.entries() after ensuring chats is an object
        .sort((a, b) => b[1].date - a[1].date) // Sort chats by date (descending)
        .map(([chatId, chatData]) => (
          <div
            className="userChat"
            key={chatId}
            onClick={() => handleSelect(chatData.userInfo)}
          >
            <img src={chatData.userInfo.photoURL} alt={chatData.userInfo.displayName} />
            <div className="userChatInfo">
              <span>{chatData.userInfo.displayName}</span>
              <p>{chatData.lastMessage?.text}</p>
            </div>
          </div>
        ))}
    </div>
  );
};

export default Chats;
