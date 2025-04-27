import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import socket from './socket';
import BattleMap from './BattleMap';
import Chat from './Chat';
import CharacterSheet from './CharacterSheet';
import {
  AddItemForm,
  InventoryGrid,
  addItemToDatabase,
  updateItemInDatabase,
  deleteItemFromDatabase
} from './item';
import {
  AddSpellForm,
  SpellsGrid,
  addSpellToDatabase,
  deleteSpellFromDatabase
} from './spells';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import SideMenu from './SideMenu';

function App() {
  const { sessionId } = useParams();
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const [host, setHost] = useState('');
  const [userList, setUserList] = useState([]);
  const [kickedUsers, setKickedUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [battleMapImage, setBattleMapImage] = useState('/defaultmap1.png');
  const [icons, setIcons] = useState([
    { id: 1, src: '/redmarker.png',   alt: 'Red Marker',   left: 390, top: 290 },
    { id: 2, src: '/bluemarker.png',  alt: 'Blue Marker',  left: 420, top: 290 },
    { id: 3, src: '/greenmarker.png', alt: 'Green Marker', left: 390, top: 320 },
    { id: 4, src: '/yellowmarker.png',alt: 'Yellow Marker',left: 420, top: 320 }
  ]);
  const [showDefaultMaps, setShowDefaultMaps] = useState(false);
  const [inventory, setInventory] = useState([]);
  const [itemName, setItemName] = useState('');
  const [itemQuantity, setItemQuantity] = useState('');
  const [spells, setSpells] = useState([]);
  const [spellName, setSpellName] = useState('');
  const [spellLevel, setSpellLevel] = useState('');
  const [spellDescription, setSpellDescription] = useState('');
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

  useEffect(() => {
    if (username && sessionId) {
      socket.emit("joinRoom", { username, room: sessionId });
    }
  }, [username, sessionId]);

  useEffect(() => {
    socket.on("hostAssigned", setHost);
    socket.on("kickedUsersList", setKickedUsers);
    socket.on("message", msg => setMessages(ms => [...ms, msg]));
    return () => {
      socket.off("hostAssigned");
      socket.off("kickedUsersList");
      socket.off("message");
    };
  }, []);

  const isHost = username === host;

  const fetchInventory = async () => {
    try {
      const res = await fetch(`http://localhost:4000/api/inventory?sessionId=${sessionId}`);
      setInventory(await res.json());
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(fetchInventory, [sessionId]);

  const fetchSpells = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/spells');
      if (!res.ok) throw new Error('Bad response');
      setSpells(await res.json());
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(fetchSpells, [sessionId]);

  const handleFileUpload = e => {
    const f = e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = ev => setBattleMapImage(ev.target.result);
    r.readAsDataURL(f);
  };

  const handleAddItem = async () => {
    if (!itemName.trim() || !itemQuantity.trim()) return;
    await addItemToDatabase({ name: itemName.trim(), quantity: +itemQuantity });
    setItemName(''); setItemQuantity('');
    fetchInventory();
  };

  const handleUseItem = async i => {
    const it = inventory[i];
    if (!it) return;
    const newQty = it.quantity - 1;
    if (newQty <= 0) {
      await deleteItemFromDatabase(it._id);
    } else {
      await updateItemInDatabase(it._id, { ...it, quantity: newQty });
    }
    fetchInventory();
  };

  const handleAddSpell = async () => {
    if (!spellName.trim() || !spellLevel) return;
    await addSpellToDatabase({
      name: spellName.trim(),
      level: +spellLevel,
      description: spellDescription.trim()
    });
    setSpellName(''); setSpellLevel(''); setSpellDescription('');
    fetchSpells();
  };

  const handleCastSpell = async i => {
    const sp = spells[i];
    if (!sp || !sp._id) return;
    await deleteSpellFromDatabase(sp._id);
    fetchSpells();
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div style={{ display: 'flex', height: '100vh' }}>
        <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <header style={{ padding: 10, textAlign: 'center', fontFamily: 'Cinzel, serif' }}>
            <h1 style={{ margin: 0 }}>Dungeon Dweller</h1>
          </header>
          <div style={{ flexGrow: 1, overflow: 'hidden' }}>
            <BattleMap mapImage={battleMapImage} icons={icons} setIcons={setIcons} />
          </div>
        </div>

        <div style={{ width: 300, display: 'flex', flexDirection: 'column', borderLeft: '2px solid #ccc' }}>
          <SideMenu activeTab={activeTab} setActiveTab={setActiveTab} />

          <div style={{ flexGrow: 1, padding: '0 10px', display: 'flex', flexDirection: 'column' }}>
            {activeTab === 'inventory' && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ flexGrow: 1, overflowY: 'auto' }}>
                  <InventoryGrid inventory={inventory} handleUseItem={handleUseItem} />
                </div>
                <div style={{ borderTop: '1px solid #ccc', padding: '10px 0' }}>
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

            {activeTab === 'spells' && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ flexGrow: 1, overflowY: 'auto' }}>
                  <SpellsGrid spells={spells} handleCastSpell={handleCastSpell} />
                </div>
                <div style={{ borderTop: '1px solid #ccc', padding: '10px 0' }}>
                  <AddSpellForm
                    spellName={spellName}
                    setSpellName={setSpellName}
                    spellLevel={spellLevel}
                    setSpellLevel={setSpellLevel}
                    spellDescription={spellDescription}
                    setSpellDescription={setSpellDescription}
                    handleAddSpell={handleAddSpell}
                  />
                </div>
              </div>
            )}

            {activeTab === 'chat' && (
              <div style={{ flexGrow: 1, overflowY: 'auto' }}>
                <Chat
                  room={sessionId}
                  username={username}
                  messages={messages}
                  setMessages={setMessages}
                  userList={userList}
                  setUserList={setUserList}
                  isHost={isHost}
                  kickedUsers={kickedUsers}
                />
              </div>
            )}

            {activeTab === 'character' && (
              <div style={{ flexGrow: 1, overflowY: 'auto' }}>
                <CharacterSheet />
              </div>
            )}

            {activeTab === 'map' && (
              <div style={{ padding: '10px 0' }}>
                <h3 style={{ fontFamily: 'Cinzel, serif' }}>🗺️ Change Battle Map</h3>
                <input type="file" accept="image/*" onChange={handleFileUpload} style={{ width: '100%', marginBottom: 10 }} />
                <button onClick={() => setShowDefaultMaps(s => !s)} style={{ width: '100%', marginBottom: 10 }}>
                  {showDefaultMaps ? 'Hide Default Maps' : 'Show Default Maps'}
                </button>
                {showDefaultMaps && [1,2,3,4].map(n => (
                  <img
                    key={n}
                    src={`/defaultmap${n}.png`}
                    alt={`Map ${n}`}
                    style={{ width: '100%', cursor: 'pointer', marginBottom: 10 }}
                    onClick={() => setBattleMapImage(`/defaultmap${n}.png`)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DndProvider>
  );
}

export default App;
