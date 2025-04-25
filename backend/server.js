// server.js (inside /backend)
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

mongoose.set('strictQuery', true);

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log("✅ Connected to MongoDB Atlas");
})
.catch(err => {
  console.error("❌ MongoDB connection error:", err);
});

app.set("view engine", "ejs");
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
  secret: "your_secret_key",
  resave: false,
  saveUninitialized: false
}));
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
      text: `Hello ${username},\n\nPlease verify your account:\n\n${req.protocol}://${req.get("host")}/verify?token=${token}&email=${email}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
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
    user.save((saveErr) => {
      if (saveErr) return res.status(500).json({ error: "Verification error." });
      res.status(200).json({ message: "Your account is verified!" });
    });
  });
});

app.post("/login", passport.authenticate("local", {
  failureRedirect: "/login"
}), (req, res) => {
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

// Inventory
const itemSchema = new mongoose.Schema({ name: String, quantity: Number });
const Item = mongoose.model("Item", itemSchema);

app.get("/api/inventory", async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/inventory", async (req, res) => {
  try {
    const newItem = new Item(req.body);
    await newItem.save();
    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/inventory/:id", async (req, res) => {
  try {
    const updatedItem = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/inventory/:id", async (req, res) => {
  try {
    await Item.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Character Sheet (inline model)
const Character = mongoose.model("Character", new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  stats: Object,
  saves: Object,
  skills: Object,
  armorClass: Number,
  initiative: Number,
  speed: Number,
  hitPoints: String,
}));

app.get('/api/character', async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: "Not logged in" });
  const character = await Character.findOne({ user: req.user._id });
  res.json(character || {});
});

app.post('/api/character', async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: "Not logged in" });
  const updated = await Character.findOneAndUpdate(
    { user: req.user._id },
    { ...req.body, user: req.user._id },
    { upsert: true, new: true }
  );
  res.json(updated);
});

// Serve built React frontend
const buildPath = path.join(__dirname, "../frontend/build");
if (fs.existsSync(buildPath)) {
  app.use(express.static(buildPath));
  app.get("/session/:sessionId", (req, res) => res.sendFile(path.join(buildPath, "index.html")));
  app.get("*", (req, res) => res.sendFile(path.join(buildPath, "index.html")));
}

// WebSocket logic
const roomUsers = {};
io.on("connection", (socket) => {
  console.log("🟢 A user connected");

  socket.onAny((event, ...args) => {
    console.log(`📦 Incoming event: ${event}`, args);
  });

  socket.on("joinRoom", ({ username, room }) => {
    socket.join(room);
    socket.username = username;
    socket.room = room;

    if (!roomUsers[room]) roomUsers[room] = [];
    if (!roomUsers[room].includes(username)) {
      roomUsers[room].push(username);
    }

    console.log(`🧩 joinRoom received from ${username} in ${room}`);
    io.to(room).emit("userList", roomUsers[room]);
  });

  socket.on("moveIcon", ({ room, iconId, newPosition }) => {
    socket.to(room).emit("iconMoved", { iconId, newPosition });
  });

  socket.on("sendMessage", ({ username, text, room }) => {
    io.to(room).emit("message", { username, text });
  });

  socket.on("disconnect", () => {
    const { username, room } = socket;
    if (username && room) {
      roomUsers[room] = roomUsers[room]?.filter(u => u !== username);
      console.log(`🔴 ${username} left room ${room}`);
      io.to(room).emit("userList", roomUsers[room]);
    }
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
