import React, { useState, useEffect } from 'react';

export default function Notepad() {
  const [text, setText] = useState('');

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('dnd-notepad');
    if (saved) setText(saved);
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('dnd-notepad', text);
  }, [text]);

  return (
    <div style={{
      padding: '10px',
      backgroundColor: '#fffaf0',
      border: '1px solid #ccc',
      borderRadius: '4px',
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <h3 style={{ marginTop: 0 }}>📝 Notepad</h3>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type notes here..."
        style={{
          flexGrow: 1,
          resize: 'none',
          padding: '8px',
          fontSize: '14px',
          fontFamily: 'serif',
          borderRadius: '4px',
          border: '1px solid #999'
        }}
      />
    </div>
  );
}
