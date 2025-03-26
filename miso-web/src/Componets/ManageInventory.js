import React, { useState, useEffect } from "react";
import { useFirebase } from "./firebaseContext";
import { collection, getDocs, onSnapshot, addDoc, updateDoc, doc } from "firebase/firestore";

function ManageInventory() {
    const { db } = useFirebase();
    const [inventory, setInventory] = useState([]);
    const [itemName, setItemName] = useState("");
    const [quantity, setQuantity] = useState(0);
    const [minStock, setMinStock] = useState(1);
    const [maxStock, setMaxStock] = useState(100);

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
        if (!itemName || quantity < minStock || quantity > maxStock) {
            alert("Please enter a valid item name and ensure quantity is within the allowed range.");
            return;
        }
        try {
            await addDoc(collection(db, "inventory"), { name: itemName, quantity, minStock, maxStock });
            setItemName("");
            setQuantity(0);
        } catch (error) {
            console.error("Error adding item:", error);
        }
    };

    // Update item quantity
    const updateItemQuantity = async (id, currentQuantity, change) => {
        const newQuantity = currentQuantity + change;
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
                <input 
                    type="number" 
                    placeholder="Min Stock" 
                    value={minStock} 
                    onChange={(e) => setMinStock(Number(e.target.value))} 
                />
                <input 
                    type="number" 
                    placeholder="Max Stock" 
                    value={maxStock} 
                    onChange={(e) => setMaxStock(Number(e.target.value))} 
                />
                <button type="submit">Add Item</button>
            </form>

            <h3>Inventory List</h3>
            <table>
                <thead>
                    <tr>
                        <th>Item Name</th>
                        <th>Quantity</th>
                        <th>Min</th>
                        <th>Max</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {inventory.map((item) => (
                        <tr key={item.id}>
                            <td>{item.name}</td>
                            <td style={{ color: item.quantity < item.minStock ? "red" : "black" }}>
                                {item.quantity} {item.quantity < item.minStock && "⚠️ Low Stock!"}
                            </td>
                            <td>{item.minStock}</td>
                            <td>{item.maxStock}</td>
                            <td>
                                <button 
                                    onClick={() => updateItemQuantity(item.id, item.quantity, 1)} 
                                    disabled={item.quantity >= item.maxStock}
                                >
                                    +
                                </button>
                                <button onClick={() => updateItemQuantity(item.id, item.quantity, -1)}>-</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default ManageInventory;
