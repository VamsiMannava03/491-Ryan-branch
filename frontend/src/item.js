import React from 'react';

// Item API functions
export async function addItemToDatabase(newItem) {
  console.log("Sending POST request with:", newItem);
  try {
    const response = await fetch('http://localhost:5000/api/inventory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem)
    });
    if (!response.ok) {
      throw new Error('Failed to add item');
    }
    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Error adding item", err);
    throw err;
  }
}

export async function updateItemInDatabase(itemId, updatedData) {
  try {
    const response = await fetch(`http://localhost:5000/api/inventory/${itemId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData)
    });
    if (!response.ok) {
      throw new Error('Failed to update item');
    }
    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Error updating item", err);
    throw err;
  }
}

export async function deleteItemFromDatabase(itemId) {
  try {
    const response = await fetch(`http://localhost:5000/api/inventory/${itemId}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      throw new Error('Failed to delete item');
    }
    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Error deleting item", err);
    throw err;
  }
}

// UI Components for Items remain the same
export function AddItemForm({ itemName, setItemName, itemQuantity, setItemQuantity, handleAddItem }) {
  return (
    <div style={{ marginTop: '20px' }}>
      <h3 className="fantasy-title" style={{ fontSize: '18px', margin: '0 0 10px 0' }}>
        Add an Item
      </h3>
      <div>
        <input
          type="text"
          placeholder="Item Name"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          style={{ marginRight: '10px', padding: '5px' }}
        />
        <input
          type="number"
          placeholder="Quantity"
          value={itemQuantity}
          onChange={(e) => setItemQuantity(e.target.value)}
          style={{ marginRight: '10px', padding: '5px' }}
        />
        <button onClick={handleAddItem} style={{ padding: '5px 10px' }}>
          Add Item
        </button>
      </div>
    </div>
  );
}

export function InventoryGrid({ inventory, handleUseItem }) {
  return (
    <div
      style={{
        backgroundColor: '#f5f5f5',
        border: '1px solid #ccc',
        padding: '20px',
        boxSizing: 'border-box',
        height: '600px',
        overflowY: 'auto'
      }}
    >
      <h3 className="fantasy-title" style={{ fontSize: '18px', margin: '0 0 10px 0' }}>
        Inventory
      </h3>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
          gap: '10px'
        }}
      >
        {inventory.map((item, index) => (
          <div
            key={index}
            style={{
              border: '2px solid #006400',
              borderRadius: '4px',
              padding: '10px',
              textAlign: 'center',
              boxSizing: 'border-box',
              backgroundColor: '#f5f5f5',
              height: '100px',
              aspectRatio: '1'
            }}
          >
            <div style={{ fontWeight: 'bold' }}>{item.name}</div>
            <div>Qty: {item.quantity}</div>
            <button
              onClick={() => handleUseItem(index)}
              style={{ marginTop: '5px', padding: '2px 5px' }}
            >
              Use Item
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
