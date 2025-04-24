import React, { useState, useEffect } from 'react';

const skillMap = {
  STR: ['Athletics'],
  DEX: ['Acrobatics', 'Sleight of Hand', 'Stealth'],
  INT: ['Arcana', 'History', 'Investigation', 'Nature', 'Religion'],
  WIS: ['Animal Handling', 'Insight', 'Medicine', 'Perception', 'Survival'],
  CHA: ['Deception', 'Intimidation', 'Performance', 'Persuasion'],
};

const emojiMap = {
  STR: '🗿',
  DEX: '🦶',
  INT: '📚',
  WIS: '👁️',
  CHA: '🗣️',
};

function CharacterSheet() {
  const [data, setData] = useState({
    stats: { STR: '', DEX: '', CON: '', INT: '', WIS: '', CHA: '' },
    saves: { STR: '', DEX: '', CON: '', INT: '', WIS: '', CHA: '' },
    skills: Object.fromEntries(Object.values(skillMap).flat().map(k => [k, ''])),
    armorClass: '', initiative: '', speed: '', hitPoints: ''
  });

  const [showStats, setShowStats] = useState(true);
  const [showSaves, setShowSaves] = useState(false);
  const [showSkills, setShowSkills] = useState(false);
  const [showCombat, setShowCombat] = useState(false);
  const [skillToggles, setSkillToggles] = useState({});

  const toggleSkillGroup = (group) => {
    setSkillToggles(prev => ({ ...prev, [group]: !prev[group] }));
  };

  const fetchCharacter = async () => {
    try {
      const res = await fetch('/api/character');
      const json = await res.json();
      if (json) setData(prev => ({ ...prev, ...json }));
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  useEffect(() => {
    fetchCharacter();
  }, []);

  const handleChange = (group, key, value) => {
    setData(prev => ({
      ...prev,
      [group]: { ...prev[group], [key]: value }
    }));
  };

  const handleSave = async () => {
    try {
      const res = await fetch('/api/character', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      await res.json();
      alert('Character saved!');
    } catch (err) {
      console.error('Save error:', err);
    }
  };

  const medievalFont = { fontFamily: 'Cinzel, serif' };

  const renderLabeledInput = (label, value, onChange) => (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px', maxWidth: '100%' }}>
      <label style={{ ...medievalFont, width: '100px', fontSize: '13px' }}>{label}:</label>
      <input
        type="text"
        value={value}
        onChange={onChange}
        style={{ width: '40px', fontFamily: 'Cinzel, serif' }}
      />
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flexGrow: 1, overflowY: 'auto', paddingBottom: '10px' }}>
        <h2 style={{ fontFamily: 'Cinzel, serif', textAlign: 'center', marginBottom: '10px' }}>🧝 Character Sheet</h2>

        <h3 onClick={() => setShowStats(!showStats)} style={{ ...medievalFont, cursor: 'pointer' }}>
          {showStats ? '▼' : '▶'} 💪 Stats
        </h3>
        {showStats && (
          <div>
            {Object.entries(data.stats).map(([key, val]) =>
              renderLabeledInput(key, val, e => handleChange('stats', key, e.target.value))
            )}
          </div>
        )}

        <h3 onClick={() => setShowSaves(!showSaves)} style={{ ...medievalFont, cursor: 'pointer' }}>
          {showSaves ? '▼' : '▶'} 🛡️ Saving Throws
        </h3>
        {showSaves && (
          <div>
            {Object.entries(data.saves).map(([key, val]) =>
              renderLabeledInput(`${key} Save`, val, e => handleChange('saves', key, e.target.value))
            )}
          </div>
        )}

        <h3 onClick={() => setShowSkills(!showSkills)} style={{ ...medievalFont, cursor: 'pointer' }}>
          {showSkills ? '▼' : '▶'} 🧠 Skills
        </h3>
        {showSkills && (
          <div>
            {Object.entries(skillMap).map(([ability, skills]) => (
              <div key={ability}>
                <h4
                  onClick={() => toggleSkillGroup(ability)}
                  style={{
                    ...medievalFont,
                    cursor: 'pointer',
                    marginBottom: '5px',
                    paddingLeft: '20px'
                  }}
                >
                  {skillToggles[ability] ? '▼' : '▶'} {emojiMap[ability]} {ability}
                </h4>
                {skillToggles[ability] && (
                  <div style={{ paddingLeft: '30px' }}>
                    {skills.map(skill =>
                      renderLabeledInput(skill, data.skills[skill], e =>
                        handleChange('skills', skill, e.target.value)
                      )
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <h3 onClick={() => setShowCombat(!showCombat)} style={{ ...medievalFont, cursor: 'pointer' }}>
          {showCombat ? '▼' : '▶'} ⚔️ Combat Stats
        </h3>
        {showCombat && (
          <div>
            {renderLabeledInput('Armor Class', data.armorClass, e => setData(prev => ({ ...prev, armorClass: e.target.value })))}
            {renderLabeledInput('Initiative', data.initiative, e => setData(prev => ({ ...prev, initiative: e.target.value })))}
            {renderLabeledInput('Speed', data.speed, e => setData(prev => ({ ...prev, speed: e.target.value })))}
            {renderLabeledInput('Hit Points', data.hitPoints, e => setData(prev => ({ ...prev, hitPoints: e.target.value })))}
          </div>
        )}
      </div>

      <div style={{
        borderTop: '1px solid #ccc',
        padding: '10px 0',
        backgroundColor: '#f5f5f5'
      }}>
        <button onClick={handleSave} style={{ width: '100%', fontFamily: 'Cinzel, serif' }}>
          💾 Save Changes
        </button>
      </div>
    </div>
  );
}

export default CharacterSheet;
