import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import BattleMap from './BattleMap';
import DiceRoller from './Dice';
import Chat from './Chat';
import { AddItemForm, InventoryGrid, addItemToDatabase, updateItemInDatabase, deleteItemFromDatabase } from './Item';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

function App() {
  const { sessionId } = useParams();
  const [username, setUsername] = useState(localStorage.getItem('username') || '');

  const [battleMapImage, setBattleMapImage] = useState('/defaultmap1.png');
  const [icons, setIcons] = useState([
    { id: 1, src: '/redmarker.png', alt: 'Red Marker', left: 760, top: 560 },
    { id: 2, src: '/bluemarker.png', alt: 'Blue Marker', left: 710, top: 560 },
    { id: 3, src: '/greenmarker.png', alt: 'Green Marker', left: 760, top: 510 },
    { id: 4, src: '/yellowmarker.png', alt: 'Yellow Marker', left: 710, top: 510 },
  ]);
  const [showDefaultMaps, setShowDefaultMaps] = useState(false);

  const [inventory, setInventory] = useState([]);
  const [itemName, setItemName] = useState('');
  const [itemQuantity, setItemQuantity] = useState('');

  useEffect(() => {
    if (!username) {
      const entered = prompt("Enter your name for the session:");
      if (entered) {
        setUsername(entered);
        localStorage.setItem('username', entered);
      }
    }
  }, [username]);

  useEffect(() => {
    fetch(`http://localhost:5000/api/inventory?sessionId=${sessionId}`)
      .then(res => res.json())
      .then(data => setInventory(data))
      .catch(err => console.error(err));
  }, [sessionId]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setBattleMapImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleDefaultMapSelection = (mapPath) => {
    setBattleMapImage(mapPath);
    setShowDefaultMaps(false);
  };

  const handleAddItem = async () => {
    if (!itemName.trim() || !itemQuantity.trim()) return;
    const newItem = { name: itemName.trim(), quantity: parseInt(itemQuantity, 10) };
    try {
      const res = await addItemToDatabase(newItem, sessionId);
      setInventory([...inventory, res]);
      setItemName('');
      setItemQuantity('');
    } catch (err) {
      console.error("Error adding item:", err);
    }
  };

  const handleUseItem = async (index) => {
    const item = inventory[index];
    const updatedQty = item.quantity - 1;
    try {
      if (updatedQty <= 0) {
        await deleteItemFromDatabase(item._id, sessionId);
        setInventory(inventory.filter((_, i) => i !== index));
      } else {
        const updatedItem = await updateItemInDatabase(item._id, { ...item, quantity: updatedQty }, sessionId);
        setInventory(inventory.map((i, idx) => (idx === index ? updatedItem : i)));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div style={{ display: 'flex' }}>
        <div style={{ width: '200px', padding: '20px', boxSizing: 'border-box' }}>
          <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: '20px', margin: '0 0 10px 0' }}>Map Options</h2>
          <input type="file" accept="image/*" onChange={handleFileUpload} style={{ width: '100%' }} />
          <button onClick={() => setShowDefaultMaps(prev => !prev)} style={{ marginTop: '10px', width: '100%' }}>
            {showDefaultMaps ? 'Hide Default Maps' : 'Show Default Maps'}
          </button>
          {showDefaultMaps && (
            <div style={{ marginTop: '10px' }}>
              {[1, 2, 3, 4].map(n => (
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

        <div style={{ flexGrow: 1, padding: '20px', boxSizing: 'border-box' }}>
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

        <div style={{ width: '300px', padding: '20px', boxSizing: 'border-box' }}>
          <InventoryGrid inventory={inventory} handleUseItem={handleUseItem} />
        </div>

        <div style={{ width: '300px', padding: '20px', boxSizing: 'border-box' }}>
          <Chat room={sessionId} username={username} />
        </div>
      </div>
    </DndProvider>
  );
}

export default App;
