import React, { useState } from 'react';
import BattleMap from './BattleMap';
import DiceRoller from './Dice';
import Chat from './Chat';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

function App() {
  const [battleMapImage, setBattleMapImage] = useState('/defaultmap1.png');

  const [icons, setIcons] = useState([
    { id: 1, src: '/redmarker.png', alt: 'Red Marker', left: 760, top: 560 },
    { id: 2, src: '/bluemarker.png', alt: 'Blue Marker', left: 710, top: 560 },
    { id: 3, src: '/greenmarker.png', alt: 'Green Marker', left: 760, top: 510 },
    { id: 4, src: '/yellowmarker.png', alt: 'Yellow Marker', left: 710, top: 510 },
  ]);

  const [showDefaultMaps, setShowDefaultMaps] = useState(false);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setBattleMapImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDefaultMapSelection = (mapPath) => {
    setBattleMapImage(mapPath);
    setShowDefaultMaps(false);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <DiceRoller />

      <div style={{ display: 'flex' }}>
        {/* Left side: Map, Upload, Title, etc. */}
        <div style={{ padding: '20px', flexGrow: 1 }}>
          <h1>Dungeon Dweller Map Test :3</h1>

          <input type="file" accept="image/*" onChange={handleFileUpload} />
          <button onClick={() => setShowDefaultMaps(prev => !prev)} style={{ marginLeft: '10px' }}>
            {showDefaultMaps ? 'Hide Default Maps' : 'Show Default Maps'}
          </button>

          {showDefaultMaps && (
            <div style={{ display: 'flex', marginTop: '10px' }}>
              {['1', '2', '3', '4'].map((n) => (
                <img
                  key={n}
                  src={`/defaultmap${n}.png`}
                  alt={`Default Map ${n}`}
                  style={{ width: '150px', cursor: 'pointer', marginRight: '10px' }}
                  onClick={() => handleDefaultMapSelection(`/defaultmap${n}.png`)}
                />
              ))}
            </div>
          )}

          <BattleMap mapImage={battleMapImage} icons={icons} setIcons={setIcons} />
        </div>

        {/* Right side: Live Chat */}
        <Chat />
      </div>
    </DndProvider>
  );
}

export default App;
