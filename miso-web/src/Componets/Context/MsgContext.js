import { createContext, useContext, useReducer, useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, onSnapshot } from "firebase/firestore";

export const MsgContext = createContext();

export const MsgContextProvider = ({ children }) => {
  const auth = getAuth();
  const db = getFirestore();

  const INITIAL_STATE = {
    chatId: null,
    user: null,
    currentUser: null,
    messages: [],
  };

  const chatReducer = (state, action) => {
 
  
    switch (action.type) {
      case "CHANGE_USER":
        if (!action.payload || !state.currentUser) return state;
  
        const newChatId =
          state.currentUser.uid > action.payload.uid
            ? state.currentUser.uid + action.payload.uid
            : action.payload.uid + state.currentUser.uid;
  
        console.log("🔄 Updating chatId:", newChatId);
        console.log("Current User:", state.currentUser);
console.log("Selected User:", action.payload);

        
        return {
          ...state,
          user: action.payload,
          chatId: newChatId,
        };
  
      case "SET_CURRENT_USER":
      
        return {
          ...state,
          currentUser: action.payload,
        };
  
      case "SET_MESSAGES":
      
        return {
          ...state,
          messages: action.payload || [],
        };
  
      default:
        return state;
    }
  };
  

  const [state, dispatch] = useReducer(chatReducer, INITIAL_STATE);

  // Listen for Firebase authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      dispatch({ type: "SET_CURRENT_USER", payload: user });

      // If a user was already selected, update chatId again
      if (state.user) {
        dispatch({ type: "CHANGE_USER", payload: state.user });
      }
    });

    return () => unsubscribe();
  }, [auth, state.user]);

  const handleSelectUser = (selectedUser) => {
    if (!state.currentUser) {
      console.warn("Current user is not set yet!");
      return;
    }
    dispatch({ type: "CHANGE_USER", payload: selectedUser });
  };

  // Fetch messages when chatId changes
  useEffect(() => {
    if (!state.chatId) return;

    console.log("🆔 Chat ID Updated:", state.chatId);

    const chatRef = doc(db, "chats", state.chatId);
    const unsubscribe = onSnapshot(chatRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        dispatch({
          type: "SET_MESSAGES",
          payload: docSnapshot.data().messages || [],
        });
      } else {
        dispatch({ type: "SET_MESSAGES", payload: [] });
      }
    });

    return () => unsubscribe();
  }, [state.chatId, db]);

  useEffect(() => {
    console.log("📩 Messages Updated:", state.messages);
  }, [state.messages]);

  return (
    <MsgContext.Provider
      value={{
        data: state,
        dispatch,
        setSelectedUser: handleSelectUser, // Alias handleSelectUser as setSelectedUser
      }}
    >
      {children}
    </MsgContext.Provider>
  );
}