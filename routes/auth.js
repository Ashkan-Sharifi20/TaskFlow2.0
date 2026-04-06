const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();
const User = require("../models/UserModel");

// GET: Display registration form
router.get("/register", (req, res) => {
  res.render("register", { error: null });
});

// POST: Create a new user account
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  
  try {
    // Check if user already exists
    const existing = await User.findOne({ $or: [{ username }, { email }] });
    if (existing) {
      return res.render("register", { error: "Username or email already taken." });
    }

    // Create the user object (The Model's .pre("save") hook handles hashing)
    const user = new User({ username, email, password });
    await user.save();
    
    res.redirect("/login");

  } catch (err) {
    console.error("Registration Error:", err);
    res.render("register", { error: "Something went wrong. Please try again." });
  }
});

// GET: Display login form
router.get("/login", (req, res) => {
  res.render("login", { error: null });
});

// POST: Authenticate user and start session
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  
  try {
    // 1. Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.render("login", { error: "Invalid username or password." });
    }

    // 2. Compare entered password with the hashed password in DB
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.render("login", { error: "Invalid username or password." });
    }

    // 3. Set session
    req.session.user = { 
      id: user._id.toString(), 
      username: user.username 
    };

    /**
     * FIXED REDIRECT:
     * Since taskRoutes are mounted at "/tasks" in server.js, 
     * the dashboard route is actually "/tasks/dashboard"
     */
    res.redirect("/tasks/dashboard");

  } catch (err) {
    console.error("Login Error:", err);
    res.render("login", { error: "An error occurred during login." });
  }
});

// GET: Destroy session
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error("Logout Error:", err);
    res.redirect("/login");
  });
});

module.exports = router;