import React, { useState, useEffect} from "react";
import { useFirebase } from "./firebaseContext";
import { getAuth } from "firebase/auth";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { Link } from "react-router-dom";
import "../styles/Admin.css";

function Admin() {
    const { db, auth } = useFirebase();
    const [users, setUsers] = useState([]);
    const [date, setDate] = useState("");
    const [ shiftStart, setShiftStart] = useState("");
    const [shiftEnd, setShiftEnd] = useState("");
    const [selectRole, setSelectRole] = useState("");
    const [selectUser, setSelectUser] = useState("");
    const [error, setError] = useState("");
    

useEffect(() => {
    const fetchUsers = async () => {
        const usersRef = collection(db, "users");
        const snapshot = await getDocs(usersRef);
        setUsers(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };

    const fetchRoles = async () => {
        const rolesRef = collection(db, "roles");
        const snapshot = await getDocs(rolesRef);
        setRoles(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };

    fetchUsers();
    fetchRoles();
});
}