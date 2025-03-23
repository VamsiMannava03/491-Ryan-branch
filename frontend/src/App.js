import React, { useState } from 'react';
import BattleMap from './BattleMap';
import DiceRoller from './Dice';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

function App() {
  // Initially set the battle map image to a default map initially 1
  const [battleMapImage, setBattleMapImage] = useState('/defaultmap1.png');
  
  // Four draggable icons, can add more as needed / repurposed into map based events or enemy spawns?
  const [icons, setIcons] = useState([
    { id: 1, src: '/redmarker.png', alt: 'Red Marker', left: 760, top: 560 },
    { id: 2, src: '/bluemarker.png', alt: 'Blue Marker', left: 710, top: 560 },
    { id: 3, src: '/greenmarker.png', alt: 'Green Marker', left: 760, top: 510 },
    { id: 4, src: '/yellowmarker.png', alt: 'Yellow Marker', left: 710, top: 510 },
  ]);

  // Toggle for displaying default map options, gonna change this
  const [showDefaultMaps, setShowDefaultMaps] = useState(false);

  // Custom battle maps via file upload, also gonna change this
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

  // Handle selecting a default map
  const handleDefaultMapSelection = (mapPath) => {
    setBattleMapImage(mapPath);
    setShowDefaultMaps(false);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      {/* DiceRoller is fixed at the top right */}
      <DiceRoller />
      <div style={{ padding: '20px' }}>
        {/* Silly temporary title */}
        <h1>Dungeon Dweller Map Test :3</h1>
        {/* Upload your own battle map */}
        <input type="file" accept="image/*" onChange={handleFileUpload} />
        {/* Button to toggle default map selection */}
        <button onClick={() => setShowDefaultMaps(prev => !prev)} style={{ marginLeft: '10px' }}>
          {showDefaultMaps ? 'Hide Default Maps' : 'Show Default Maps'}
        </button>
        {showDefaultMaps && (
          <div style={{ display: 'flex', marginTop: '10px' }}>
            <img
              src="/defaultmap1.png"
              alt="Default Map 1"
              style={{ width: '150px', cursor: 'pointer', marginRight: '10px' }}
              onClick={() => handleDefaultMapSelection('/defaultmap1.png')}
            />
            <img
              src="/defaultmap2.png"
              alt="Default Map 2"
              style={{ width: '150px', cursor: 'pointer', marginRight: '10px' }}
              onClick={() => handleDefaultMapSelection('/defaultmap2.png')}
            />
            <img
              src="/defaultmap3.png"
              alt="Default Map 3"
              style={{ width: '150px', cursor: 'pointer', marginRight: '10px' }}
              onClick={() => handleDefaultMapSelection('/defaultmap3.png')}
            />
            <img
              src="/defaultmap4.png"
              alt="Default Map 4"
              style={{ width: '150px', cursor: 'pointer', marginRight: '10px' }}
              onClick={() => handleDefaultMapSelection('/defaultmap4.png')}
            />
          </div>
        )}
        <BattleMap mapImage={battleMapImage} icons={icons} setIcons={setIcons} />
      </div>
    </DndProvider>
  );
}

export default App;
