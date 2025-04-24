import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import socket from './socket'; // ✅ added for socket functionality

import BattleMap from './BattleMap';
import Chat from './Chat';
import { AddItemForm, InventoryGrid, addItemToDatabase, updateItemInDatabase, deleteItemFromDatabase } from './Item';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import SideMenu from './SideMenu';

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
  const [activeTab, setActiveTab] = useState('chat');

  useEffect(() => {
    if (!username) {
      const entered = prompt("Enter your name for the session:");
      if (entered) {
        setUsername(entered);
        localStorage.setItem('username', entered);
      }
    }
  }, [username]);

  // 📡 joinRoom with socket.io
  useEffect(() => {
    if (username && sessionId) {
      console.log("📡 EMITTING joinRoom!", { username, sessionId });
      socket.emit("joinRoom", { username, room: sessionId });
    }
  }, [username, sessionId]);

  const fetchInventory = async () => {
    const res = await fetch(`http://localhost:4000/api/inventory?sessionId=${sessionId}`);
    const data = await res.json();
    setInventory(data);
  };

  useEffect(() => {
    fetchInventory();
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
      await addItemToDatabase(newItem, sessionId);
      await fetchInventory();
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
      <div style={{ display: 'flex', height: '100vh' }}>
        <div style={{ flexGrow: 1, padding: '20px', boxSizing: 'border-box', overflowY: 'auto' }}>
          <h1 style={{ fontFamily: 'Cinzel, serif', margin: 0, textAlign: 'center' }}>Dungeon Dweller</h1>
          <BattleMap mapImage={battleMapImage} icons={icons} setIcons={setIcons} />
        </div>

        <div style={{ width: '300px', boxSizing: 'border-box', backgroundColor: '#f5f5f5', display: 'flex', flexDirection: 'column', height: '100vh', borderLeft: '2px solid #ccc' }}>
          <SideMenu activeTab={activeTab} setActiveTab={setActiveTab} />
          <div style={{ flexGrow: 1, padding: '0 10px', display: 'flex', flexDirection: 'column' }}>
            {activeTab === 'inventory' && (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ flexGrow: 1, overflowY: 'auto' }}>
                  <InventoryGrid inventory={inventory} handleUseItem={handleUseItem} />
                </div>
                <div style={{ borderTop: '1px solid #ccc', padding: '10px 0', backgroundColor: '#f5f5f5' }}>
                  <AddItemForm
                    itemName={itemName}
                    setItemName={setItemName}
                    itemQuantity={itemQuantity}
                    setItemQuantity={setItemQuantity}
                    handleAddItem={handleAddItem}
                  />
                </div>
              </div>
            )}
            {activeTab === 'chat' && (
              <div style={{ paddingTop: '10px' }}>
                <h3 style={{ fontFamily: 'Cinzel, serif' }}>💬 Chat</h3>
                <Chat room={sessionId} username={username} />
              </div>
            )}
            {activeTab === 'character' && (
              <div style={{ paddingTop: '10px' }}>
                <h3 style={{ fontFamily: 'Cinzel, serif' }}>🧝 Character Sheet</h3>
                <p style={{ fontFamily: 'Cinzel, serif' }}>Coming soon: view and edit your character’s stats and bio here.</p>
              </div>
            )}
            {activeTab === 'map' && (
              <div style={{ paddingTop: '10px' }}>
                <h3 style={{ fontFamily: 'Cinzel, serif', marginBottom: '10px' }}>🗺️ Change Battle Map</h3>
                <input type="file" accept="image/*" onChange={handleFileUpload} style={{ width: '100%', marginBottom: '10px' }} />
                <button onClick={() => setShowDefaultMaps(prev => !prev)} style={{ width: '100%', marginBottom: '10px' }}>
                  {showDefaultMaps ? 'Hide Default Maps' : 'Show Default Maps'}
                </button>
                {showDefaultMaps && (
                  <div>
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
            )}
          </div>
        </div>
      </div>
    </DndProvider>
  );
}

export default App;