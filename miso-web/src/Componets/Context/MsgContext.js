import { createContext, useContext, useReducer, useEffect } from "react";
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
    selectedUser: null, // Add selectedUser in the state
    messages: [],
  };

  const chatReducer = (state, action) => {
    switch (action.type) {
      case "CHANGE_USER":
        if (!action.payload || !state.currentUser) return state;

        return {
          ...state,
          user: action.payload,
          chatId: [state.currentUser.uid, action.payload.uid].sort().join(""),
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

      case "SET_SELECTED_USER":
        return {
          ...state,
          selectedUser: action.payload, // Update selectedUser in the state
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
    });

    return () => unsubscribe();
  }, [auth]);

  const handleSelectUser = (selectedUser) => {
    if (!state.currentUser) {
      console.warn("Current user is not set yet!");
      return;
    }

    // Dispatch the action to update selectedUser in the state
    dispatch({ type: "SET_SELECTED_USER", payload: selectedUser });

    dispatch({ type: "CHANGE_USER", payload: selectedUser });
  };

  // Fetch messages when chatId changes
  useEffect(() => {
    if (!state.chatId) return;

    const chatRef = doc(db, "chats", state.chatId);
    const unsubscribe = onSnapshot(chatRef, (docSnapshot) => {
      dispatch({
        type: "SET_MESSAGES",
        payload: docSnapshot.exists() ? docSnapshot.data().messages || [] : [],
      });
    });

    return () => unsubscribe();
  }, [state.chatId, db]);

  return (
    <MsgContext.Provider
      value={{
        data: state,
        dispatch,
        setSelectedUser: handleSelectUser,
      }}
    >
      {children}
    </MsgContext.Provider>
  );
};
