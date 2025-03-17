import { Navigate } from "react-router-dom";
import { useFirebase } from "./firebaseContext";

const PrivateRoute = ({ element }) => {
  const { auth } = useFirebase();

  return auth.currentUser ? element : <Navigate to="/login" />;
};

export default PrivateRoute;
/**To prevent unauthorized userss from accessing the application, we can create a PrivateRoute component that redirects users to the login page if they are not authenticated. 
 * The PrivateRoute component uses the useFirebase hook to access the currentUser property from the Firebase context.
 *  If the currentUser is not present, the component redirects the user to the login page using the Navigate component from react-router-dom. 
 * The PrivateRoute component can be used in the App component to protect routes that require authentication.
 */