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

const User = require("./model/User");

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || "/";

// Connect to MongoDB
mongoose.connect("mongodb+srv://mannavavamsi03:Oxygen689@dungeondweller.jeulo.mongodb.net/?retryWrites=true&w=majority&appName=DungeonDweller", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch(err => console.error("MongoDB Atlas connection error:", err));

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

// Email Transporter (for email verification)
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "mannavavamsi03@gmail.com",
    pass: "ytgv evxh iubv vnwj" 
  }
});

// === Routes ===

// Home route
app.get("/", (req, res) => {
  res.render("home");
});

// Registration page route
app.get("/register", (req, res) => {
  res.render("register");
});

// Login page route
app.get("/login", (req, res) => {
  res.render("login");
});

// Registration handler with email verification
app.post("/register", (req, res) => {
  const { username, email, password } = req.body;
  
  const token = crypto.randomBytes(16).toString("hex");
  let newUser = new User({ username, email, verificationToken: token, isVerified: false });
  
  User.register(newUser, password, (err, user) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Account Verification",
      text: `Hello ${username},\n\nPlease verify your account by clicking the link below:\n\n${req.protocol}://${req.get("host")}/verify?token=${token}&email=${email}\n`
    };
    
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).json({ error: "Error sending verification email." });
      }
      res.status(200).json({ message: `Verification email sent to ${email}` });
    });
  });
});

// Verification route
app.get("/verify", (req, res) => {
  const { token, email } = req.query;
  
  User.findOne({ email, verificationToken: token }, (err, user) => {
    if (!user) {
      return res.status(400).json({ error: "Invalid or expired verification link." });
    }
    
    user.isVerified = true;
    user.verificationToken = undefined;
    user.save((saveErr) => {
      if (saveErr) {
        return res.status(500).json({ error: "Technical error during verification." });
      }
      res.status(200).json({ message: "Your account has been verified. You can now log in." });
    });
  });
});

// Login route
app.post("/login", passport.authenticate("local", {
  failureRedirect: "/login"
}), (req, res) => {
  if (!req.user.isVerified) {
    req.logout();
    return res.status(401).json({ error: "Your account is not verified. Please check your email." });
  }
  res.redirect(FRONTEND_URL); // Redirect to React frontend after successful login
});

// Logout route
app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

// === Serve React Frontend ===
// This should come AFTER all other routes
app.use(express.static(path.join(__dirname, "build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
