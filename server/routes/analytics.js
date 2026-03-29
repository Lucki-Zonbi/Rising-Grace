const express = require("express");
const router = express.Router();

const Schedule = require("../models/Schedule");
const Questionnaire = require("../models/Questionnaire");
const { protect } = require("../middleware/authMiddleware");

// GET /api/analytics/stats
router.get("/stats", protect, async (req, res) => {
    try {
        // Optional: Admin-only protection
        if (req.user.role !== "admin") {
            return res.status(403).json({ error: "Admin access only" });
        }

        // Total sessions
        const totalSessions = await Schedule.countDocuments();

        // Unique users who completed questionnaire
        const users = await Questionnaire.distinct("userId");

        // Readiness breakdown
        const low = await Questionnaire.countDocuments({ score: { $lt: 4 } });
        const medium = await Questionnaire.countDocuments({
            score: { $gte: 4, $lt: 7 }
        });
        const high = await Questionnaire.countDocuments({
            score: { $gte: 7 }
        });

        res.json({
            totalSessions,
            totalUsers: users.length,
            readiness: {
                low,
                medium,
                high
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
