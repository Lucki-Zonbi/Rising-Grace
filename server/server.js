require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const helmet = require("helmet");
const cors = require("cors");
const path = require("path");

const app = express();

// Routes
const paymentRoutes = require("./routes/payment");
const analyticsRoutes = require("./routes/analytics");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const securityRoutes = require("./routes/security");
const questionnaireRoutes = require("./routes/Questionnaire2");
const scheduleRoutes = require("./routes/schedule");
const feedbackRoutes = require("./routes/feedback");
const reportsRoutes = require("./routes/reports");

// Security middleware
app.use(helmet());
app.use(cors());

// Stripe webhook raw body must come BEFORE express.json()
app.use("/api/payment/webhook", express.raw({ type: "application/json" }));

// Normal body parsers
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, "../public")));

// API routes
app.use("/api/payment", paymentRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/security", securityRoutes);
app.use("/api/questionnaire", questionnaireRoutes);
app.use("/api/schedule", scheduleRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/reports", reportsRoutes);

// Basic route
app.get("/", (req, res) => {
  res.json({ message: "Rising Grace API Running Securely 🚀" });
});

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected Securely");

    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err.message);
  });
