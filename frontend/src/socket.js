// socket.js
import { io } from "socket.io-client";

// ALWAYS connect to backend WebSocket server on port 4000
const socket = io("http://localhost:4000", {
  transports: ["websocket"],
  reconnectionAttempts: 3
});

socket.on("connect", () => {
  console.log("✅ Connected to socket server. ID:", socket.id);
});

socket.on("connect_error", (err) => {
  console.error("❌ Socket connection error:", err.message);
});

export default socket;
