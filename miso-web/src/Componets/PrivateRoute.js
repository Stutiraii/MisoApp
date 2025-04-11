import React from "react";
import { Navigate } from "react-router-dom";
import { useFirebase } from "./Context/firebaseContext";

const PrivateRoute = ({ element }) => {
  const { currentUser, loading } = useFirebase();  // include loading state

  if (loading) {
    return <div>Loading...</div>;  // or a spinner/loading page
  }

  if (!currentUser) {
    return <Navigate to="/" />;
  }

  return element;
};

export default PrivateRoute;
