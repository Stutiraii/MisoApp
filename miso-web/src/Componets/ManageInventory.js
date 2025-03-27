import React, { useState, useEffect } from "react";
import { useFirebase } from "./firebaseContext";
import { collection, getDocs, onSnapshot, addDoc, updateDoc, doc } from "firebase/firestore";
import { Card, TextField, Button, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";

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
      setInventory(inventorySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };

    fetchInventory();

    // Real-time updates
    const unsubscribe = onSnapshot(collection(db, "inventory"), (snapshot) => {
      setInventory(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
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
    <Card sx={{ padding: 4, maxWidth:"none" , margin: 0,minHeight: "100vh", display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start"}}>
      <Typography variant="h4" gutterBottom>
        Inventory Management
      </Typography>

      <form onSubmit={handleAddItem} style={{ marginBottom: "2rem" }}>
        <TextField
          label="Item Name"
          variant="outlined"
          fullWidth
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          style={{ marginBottom: "1rem" }}
        />
        <TextField
          label="Quantity"
          variant="outlined"
          type="number"
          fullWidth
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          style={{ marginBottom: "1rem" }}
        />
        <TextField
          label="Min Stock"
          variant="outlined"
          type="number"
          fullWidth
          value={minStock}
          onChange={(e) => setMinStock(Number(e.target.value))}
          style={{ marginBottom: "1rem" }}
        />
        <TextField
          label="Max Stock"
          variant="outlined"
          type="number"
          fullWidth
          value={maxStock}
          onChange={(e) => setMaxStock(Number(e.target.value))}
          style={{ marginBottom: "1rem" }}
        />
        <Button variant="contained" color="primary" type="submit">
          Add Item
        </Button>
      </form>

      <Typography variant="h5" gutterBottom>
        Inventory List
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Item Name</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Min Stock</TableCell>
              <TableCell>Max Stock</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {inventory.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.name}</TableCell>
                <TableCell style={{ color: item.quantity < item.minStock ? "red" : "black" }}>
                  {item.quantity} {item.quantity < item.minStock && "⚠️ Low Stock!"}
                </TableCell>
                <TableCell>{item.minStock}</TableCell>
                <TableCell>{item.maxStock}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => updateItemQuantity(item.id, item.quantity, 1)}
                    disabled={item.quantity >= item.maxStock}
                    sx={{ marginRight: 1 }}
                  >
                    +
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => updateItemQuantity(item.id, item.quantity, -1)}
                  >
                    -
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
}

export default ManageInventory;
