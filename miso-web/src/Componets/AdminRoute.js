import React from "react";
import { Navigate } from "react-router-dom";
import { useFirebase } from "./firebaseContext";

const AdminRoute = ({ element }) => {
  const { currentUser } = useFirebase();
  console.log("AdminRoute currentUser:", currentUser); // Debug log

  if (!currentUser) {
    return <Navigate to="/" />;
  }

  if (currentUser.role !== "admin") {
    return <Navigate to="/dashboard" />;
  }

  return element;
};

export default AdminRoute;
