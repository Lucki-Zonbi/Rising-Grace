const express = require("express");
const router = express.Router();

const Feedback = require("../models/Feedback");
const Schedule = require("../models/Schedule");
const { protect } = require("../middleware/authMiddleware");

// Check if client has a completed session that still needs feedback
router.get("/pending", protect, async (req, res) => {
    try {
        const userId = req.user._id;

        const completedSessions = await Schedule.find({
            userId,
            status: "completed"
        }).sort({ completedAt: -1, createdAt: -1 });

        for (const session of completedSessions) {
            const existingFeedback = await Feedback.findOne({
                userId,
                sessionId: session._id
            });

            if (!existingFeedback) {
                return res.json({
                    hasPendingSurvey: true,
                    session: {
                        _id: session._id,
                        date: session.date,
                        time: session.time,
                        sessionNotes: session.sessionNotes || "No session summary was provided.",
                        completedAt: session.completedAt
                    }
                });
            }
        }

        res.json({
            hasPendingSurvey: false,
            session: null
        });
    } catch (err) {
        console.error("Pending feedback check error:", err);
        res.status(500).json({ error: "Unable to check feedback status" });
    }
});

// Submit post-session feedback
router.post("/", protect, async (req, res) => {
    try {
        const userId = req.user._id;

        const {
            sessionId,
            organized,
            durationAppropriate,
            comfortRating,
            mostHelpful,
            needsImprovement
        } = req.body;

        if (!sessionId) {
            return res.status(400).json({ error: "Session ID is required" });
        }

        const session = await Schedule.findOne({
            _id: sessionId,
            userId,
            status: "completed"
        });

        if (!session) {
            return res.status(404).json({ error: "Completed session not found" });
        }

        const existingFeedback = await Feedback.findOne({
            userId,
            sessionId
        });

        if (existingFeedback) {
            return res.status(400).json({ error: "Feedback already submitted for this session" });
        }

        if (typeof organized !== "boolean") {
            return res.status(400).json({ error: "Please answer whether the session was organized" });
        }

        if (!["Too short", "Just right", "Too long"].includes(durationAppropriate)) {
            return res.status(400).json({ error: "Please select a valid session duration response" });
        }

        const ratingNumber = Number(comfortRating);

        if (ratingNumber < 1 || ratingNumber > 10) {
            return res.status(400).json({ error: "Comfort rating must be between 1 and 10" });
        }

        const feedback = await Feedback.create({
            userId,
            sessionId,
            organized,
            durationAppropriate,
            comfortRating: ratingNumber,
            mostHelpful,
            needsImprovement,
            teresaSessionSummary: session.sessionNotes || ""
        });

        res.json({
            message: "Post-session survey submitted successfully",
            feedback
        });
    } catch (err) {
        console.error("Feedback submit error:", err);
        res.status(500).json({ error: "Unable to submit feedback" });
    }
});

// Admin: view all feedback
router.get("/all", protect, async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ error: "Admin only" });
        }

        const feedback = await Feedback.find()
            .populate("userId", "name email")
            .populate("sessionId", "date time status sessionNotes")
            .sort({ createdAt: -1 });

        res.json(feedback);
    } catch (err) {
        console.error("All feedback error:", err);
        res.status(500).json({ error: "Unable to load feedback" });
    }
});

module.exports = router;
