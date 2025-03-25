import React, { useState, useEffect } from "react";
import { useFirebase } from "./firebaseContext";
import { collection, getDocs, onSnapshot, addDoc, updateDoc, doc } from "firebase/firestore";

function ManageInventory() {
    const { db } = useFirebase();
    const [inventory, setInventory] = useState([]);
    const [itemName, setItemName] = useState("");
    const [quantity, setQuantity] = useState(0);

    // Fetch inventory data on mount
    useEffect(() => {
        const fetchInventory = async () => {
            const inventoryCollection = collection(db, "inventory");
            const inventorySnapshot = await getDocs(inventoryCollection);
            setInventory(inventorySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        };

        fetchInventory();

        // Real-time updates
        const unsubscribe = onSnapshot(collection(db, "inventory"), (snapshot) => {
            setInventory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        return () => unsubscribe(); // Cleanup listener on unmount
    }, [db]);

    // Add new item to inventory
    const handleAddItem = async (e) => {
        e.preventDefault();
        if (!itemName || quantity <= 0) {
            alert("Please enter a valid item and quantity.");
            return;
        }
        try {
            await addDoc(collection(db, "inventory"), { name: itemName, quantity });
            setItemName("");
            setQuantity(0);
        } catch (error) {
            console.error("Error adding item:", error);
        }
    };

    // Update item quantity
    const updateItemQuantity = async (id, newQuantity) => {
        if (newQuantity < 0) return;
        try {
            const itemRef = doc(db, "inventory", id);
            await updateDoc(itemRef, { quantity: newQuantity });
        } catch (error) {
            console.error("Error updating quantity:", error);
        }
    };

    return (
        <div>
            <h2>Inventory Management</h2>
            <form onSubmit={handleAddItem}>
                <input 
                    type="text" 
                    placeholder="Item Name" 
                    value={itemName} 
                    onChange={(e) => setItemName(e.target.value)} 
                />
                <input 
                    type="number" 
                    placeholder="Quantity" 
                    value={quantity} 
                    onChange={(e) => setQuantity(Number(e.target.value))} 
                />
                <button type="submit">Add Item</button>
            </form>

            <h3>Inventory List</h3>
            <table>
                <thead>
                    <tr>
                        <th>Item Name</th>
                        <th>Quantity</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {inventory.map((item) => (
                        <tr key={item.id}>
                            <td>{item.name}</td>
                            <td>{item.quantity}</td>
                            <td>
                                <button onClick={() => updateItemQuantity(item.id, item.quantity + 1)}>+</button>
                                <button onClick={() => updateItemQuantity(item.id, item.quantity - 1)}>-</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default ManageInventory;
