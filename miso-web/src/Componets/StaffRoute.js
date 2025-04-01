import React from "react";
import { Navigate } from "react-router-dom";
import { useFirebase } from "./firebaseContext";

const StaffRoute = ({ element }) => {
  const { currentUser } = useFirebase(); // Get the current user from context

  if (!currentUser) {
    // Redirect to login if there's no user
    return <Navigate to="/" />;
  }

  if (currentUser.role !== "staff") {
    // Option 1: Redirect non-staff (admins) to admin dashboard if you want a strict separation
    return <Navigate to="/admin" />;
    // Option 2: Alternatively, you could allow admins to access staff routes if that's desired.
  }

  return element; // Return the element if the user is staff
};

export default StaffRoute;
