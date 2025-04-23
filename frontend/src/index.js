// src/index.js

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App'; // Your battlemap + chat UI
import './index.css';    // Optional: global styles

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Only mount React when session is active */}
        <Route path="/session/:sessionId" element={<App />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
