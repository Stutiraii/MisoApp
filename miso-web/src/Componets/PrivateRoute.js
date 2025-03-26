import React from "react";
import { Navigate } from "react-router-dom";
import { useFirebase } from "./firebaseContext";

const PrivateRoute = ({ element }) => {
  const { currentUser } = useFirebase();  // Get the current user from context

  if (!currentUser) {
    // Redirect to login if there's no user
    return <Navigate to="/" />;
  }

  return element;  // Return the element (Dashboard) if the user is authenticated
};

export default PrivateRoute;
