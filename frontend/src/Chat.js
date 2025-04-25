import React, { useState, useEffect, useMemo } from 'react';
import socket from './socket';

function getRandomColor(username) {
  const colors = ["#e6194b", "#3cb44b", "#ffe119", "#4363d8", "#f58231", "#911eb4", "#46f0f0", "#f032e6"];
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function Chat({ room, username, messages, setMessages, userList, setUserList }) {
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

    socket.on('message', (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on('userList', (users) => {
      setUserList(users);
    });

    return () => {
      socket.off('message');
      socket.off('userList');
    };
  }, [room, username, setMessages, setUserList]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      socket.emit('sendMessage', { username, text: message, room });
      setMessage('');
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flexGrow: 1, overflowY: 'auto', backgroundColor: '#f5f5f5', padding: '10px' }}>
        <div>
          <strong>🧑 Players in session:</strong>
          <ul>
            {userList.map((u, i) => <li key={i}>{u}</li>)}
          </ul>
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
            onChange={(e) => setMessage(e.target.value)}
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
