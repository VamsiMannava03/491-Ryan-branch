import React, { useState, useEffect, useMemo } from 'react';
import socket from './socket';
import { rollDice } from './Dice';

function getRandomColor(username) {
  const colors = [
    '#e6194b', '#3cb44b', '#ffe119', '#4363d8',
    '#f58231', '#911eb4', '#46f0f0', '#f032e6'
  ];
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function Chat({ room, username, messages, setMessages, userList, setUserList, isHost, kickedUsers }) {
  const [message, setMessage] = useState('');

  const userColors = useMemo(() => {
    const colorMap = {};
    userList.forEach(user => {
      colorMap[user] = getRandomColor(user);
    });
    return colorMap;
  }, [userList]);

  useEffect(() => {
    if (!room || !username) return;
  
    socket.emit('joinRoom', { username, room });
  
    const handleMessage = (data) => {
      setMessages(prev => [...prev, data]);
    };
    const handleUserList = (users) => {
      setUserList(users);
    };
    const handleKicked = () => {
      alert('You were kicked from the session.');
      window.location.href = '/session-options';
    };
  
    socket.on('message', handleMessage);
    socket.on('userList', handleUserList);
    socket.on('kicked', handleKicked);
  
    return () => {
      socket.off('message', handleMessage);
      socket.off('userList', handleUserList);
      socket.off('kicked', handleKicked);
    };
  }, [room, username]);
  
  const sendMessage = e => {
    e.preventDefault();
    const text = message.trim();
    if (!text) return;

    if (text === '/info') {
      socket.emit('sendMessage', {
        username,
        text: 'Dice commands: use `/roll NdM±K` to roll N dice with M sides. Modifier ±K is optional. E.g. `/roll 4d6+2` => [3,5,1,6] + 2 = 17.',
        room
      });
    } else if (text.startsWith('/roll')) {
      const result = rollDice(text);
      if (result) {
        const { expression, pips, total, modifier } = result;
        let modDisplay = '';
        if (modifier > 0) modDisplay = `+ ${modifier}`;
        else if (modifier < 0) modDisplay = `- ${Math.abs(modifier)}`;

        socket.emit('sendMessage', {
          username,
          text: `rolled ${expression}: [${pips.join(', ')}] ${modDisplay} = ${total}`,
          room
        });
      } else {
        socket.emit('sendMessage', {
          username,
          text: 'Invalid roll command. Usage: /roll NdM±K (e.g. /roll 2d6+1).',
          room
        });
      }
    } else {
      socket.emit('sendMessage', { username, text, room });
    }
    setMessage('');
  };

  const handleKick = target => {
    socket.emit('kickUser', { room, target });
  };

  const handleUnkick = target => {
    socket.emit('unkickUser', { room, target });
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flexGrow: 1, overflowY: 'auto', backgroundColor: '#f5f5f5', padding: '10px' }}>
        <div>
          <strong>🧑 Players in session:</strong>
          <ul>
            {userList.map((u, i) => (
              <li key={i}>
                {u}
                {isHost && u !== username && (
                  <button
                    onClick={() => handleKick(u)}
                    style={{ marginLeft: '10px', color: 'red' }}
                  >
                    Kick
                  </button>
                )}
              </li>
            ))}
          </ul>

          {isHost && kickedUsers.length > 0 && (
            <>
              <strong>🚫 Kicked Users:</strong>
              <ul>
                {kickedUsers.map((u, i) => (
                  <li key={i}>
                    {u}
                    <button
                      onClick={() => handleUnkick(u)}
                      style={{ marginLeft: '10px', color: 'green' }}
                    >
                      Unkick
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
          <hr />
        </div>

        <div>
          {messages.map((msg, i) => (
            <div key={i}>
              <strong style={{ color: userColors[msg.username] }}>{msg.username}</strong>: {msg.text}
            </div>
          ))}
        </div>
      </div>

      <div style={{ borderTop: '1px solid #ccc', padding: '10px', backgroundColor: '#f5f5f5' }}>
        <form onSubmit={sendMessage} style={{ display: 'flex' }}>
          <input
            type="text"
            value={message}
            onChange={e => setMessage(e.target.value)}
            style={{ flex: 1, marginRight: '5px', padding: '5px' }}
            placeholder="Type a message..."
          />
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  );
}

export default Chat;
