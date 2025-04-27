require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const bodyParser = require("body-parser");
const LocalStrategy = require("passport-local");
const session = require("express-session");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const fs = require("fs");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const User = require("./User");

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 4000;

// MongoDB setup
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// View engine and static assets
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({ secret: "your_secret_key", resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// -------------------------
// EJS Web Routes
// -------------------------
app.get("/", (req, res) => res.render("home", { user: req.user || null }));
app.get("/register", (req, res) => res.render("register", { user: req.user || null }));
app.get("/login", (req, res) => res.render("login", { user: req.user || null, query: req.query || {} }));

app.post("/register", (req, res) => {
  const { username, email, password } = req.body;
  const token = crypto.randomBytes(16).toString("hex");
  const newUser = new User({ username, email, verificationToken: token, isVerified: false });
  User.register(newUser, password, (err, user) => {
    if (err) return res.status(400).render("register", { error: err.message, user: req.user || null });
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Account Verification",
      text: `Hello ${username}, verify your account:\n\n${req.protocol}://${req.get("host")}/verify?token=${token}&email=${email}`
    };
    transporter.sendMail(mailOptions, (error) => {
      if (error) return res.status(500).json({ error: "Error sending email." });
      res.status(200).json({ message: `Verification email sent to ${email}` });
    });
  });
});

app.get("/verify", (req, res) => {
  const { token, email } = req.query;
  User.findOne({ email, verificationToken: token }, (err, user) => {
    if (!user) return res.status(400).json({ error: "Invalid or expired token." });
    user.isVerified = true;
    user.verificationToken = undefined;
    user.save(err => {
      if (err) return res.status(500).json({ error: "Verification error." });
      res.status(200).json({ message: "Your account is verified!" });
    });
  });
});

app.post("/login", passport.authenticate("local", { failureRedirect: "/login" }), (req, res) => {
  if (!req.user.isVerified) {
    req.logout(() => {});
    return res.redirect("/login?error=notverified");
  }
  res.redirect("/session-options");
});

app.get("/session-options", (req, res) => {
  if (!req.isAuthenticated()) return res.redirect("/login");
  res.render("session-options", { username: req.user.username });
});

app.post("/create-session", (req, res) => {
  const sessionId = uuidv4();
  res.render("session-created", { sessionId });
});

app.get("/join-session", (req, res) => {
  const { sessionId } = req.query;
  if (!sessionId || sessionId.length < 6) return res.status(400).send("Invalid session ID");
  res.redirect(`/session/${sessionId}`);
});

app.get("/logout", (req, res) => {
  req.logout(() => {});
  res.redirect("/");
});

// -------------------------
// Inventory API
// -------------------------
const itemSchema = new mongoose.Schema({
  user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:     { type: String, required: true },
  quantity: { type: Number, required: true }
});
const Item = mongoose.model("Item", itemSchema);

app.get("/api/inventory", async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: "Not logged in" });
  try {
    const items = await Item.find({ user: req.user._id });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/inventory", async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: "Not logged in" });
  try {
    const newItem = new Item({ ...req.body, user: req.user._id });
    await newItem.save();
    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/inventory/:id", async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: "Not logged in" });
  try {
    const updated = await Item.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: "Item not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/inventory/:id", async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: "Not logged in" });
  try {
    const deleted = await Item.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!deleted) return res.status(404).json({ error: "Item not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------
// Character Sheet API
// -------------------------
const characterSchema = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true },
  stats:       Object,
  saves:       Object,
  skills:      Object,
  armorClass:  Number,
  initiative:  Number,
  speed:       Number,
  hitPoints:   String
});
const Character = mongoose.model("Character", characterSchema);

app.get("/api/character", async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: "Not logged in" });
  const character = await Character.findOne({ user: req.user._id });
  res.json(character || {});
});

app.post("/api/character", async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: "Not logged in" });
  const updated = await Character.findOneAndUpdate(
    { user: req.user._id },
    { ...req.body, user: req.user._id },
    { upsert: true, new: true }
  );
  res.json(updated);
});

// -------------------------
// Spells API (per-user, mirrors inventory logic)
// -------------------------
const spellSchema = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:        { type: String, required: true },
  level:       { type: Number, required: true },
  description: { type: String }
});
const Spell = mongoose.model("Spell", spellSchema);

app.get("/api/spells", async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: "Not logged in" });
  try {
    const spells = await Spell.find({ user: req.user._id });
    res.json(spells);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/spells", async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: "Not logged in" });
  try {
    const newSpell = new Spell({ ...req.body, user: req.user._id });
    await newSpell.save();
    res.status(201).json(newSpell);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/spells/:id", async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: "Not logged in" });
  try {
    const updatedSpell = await Spell.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );
    if (!updatedSpell) return res.status(404).json({ error: "Spell not found" });
    res.json(updatedSpell);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/spells/:id", async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: "Not logged in" });
  try {
    const deleted = await Spell.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!deleted) return res.status(404).json({ error: "Spell not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------
// React build for /session/:sessionId
// -------------------------
const buildPath = path.join(__dirname, "../frontend/build");
if (fs.existsSync(buildPath)) {
  app.use(express.static(buildPath));
  app.get("/session/:sessionId", (req, res) => {
    res.sendFile(path.join(buildPath, "index.html"));
  });
}

// -------------------------
// Socket.IO logic
// -------------------------
const roomUsers = {};
const roomHosts = {};
const kickedUsers = {};

io.on("connection", (socket) => {
  socket.on("joinRoom", ({ username, room }) => {
    if (kickedUsers[room]?.includes(username)) {
      socket.emit("kicked");
      return;
    }
    socket.join(room);
    socket.username = username;
    socket.room = room;
    if (!roomUsers[room]) roomUsers[room] = [];
    if (!roomUsers[room].includes(username)) roomUsers[room].push(username);
    if (roomUsers[room].length === 1) {
      roomHosts[room] = username;
    }
    io.to(room).emit("userList", roomUsers[room]);
    io.to(room).emit("hostAssigned", roomHosts[room]);
    io.to(room).emit("kickedUsersList", kickedUsers[room] || []);
  });

  socket.on("kickUser", ({ room, target }) => {
    if (socket.username === roomHosts[room]) {
      const targetSocket = Array.from(io.sockets.sockets.values())
        .find(s => s.username === target && s.room === room);
      if (targetSocket) {
        targetSocket.emit("kicked");
        targetSocket.leave(room);
        targetSocket.disconnect(true);
      }
      roomUsers[room] = roomUsers[room].filter(u => u !== target);
      if (!kickedUsers[room]) kickedUsers[room] = [];
      kickedUsers[room].push(target);
      io.to(room).emit("userList", roomUsers[room]);
      io.to(room).emit("kickedUsersList", kickedUsers[room]);
    }
  });

  socket.on("unkickUser", ({ room, target }) => {
    if (socket.username === roomHosts[room]) {
      if (kickedUsers[room]) {
        kickedUsers[room] = kickedUsers[room].filter(u => u !== target);
      }
      io.to(room).emit("kickedUsersList", kickedUsers[room]);
    }
  });

  socket.on("sendMessage", ({ username, text, room }) => {
    io.to(room).emit("message", { username, text });
  });

  socket.on("moveIcon", ({ room, iconId, newPosition }) => {
    socket.to(room).emit("iconMoved", { iconId, newPosition });
  });

  socket.on("disconnect", () => {
    const { username, room } = socket;
    if (username && room) {
      roomUsers[room] = roomUsers[room]?.filter(u => u !== username);
      if (roomHosts[room] === username) {
        roomHosts[room] = roomUsers[room]?.[0] || null;
        io.to(room).emit("hostAssigned", roomHosts[room]);
      }
      if (kickedUsers[room]) {
        kickedUsers[room] = kickedUsers[room].filter(u => u !== username);
      }
      io.to(room).emit("userList", roomUsers[room]);
      io.to(room).emit("kickedUsersList", kickedUsers[room]);
    }
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
