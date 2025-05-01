import React from 'react';

export default function SideMenu({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'chat', icon: '💬' },
    { id: 'inventory', icon: '🎒' },
    { id: 'character', icon: '🧝' },
    { id: 'map', icon: '🗺️' },
    { id: 'spells', icon: '🧙‍♂️' },
    { id: 'notepad', icon: '📓' }, // ✅ Added Notepad tab
  ];

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-around',
      backgroundColor: '#e6e6e6',
      borderBottom: '1px solid #ccc',
      padding: '10px 0'
    }}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          style={{
            fontSize: '20px',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: activeTab === tab.id ? '#c00' : '#333'
          }}
        >
          {tab.icon}
        </button>
      ))}
    </div>
  );
}
