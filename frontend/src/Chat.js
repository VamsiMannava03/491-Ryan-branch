import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:4000', { transports: ['websocket'] });


function Chat() {
  const [username, setUsername] = useState('');
  const [room, setRoom] = useState('battlemap');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    console.log("Joining room:", username);
    socket.emit('joinRoom', { username, room });
  
    socket.on('message', (data) => {
      console.log("Received message:", data); // 👈 should log when message comes back
      setMessages((prev) => [...prev, data]);
    });
  
    return () => socket.off('message');
  }, [joined, username, room]);
  

  const handleJoin = (e) => {
    e.preventDefault();
    if (username.trim()) {
      setJoined(true);
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      console.log("Sending:", { username, text: message }); // 👈 log this too
      socket.emit('sendMessage', { username, text: message });
      setMessage('');
    }
  };
  

  if (!joined) {
    return (
      <div style={{ padding: '2rem' }}>
        <h2>Join the Chat</h2>
        <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input
            type="text"
            placeholder="Enter your name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button type="submit">Join Chat</button>
        </form>
      </div>
    );
  }

  return (
    <div style={{
      width: '300px',
      height: '100vh',
      backgroundColor: '#f5f5f5',
      borderLeft: '1px solid #ccc',
      display: 'flex',
      flexDirection: 'column',
      padding: '10px',
    }}>
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
