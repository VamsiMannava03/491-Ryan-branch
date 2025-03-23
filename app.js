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

const User = require("./model/User");

const app = express();
const server = http.createServer(app); // <-- for socket.io
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // <-- your React frontend
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || "/";

// MongoDB connection
mongoose.connect("mongodb+srv://mannavavamsi03:Oxygen689@dungeondweller.jeulo.mongodb.net/?retryWrites=true&w=majority&appName=DungeonDweller", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("✅ Connected to MongoDB Atlas");
}).catch(err => {
  console.error("❌ MongoDB connection error:", err);
});

// Middleware
app.set("view engine", "ejs");
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

// Email transporter
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "your@gmail.com",
    pass: "your-app-password"
  }
});

// Routes
app.get("/", (req, res) => res.render("home"));
app.get("/register", (req, res) => res.render("register"));
app.get("/login", (req, res) => res.render("login"));

app.post("/register", (req, res) => {
  const { username, email, password } = req.body;
  const token = crypto.randomBytes(16).toString("hex");

  const newUser = new User({ username, email, verificationToken: token, isVerified: false });

  User.register(newUser, password, (err, user) => {
    if (err) return res.status(400).json({ error: err.message });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Account Verification",
      text: `Hello ${username},\n\nVerify your account:\n\n${req.protocol}://${req.get("host")}/verify?token=${token}&email=${email}\n`
    };

    transporter.sendMail(mailOptions, (error) => {
      if (error) return res.status(500).json({ error: "Error sending verification email." });
      res.status(200).json({ message: `Verification email sent to ${email}` });
    });
  });
});

app.get("/verify", (req, res) => {
  const { token, email } = req.query;
  User.findOne({ email, verificationToken: token }, (err, user) => {
    if (!user) return res.status(400).json({ error: "Invalid or expired verification link." });

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
    req.logout();
    return res.status(401).json({ error: "Account not verified." });
  }
  res.redirect(FRONTEND_URL);
});

app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

// === Serve React frontend (after routes) ===
app.use(express.static(path.join(__dirname, "build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

// === Socket.IO Logic ===
io.on("connection", (socket) => {
  console.log("🟢 A user connected");

  socket.on("joinRoom", ({ username, room }) => {
    socket.join(room);
    console.log(`${username} joined room: ${room}`);
    socket.to(room).emit("message", {
      username: "System",
      text: `${username} has joined the chat.`,
    });
  });

  socket.on("sendMessage", ({ username, text }) => {
    console.log(`💬 ${username}: ${text}`);
    io.to("battlemap").emit("message", { username, text });
  });

  socket.on("disconnect", () => {
    console.log("🔴 A user disconnected");
  });
});

// === Start the server with Socket.IO ===
server.listen(PORT, () => {
  console.log(`🚀 Server running with WebSocket on http://localhost:${PORT}`);
});
