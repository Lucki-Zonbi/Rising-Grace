const express = require("express");
const router = express.Router();

const SecurityEvent = require("../models/SecurityEvent");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

router.post("/event", async (req, res) => {

  try {

    const { event, user, details } = req.body;

    const securityEvent = new SecurityEvent({
      event,
      user,
      details,
      ip: req.ip
    });

    await securityEvent.save();

    res.status(201).json({ message: "Security event logged" });

  } catch (error) {

    res.status(500).json({ error: "Failed to log security event" });

  }

});

// 🔎 View all security events (admin only)
router.get("/events", protect, authorize("admin"), async (req, res) => {

  try {

    const events = await SecurityEvent.find()
      .sort({ timestamp: -1 })
      .limit(100);

    res.json(events);

  } catch (error) {

    res.status(500).json({ message: "Failed to retrieve events" });

  }

});


// 🔎 View events by user
router.get("/events/user/:user", protect, authorize("admin"), async (req, res) => {

  try {

    const events = await SecurityEvent.find({
      user: req.params.user
    }).sort({ timestamp: -1 });

    res.json(events);

  } catch (error) {

    res.status(500).json({ message: "Failed to retrieve user events" });

  }

});

module.exports = router;
