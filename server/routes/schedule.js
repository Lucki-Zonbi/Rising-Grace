const express = require("express");
const router = express.Router();
const Questionnaire = require("../models/Questionnaire");

const express = require("express");
const router = express.Router();
const Questionnaire = require("../models/Questionnaire");
const Schedule = require("../models/Schedule");

router.post("/", async (req, res) => {
    try {
        const { userId, date, time } = req.body;

        // 1. Check questionnaire
        const exists = await Questionnaire.findOne({ userId });
        if (!exists) {
            return res.status(403).json({
                error: "Complete questionnaire first"
            });
        }

        // 2. Max 2/day
        const daily = await Schedule.find({ userId, date });

        if (daily.length >= 2) {
            return res.status(400).json({
                error: "Max 2 sessions per day"
            });
        }

        // 3. 1-hour spacing
        const newTime = new Date(`${date}T${time}`);

        for (let b of daily) {
            const existing = new Date(`${b.date}T${b.time}`);
            const diff = Math.abs(newTime - existing) / (1000 * 60);

            if (diff < 60) {
                return res.status(400).json({
                    error: "Must be at least 1 hour apart"
                });
            }
        }

        // 4. Save
        const booking = new Schedule({ userId, date, time });
        await booking.save();

        res.json({ message: "Session booked successfully" });

    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;

router.post("/", async (req, res) => {
    const { userId, date, time } = req.body;

    // Questionnaire enforcement
    const exists = await Questionnaire.findOne({ userId });

    if (!exists) {
        return res.status(403).json({
            error: "Complete questionnaire first"
        });
    }

    // Max 2/day
    const daily = bookings.filter(
        b => b.userId === userId && b.date === date
    );

    if (daily.length >= 2) {
        return res.status(400).json({
            error: "Max 2 sessions per day"
        });
    }

    // 1-hour spacing
    const newTime = new Date(`${date}T${time}`);

    for (let b of daily) {
        const existing = new Date(`${b.date}T${b.time}`);
        const diff = Math.abs(newTime - existing) / (1000 * 60);

        if (diff < 60) {
            return res.status(400).json({
                error: "Must be 1 hour apart"
            });
        }
    }

    bookings.push({ userId, date, time });

    res.json({ message: "Booked successfully" });
});

router.get("/all", async (req, res) => {
    try {
        const sessions = await Schedule.find().populate("userId", "name email");

        res.json(sessions);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});
module.exports = router;
