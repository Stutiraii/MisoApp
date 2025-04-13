import React, { useState, useEffect } from "react";
import { useFirebase } from "./Context/firebaseContext";
import {
  collection,
  getDocs,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  where,
  doc,
  query
} from "firebase/firestore";
import {
  Card,
  TextField,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  MenuItem,
  Select,
  List,
  ListItem,
  ListItemText,
  FormControl,
  InputLabel,
  InputAdornment,
} from "@mui/material";

function ManageInventory() {
  const { db } = useFirebase();
  const [inventory, setInventory] = useState([]);
  const [categories, setCategories] = useState([]);
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [minStock, setMinStock] = useState(1);
  const [maxStock, setMaxStock] = useState(100);
  const [category, setCategory] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [sortBy, setSortBy] = useState("category");
  const [searchTerm, setSearchTerm] = useState("");
  const [ lowStockItems, setLowStockItems] = useState([]);

  useEffect(() => {
    const fetchInventory = async () => {
      const inventoryCollection = collection(db, "inventory");
      const inventorySnapshot = await getDocs(inventoryCollection);
      setInventory(inventorySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };

    fetchInventory();

    const unsubscribe = onSnapshot(collection(db, "inventory"), (snapshot) => {
      setInventory(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, [db]);

  useEffect(() => {
    const fetchCategories = async () => {
      const categoryCollection = collection(db, "categories");
      const categorySnapshot = await getDocs(categoryCollection);
      setCategories(categorySnapshot.docs.map((doc) => doc.data().name));
    };

    fetchCategories();
  }, [db]);

  const handleAddCategory = async () => {
    if (!newCategory) return;
    try {
      await addDoc(collection(db, "categories"), { name: newCategory });
      setCategories([...categories, newCategory]);
      setNewCategory("");
    } catch (error) {
      console.error("Error adding category:", error);
    }
  };

  const handleDeleteCategory = async (categoryName) => {
    try {
      const categoryRef = collection(db, "categories");
      const categoryDocs = await getDocs(categoryRef);
      const categoryToDelete = categoryDocs.docs.find((doc) => doc.data().name === categoryName);
      if (categoryToDelete) {
        await deleteDoc(doc(db, "categories", categoryToDelete.id));
        setCategories(categories.filter((cat) => cat !== categoryName));
      }
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!itemName || !category || quantity < minStock || quantity > maxStock) {
      alert("Please fill all fields and ensure quantity is within the allowed range.");
      return;
    }
    try {
      await addDoc(collection(db, "inventory"), { name: itemName, quantity, minStock, maxStock, category });
      setItemName("");
      setQuantity(0);
      setCategory("");
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      await deleteDoc(doc(db, "inventory", id));
      setInventory(inventory.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const updateItemQuantity = async (id, currentQuantity, change) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity < 0 || newQuantity > maxStock) return;
    try {
      const itemRef = doc(db, "inventory", id);
      await updateDoc(itemRef, { quantity: newQuantity });
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedInventory = [...filteredInventory].sort((a, b) => {
    if (sortBy === "category") {
      return a.category?.localeCompare(b.category) || a.name.localeCompare(b.name);
    }
    return a.name.localeCompare(b.name);
  });

  useEffect(() => {
    const fetchLowStockItems = async () => {
      const lowStockQuery = query(
        collection(db, "inventory"),
        where("quantity", "<=", minStock)
      );
      const lowStockSnapshot = await getDocs(lowStockQuery);
      const lowStockData = lowStockSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));

      setLowStockItems(lowStockData); // Set low-stock items state
    };
  
    fetchLowStockItems();
  }, [db, inventory]);
  

  return (
    <Card sx={{ padding: 4, Width: "100%", margin: 0, Height: "100vh", display: "flex", flexDirection: "column", justifyContent: "flex-start" }}>
      <Typography variant="h4" gutterBottom>
        Inventory Management
      </Typography>

      {/* Search Bar */}
      <TextField
        label="Search Items"
        variant="outlined"
        fullWidth
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ marginBottom: "1rem" }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">🔍</InputAdornment>
          ),
        }}
      />

      {/* Sort By */}
      <FormControl fullWidth style={{ marginBottom: "1rem" }}>
        <InputLabel>Sort By</InputLabel>
        <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <MenuItem value="category">Category</MenuItem>
          <MenuItem value="name">Item Name</MenuItem>
        </Select>
      </FormControl>

      {/* Categories Section */}
      <Typography variant="h5" gutterBottom>Categories</Typography>
      {categories.map((cat, index) => (
        <div key={index}>
          <Typography>{cat}</Typography>
          <Button variant="contained" color="error" onClick={() => handleDeleteCategory(cat)}>
            Delete
          </Button>
        </div>
      ))}

      {/* Add Category */}
      <Typography variant="h5" gutterBottom>Add Category</Typography>
      <TextField
        label="New Category"
        variant="outlined"
        fullWidth
        value={newCategory}
        onChange={(e) => setNewCategory(e.target.value)}
        style={{ marginBottom: "1rem" }}
      />
      <Button variant="contained" color="primary" onClick={handleAddCategory}>
        Add Category
      </Button>

      {/* Add Item */}
      <Typography variant="h5" gutterBottom>Add Item</Typography>
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
        <FormControl fullWidth style={{ marginBottom: "1rem" }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((cat, index) => (
              <MenuItem key={index} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button variant="contained" color="primary" type="submit">
          Add Item
        </Button>
      </form>

      
      {/* Low Inventory Alert Section */}
      <Card sx={{ padding: 3, marginBottom: 2 }}>
        <Typography variant="h5" gutterBottom color="error">
          🚨 Low Inventory Alerts
        </Typography>
        {lowStockItems.length === 0 ? (
          <Typography>No items are running low.</Typography>
        ) : (
          <List>
            {lowStockItems.map((item) => (
              <ListItem key={item.id}>
                <ListItemText
                  primary={`${item.name} (Stock: ${item.quantity})`}
                  secondary={`Minimum Required: ${item.minStock}`}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Card>

      {/* Inventory List */}
      <Typography variant="h5" gutterBottom>Inventory List</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Category</TableCell>
              <TableCell>Item Name</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Min Stock</TableCell>
              <TableCell>Max Stock</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedInventory.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.category}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>{item.minStock}</TableCell>
                <TableCell>{item.maxStock}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => updateItemQuantity(item.id, item.quantity, 1)}
                    disabled={item.quantity >= item.maxStock}
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
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => handleDeleteItem(item.id)}
                  >
                    Delete
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
