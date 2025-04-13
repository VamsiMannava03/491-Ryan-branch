import React, { useState, useEffect } from 'react';
import BattleMap from './BattleMap';
import DiceRoller from './Dice';
import Chat from './Chat';
import { AddItemForm, InventoryGrid, addItemToDatabase, updateItemInDatabase, deleteItemFromDatabase } from './Item';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

function App() {
  // State for map and markers
  const [battleMapImage, setBattleMapImage] = useState('/defaultmap1.png');
  const [icons, setIcons] = useState([
    { id: 1, src: '/redmarker.png', alt: 'Red Marker', left: 760, top: 560 },
    { id: 2, src: '/bluemarker.png', alt: 'Blue Marker', left: 710, top: 560 },
    { id: 3, src: '/greenmarker.png', alt: 'Green Marker', left: 760, top: 510 },
    { id: 4, src: '/yellowmarker.png', alt: 'Yellow Marker', left: 710, top: 510 },
  ]);
  const [showDefaultMaps, setShowDefaultMaps] = useState(false);

  // Inventory state and input fields
  const [inventory, setInventory] = useState([]);
  const [itemName, setItemName] = useState('');
  const [itemQuantity, setItemQuantity] = useState('');

  // Fetching inventory when component mounts (using port 5000)
  useEffect(() => {
    fetch('http://localhost:5000/api/inventory')
      .then(res => res.json())
      .then(data => setInventory(data))
      .catch(err => console.error(err));
  }, []);

  // File upload handler for custom map
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setBattleMapImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  // Handler for selecting a default map
  const handleDefaultMapSelection = (mapPath) => {
    setBattleMapImage(mapPath);
    setShowDefaultMaps(false);
  };

  // Updated handler to add an inventory item
  const handleAddItem = async () => {
    console.log("Add Item button clicked");
    if (!itemName.trim() || !itemQuantity.trim()) return;
    const newItem = {
      name: itemName.trim(),
      quantity: parseInt(itemQuantity, 10)
    };
    try {
      const savedItem = await addItemToDatabase(newItem);
      setInventory([...inventory, savedItem]);
      setItemName('');
      setItemQuantity('');
    } catch (err) {
      console.error("Error adding item:", err);
    }
  };

  // Updated handler to use an item (decrement quantity) using updateItemInDatabase / deleteItemFromDatabase
  const handleUseItem = async (index) => {
    const itemToUpdate = inventory[index];
    const updatedQuantity = itemToUpdate.quantity - 1;
    if (updatedQuantity <= 0) {
      try {
        await deleteItemFromDatabase(itemToUpdate._id);
        setInventory(inventory.filter((_, i) => i !== index));
      } catch (err) {
        console.error("Error deleting item:", err);
      }
    } else {
      try {
        const updatedItem = await updateItemInDatabase(itemToUpdate._id, { ...itemToUpdate, quantity: updatedQuantity });
        setInventory(inventory.map((item, i) => (i === index ? updatedItem : item)));
      } catch (err) {
        console.error("Error updating item:", err);
      }
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div style={{ display: 'flex' }}>
        {/* Left Column: Map Options */}
        <div style={{ width: '200px', padding: '20px', boxSizing: 'border-box' }}>
          <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: '20px', margin: '0 0 10px 0' }}>
            Map Options
          </h2>
          <input type="file" accept="image/*" onChange={handleFileUpload} style={{ width: '100%' }} />
          <button onClick={() => setShowDefaultMaps(prev => !prev)} style={{ marginTop: '10px', width: '100%' }}>
            {showDefaultMaps ? 'Hide Default Maps' : 'Show Default Maps'}
          </button>
          {showDefaultMaps && (
            <div style={{ marginTop: '10px' }}>
              {['1', '2', '3', '4'].map((n) => (
                <img
                  key={n}
                  src={`/defaultmap${n}.png`}
                  alt={`Default Map ${n}`}
                  style={{ width: '100%', cursor: 'pointer', marginBottom: '10px' }}
                  onClick={() => handleDefaultMapSelection(`/defaultmap${n}.png`)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Center Column: Battle Map & Add Item Form */}
        <div style={{ flexGrow: 1, padding: '20px', boxSizing: 'border-box' }}>
          {/* Header with title and DiceRoller side by side */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h1 className="fantasy-title" style={{ margin: 0 }}>Dungeon Dweller Map Test :3</h1>
            <DiceRoller />
          </div>
          <BattleMap mapImage={battleMapImage} icons={icons} setIcons={setIcons} />
          <AddItemForm
            itemName={itemName}
            setItemName={setItemName}
            itemQuantity={itemQuantity}
            setItemQuantity={setItemQuantity}
            handleAddItem={handleAddItem}
          />
        </div>

        {/* Inventory Column: Placed between Battle Map and Chat */}
        <div style={{ width: '300px', padding: '20px', boxSizing: 'border-box' }}>
          <InventoryGrid inventory={inventory} handleUseItem={handleUseItem} />
        </div>

        {/* Chat Column */}
        <div style={{ width: '300px', padding: '20px', boxSizing: 'border-box' }}>
          <Chat />
        </div>
      </div>
    </DndProvider>
  );
}

export default App;
