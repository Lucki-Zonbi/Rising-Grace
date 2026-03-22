const { authorize } = require("../middleware/roleMiddleware");
const { detectThreat } = require("../services/threatDetection");
const { protect } = require("../middleware/authMiddleware");
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password,} = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role:"user"
    });

    res.status(201).json({
      message: "User registered successfully",
      userId: user._id,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const user = await User.findOne({ email });

    console.log("LOGIN EMAIL:", email);
    console.log("USER FOUND:", user);

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if account is currently locked
    if (user.locked && user.lockUntil > Date.now()) {
      return res.status(403).json({
        message: "Account locked. Try again later."
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    console.log("PASSWORD MATCH:", isMatch);

    if (!isMatch) {

  await detectThreat({
    type: "FAILED_LOGIN",
    email,
    ip: req.ip,
    userAgent: req.headers["user-agent"]
  });
// Increase login atempts
  user.loginAttempts += 1;

  // Lock account if 5 failed attempts
  if (user.loginAttempts >= 5) {
    user.locked = true;
    user.lockUntil = Date.now() + (20 * 60 * 1000);
  }

  await user.save();

  return res.status(401).json({ message: "Invalid credentials" });
}

    // Successful login → reset attempts
    user.loginAttempts = 0;
    user.locked = false;
    user.lockUntil = null;

    user.lastLogin = new Date();

    await detectThreat({
  type: "LOGIN_SUCCESS",
  email,
  ip: req.ip,
  userAgent: req.headers["user-agent"]
});

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      role: user.role
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Protected route example
router.get("/me", protect, async (req, res) => {
  res.json(req.user);
});

// Admin-only route
router.get("/admin", protect, authorize("admin"), (req, res) => {
  res.json({ message: "Admin access granted" });
});

router.post("/create-admin", async (req, res) => {
  try {

    const { name, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "admin"
    });

    res.json({ message: "Admin created", user });

  } catch (err) {
    res.status(500).json({ message: "Error creating admin" });
  }
});
