import React, { useState } from 'react';

export async function addItemToDatabase(newItem) {
  console.log("Sending POST request with:", newItem);
  try {
    const response = await fetch('http://localhost:4000/api/inventory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem)
    });
    if (!response.ok) {
      throw new Error('Failed to add item');
    }
    return await response.json();
  } catch (err) {
    console.error("Error adding item", err);
    throw err;
  }
}

export async function updateItemInDatabase(itemId, updatedData) {
  try {
    const response = await fetch(`http://localhost:4000/api/inventory/${itemId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData)
    });
    if (!response.ok) {
      throw new Error('Failed to update item');
    }
    return await response.json();
  } catch (err) {
    console.error("Error updating item", err);
    throw err;
  }
}

export async function deleteItemFromDatabase(itemId) {
  try {
    const response = await fetch(`http://localhost:4000/api/inventory/${itemId}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      throw new Error('Failed to delete item');
    }
    return await response.json();
  } catch (err) {
    console.error("Error deleting item", err);
    throw err;
  }
}


function HoverButton({ children, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onClick}
      style={{
        border: 'none',
        borderRadius: 4,
        padding: '5px 10px',
        cursor: 'pointer',
        background: 'transparent',
        transition: 'box-shadow 0.2s',
        boxShadow: hover ? '0 0 8px red' : 'none'
      }}
    >
      {children}
    </button>
  );
}

export function AddItemForm({ itemName, setItemName, itemQuantity, setItemQuantity, handleAddItem }) {
  return (
    <div>
      <h3
        style={{
          fontFamily: 'Cinzel, serif',
          fontSize: 18,
          margin: '0 0 10px',
          textAlign: 'center'
        }}
      >
        Add an Item
      </h3>
      <div>
        <input
          type="text"
          placeholder="Item Name"
          value={itemName}
          onChange={e => setItemName(e.target.value)}
          style={{ marginRight: 10, padding: 5, width: '50%' }}
        />
        <input
          type="number"
          placeholder="Quantity"
          value={itemQuantity}
          onChange={e => setItemQuantity(e.target.value)}
          style={{ marginRight: 10, padding: 5, width: '25%' }}
        />
        <div style={{ textAlign: 'center', marginTop: 10 }}>
          <HoverButton onClick={handleAddItem}>Add</HoverButton>
        </div>
      </div>
    </div>
  );
}

export function InventoryGrid({ inventory, handleUseItem }) {
  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #fff1f0, #ffe4e1)',
        border: '2px solid red',
        borderRadius: 8,
        padding: 20,
        boxSizing: 'border-box',
        height: '100%',
        overflowY: 'auto',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
      }}
    >
      <h3
        style={{
          fontFamily: 'Cinzel, serif',
          fontSize: 18,
          margin: '0 0 10px',
          textAlign: 'center',
          textShadow: '1px 1px 2px rgba(0,0,0,0.2)'
        }}
      >
        Inventory
      </h3>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
          gap: 10
        }}
      >
        {inventory.map((item, index) => (
          <div
            key={index}
            style={{
              background: 'white',
              borderRadius: 6,
              padding: 10,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
            }}
          >
            <div style={{ fontWeight: 'bold', marginBottom: 5 }}>{item.name}</div>
            <div style={{ marginBottom: 10 }}>Qty: {item.quantity}</div>
            <HoverButton onClick={() => handleUseItem(index)}>Use Item</HoverButton>
          </div>
        ))}
      </div>
    </div>
  );
}
