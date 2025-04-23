import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', { transports: ['websocket'] });

function Chat({ room, username }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [userList, setUserList] = useState([]);

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
  }, [room, username]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      socket.emit('sendMessage', { username, text: message, room });
      setMessage('');
    }
  };

  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: '#f5f5f5', borderLeft: '1px solid #ccc', display: 'flex', flexDirection: 'column', padding: '10px' }}>
      <div><strong>🧑 Players in session:</strong></div>
      <ul>
        {userList.map((u, i) => <li key={i}>{u}</li>)}
      </ul>
      <hr />
      <div style={{ flex: 1, overflowY: 'auto', marginBottom: '10px' }}>
        {messages.map((msg, i) => (
          <div key={i}><strong>{msg.username}</strong>: {msg.text}</div>
        ))}
      </div>
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
  );
}

export default Chat;
