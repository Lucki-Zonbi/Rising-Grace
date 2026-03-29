const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const cors = require("cors");

dotenv.config();

const app = express();

// Routes
const analyticsRoutes = require("./routes/analytics");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const security = require("./routes/security"); // this matches your actual file
const questionnaireRoutes = require("./routes/Questionnaire2");
const scheduleRoutes = require("./routes/schedule");

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "10kb" }));

// API routes
app.use("/api/analytics", analyticsRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/security", security); // correctly mounted
app.use("/api/questionnaire", questionnaireRoutes);
app.use("/api/schedule", scheduleRoutes);

// Basic route
app.get("/", (req, res) => {
  res.json({ message: "Rising Grace API Running Securely 🚀" });
});

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected Securely");

    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err.message);
  });
