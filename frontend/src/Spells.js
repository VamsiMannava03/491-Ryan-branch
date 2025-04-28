import React, { useState } from 'react';


export async function addSpellToDatabase(newSpell) {
  console.log("Sending POST request with:", newSpell);
  try {
    const response = await fetch('http://localhost:4000/api/spells', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSpell)
    });
    if (!response.ok) {
      throw new Error('Failed to add spell');
    }
    return await response.json();
  } catch (err) {
    console.error("Error adding spell", err);
    throw err;
  }
}

export async function updateSpellInDatabase(spellId, updatedData) {
  try {
    const response = await fetch(`http://localhost:4000/api/spells/${spellId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData)
    });
    if (!response.ok) {
      throw new Error('Failed to update spell');
    }
    return await response.json();
  } catch (err) {
    console.error("Error updating spell", err);
    throw err;
  }
}

export async function deleteSpellFromDatabase(spellId) {
  try {
    const response = await fetch(`http://localhost:4000/api/spells/${spellId}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      throw new Error('Failed to delete spell');
    }
    return await response.json();
  } catch (err) {
    console.error("Error deleting spell", err);
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
        boxShadow: hover ? '0 0 8px purple' : 'none'
      }}
    >
      {children}
    </button>
  );
}

export function AddSpellForm({
  spellName,
  setSpellName,
  spellLevel,
  setSpellLevel,
  spellDescription,
  setSpellDescription,
  handleAddSpell
}) {
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
        Add a Spell
      </h3>
      <div>
        <input
          type="text"
          placeholder="Spell Name"
          value={spellName}
          onChange={e => setSpellName(e.target.value)}
          style={{ marginRight: 10, padding: 5, width: '40%' }}
        />
        <input
          type="number"
          placeholder="Lvl"
          value={spellLevel}
          onChange={e => setSpellLevel(e.target.value)}
          style={{ marginRight: 10, padding: 5, width: '15%' }}
        />
      </div>
      <div style={{ marginTop: 10 }}>
        <textarea
          placeholder="Description (optional)"
          value={spellDescription}
          onChange={e => setSpellDescription(e.target.value)}
          rows={3}
          style={{ width: '100%', padding: 5, boxSizing: 'border-box' }}
        />
      </div>
      <div style={{ textAlign: 'center', marginTop: 10 }}>
        <HoverButton onClick={handleAddSpell}>Add</HoverButton>
      </div>
    </div>
  );
}

export function SpellsGrid({ spells, handleCastSpell }) {
  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #faf5ff, #f3e5f5)',
        border: '2px solid #4B0082',
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
        Spells
      </h3>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
          gap: 10
        }}
      >
        {spells.map((spell, index) => (
          <div
            key={index}
            style={{
              background: 'white',
              borderRadius: 6,
              padding: 10,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              display: 'flex',
              flexDirection: 'column',
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
            <div style={{ fontWeight: 'bold', marginBottom: 5 }}>{spell.name}</div>
            <div style={{ marginBottom: 10 }}>Lvl: {spell.level}</div>
            {spell.description && (
              <div style={{ fontSize: 12, color: '#333', marginBottom: 8, textAlign: 'left' }}>
                {spell.description}
              </div>
            )}
            <div style={{ marginTop: 'auto', textAlign: 'center' }}>
              <HoverButton onClick={() => handleCastSpell(index)}>Cast</HoverButton>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
