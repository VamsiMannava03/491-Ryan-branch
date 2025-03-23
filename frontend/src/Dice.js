import React, { useState } from 'react';

const DiceRoller = () => {
  // Initialize with a random roll (1-20)
  const [roll, setRoll] = useState(Math.floor(Math.random() * 20) + 1);

  // When the dice gif is clicked, generate 1-20                 TODO make it so the animation only goes when clicking it
  const handleRoll = () => {
    const newRoll = Math.floor(Math.random() * 20) + 1;
    setRoll(newRoll);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        textAlign: 'center',
        zIndex: 1000,
        background: 'rgba(255,255,255,0.8)',
        padding: '10px',
        borderRadius: '8px',
      }}
    >
      <img
        src="/dice.gif"
        alt="Dice rolling"
        style={{ width: '100px', cursor: 'pointer' }}       //fix here
        onClick={handleRoll}
      />
      <div style={{ fontSize: '24px', marginTop: '5px' }}>{roll}</div>
    </div>
  );
};

export default DiceRoller;
