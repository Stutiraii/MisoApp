import react, {useState, useEffect} from "react";
import { useFirebase } from "./firebaseContext";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";

function StaffRoles() {
    const { db, auth } = useFirebase();
    const [roles, setRoles] = useState([]);
    const [role, setRole] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchRoles = async () => {
            const rolesRef = collection(db, "roles");
            const snapshot = await getDocs(rolesRef);
            setRoles(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        };

        fetchRoles();
    }, []);

    const addRole = async (e) => {
        e.preventDefault();
    if (!role.trim()) return alert("Enter a valid role!");
    try  
      {
            await addDoc(collection(db, "roles"), { name: role });
            setRole([...roles, { name: role }]);
            setRole("");
        } catch (error) {
            setError("Error adding role: " + error.message);
        }
    }

 const deleteRole = async (id) => {
    try {
        await deleteDoc(doc(db, "roles", id));
        setRoles(roles.filter((role) => role.id !== id));
    } catch (error) {
        setError("Error deleting role: " + error.message);
    }
};


return (
    <div>
        <h1>Staff Roles</h1>
        <form onSubmit={addRole}>
            <input
                type="text"
                placeholder="Enter a role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
            />
            <button type="submit">Add Role</button>
        </form>
        {error && <p>{error}</p>}
        <ul>
            {roles.map((role) => (
                <li key={role.id}>
                    {role.name}
                    <button onClick={() => deleteRole(role.id)}>Delete</button>
                </li>
            ))}
        </ul>
    </div>
);
}
export default StaffRoles;