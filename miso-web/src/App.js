import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./Componets/Login";
import SignUp from "./Componets/SignUp";
import PrivateRoute from "./Componets/PrivateRoute";
import Dashboard from "./Componets/Dashboard";
import ShiftCalendar from "./Componets/ShiftCalendar";
import AdminSchedule from "./Componets/AdminSchedule"; // Import AdminSchedule
import ViewSchedule from "./Componets/ViewSchedule"; // Import ViewSchedule
import ManageInventory from "./Componets/ManageInventory"; // Import ManageInventory
import Sidebar from "./Componets/msgBar/Sidebar";
import Chat from "./Componets/msgBar/Chat";
import { MsgContextProvider } from "./Componets/Context/MsgContext";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import "./styles/App.css";
import { ColorModeProvider } from "./customizations/ColorModeContext";


function App() {
  const [user, setUser] = useState(null);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, [auth]);

  return (
    <ColorModeProvider>
    <div>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        
        {/* Dashboard Route */}
        <Route
          path="/dashboard/*"
          element={
          <MsgContextProvider>
          <PrivateRoute user={user} element={<Dashboard />} />
          </MsgContextProvider>}
        />

        <Route
          path="/AdminSchedule"
          element={<PrivateRoute user={user} element={<AdminSchedule />} />}
        />
        <Route
          path="/sidebar"
          element={
            <MsgContextProvider>
              <PrivateRoute user={user} element={<Sidebar />} />
            </MsgContextProvider>
          }
        />
        <Route
          path="/chat"
          element={
            <MsgContextProvider>
              <PrivateRoute user={user} element={<Chat />} />
            </MsgContextProvider>
          }
        />  
          <Route
          path="/ManageInventory"
          element={<PrivateRoute user={user} element={<ManageInventory />} />}
        />
        <Route path="/calendar" element={<ShiftCalendar />} />
        <Route path='/ViewSchedule' element={<PrivateRoute user={user} element={<ViewSchedule />} />} />
      </Routes>
    </div>
    </ColorModeProvider>
  );
}

export default App;