const express = require("express");
const router = express.Router();

const Schedule = require("../models/Schedule");
const Questionnaire = require("../models/Questionnaire");
const Payment = require("../models/Payment");
const SecurityEvent = require("../models/SecurityEvent");
const { protect } = require("../middleware/authMiddleware");

//extracting the meeting link from the Calendly payload
function extractMeetingLink(payload) {
    const location = payload.scheduled_event?.location;

    if (!location) return null;

    if (typeof location === "string") {
        return location;
    }

    if (location.join_url) {
        return location.join_url;
    }

    if (location.location) {
        return location.location;
    }

    return null;
}

function detectMeetingProvider(linkOrLocation = "") {
    const value = String(linkOrLocation).toLowerCase();

    if (value.includes("zoom")) return "zoom";
    if (value.includes("meet.google")) return "google_meet";
    if (value.includes("teams.microsoft")) return "microsoft_teams";

    return "calendly";
}

// Create internal Rising Grace schedule
router.post("/", protect, async (req, res) => {
    try {
        const userId = req.user._id;
        const { date, time } = req.body;

        if (!date || !time) {
            return res.status(400).json({ error: "Date and time are required" });
        }

        const questionnaire = await Questionnaire.findOne({ userId });

        if (!questionnaire) {
            return res.status(403).json({
                error: "Complete questionnaire first"
            });
        }

        const payment = await Payment.findOne({
            userId,
            status: "paid",
            used: false
        });

        if (!payment) {
            return res.status(403).json({
                error: "Payment required before scheduling"
            });
        }

        const dailySessions = await Schedule.find({
            userId,
            date,
            status: "booked"
        });

        if (dailySessions.length >= 2) {
            return res.status(400).json({
                error: "Max 2 sessions per day"
            });
        }

        if (questionnaire.score < 4) {
            return res.status(403).json({
                error: "Ariez: Client not ready"
            });
        }

        if (questionnaire.score >= 4 && questionnaire.score < 7 && dailySessions.length >= 1) {
            return res.status(400).json({
                error: "Ariez: Only 1 session allowed"
            });
        }

        const newTime = new Date(`${date}T${time}`);

        for (const session of dailySessions) {
            const existingTime = new Date(`${session.date}T${session.time}`);
            const diff = Math.abs(newTime - existingTime) / (1000 * 60);

            if (diff < 60) {
                return res.status(400).json({
                    error: "Must be at least 1 hour apart"
                });
            }
        }

        const booking = new Schedule({
            userId,
            date,
            time,
            status: "booked",
            source: "internal"
        });

        await booking.save();

        payment.used = true;
        await payment.save();

        res.json({ message: "Session booked successfully" });
    } catch (err) {
        console.error("Schedule creation error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// Calendly webhook: records real Calendly bookings/cancellations
router.post("/calendly-webhook", async (req, res) => {
    try {
        const expectedSecret = process.env.CALENDLY_WEBHOOK_SECRET;
        const receivedSecret = req.headers["x-calendly-webhook-secret"];

        if (expectedSecret && receivedSecret !== expectedSecret) {
            return res.status(401).json({ error: "Invalid Calendly webhook secret" });
        }

        const eventType = req.body.event;
        const payload = req.body.payload || {};

        const calendlyEventUri = payload.event || payload.scheduled_event?.uri || null;
        const calendlyInviteeUri = payload.uri || null;
        const inviteeEmail = payload.email || null;
        const inviteeName = payload.name || null;

        const startTime =
            payload.scheduled_event?.start_time ||
            payload.event_start_time ||
            null;

        const sessionDate = startTime ? startTime.split("T")[0] : null;
        const sessionTime = startTime
            ? new Date(startTime).toTimeString().slice(0, 5)
            : null;

        if (eventType === "invitee.created") {
            const existingBooking = await Schedule.findOne({
                calendlyInviteeUri
            });

            if (!existingBooking) {
                await Schedule.create({
                    userId: matchedUser?._id || null,
                    date: sessionDate,
                    time: sessionTime,
                    status: "booked",
                    source: "calendly",
                    calendlyEventUri,
                    calendlyInviteeUri,
                    inviteeEmail,
                    inviteeName,
                    meetingProvider,
                    meetingLink
                });
            }

            const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

            const bookingsLast24Hours = await Schedule.countDocuments({
                source: "calendly",
                status: "booked",
                createdAt: { $gte: since }
            });

            if (bookingsLast24Hours > 2) {
                await SecurityEvent.create({
                    event: "CALENDLY_BOOKING_VOLUME_ALERT",
                    user: inviteeEmail || "system",
                    details: {
                        bookingsLast24Hours,
                        threshold: 2,
                        latestInvitee: inviteeEmail,
                        latestInviteeName: inviteeName
                    },
                    ip: req.ip
                });
            }
        }

        if (eventType === "invitee.canceled") {
            await Schedule.findOneAndUpdate(
                { calendlyInviteeUri },
                { status: "cancelled" },
                { new: true }
            );
        }

        res.status(200).json({ received: true });
    } catch (err) {
        console.error("Calendly webhook error:", err);
        res.status(500).json({ error: "Calendly webhook failed" });
    }
});

// Ariez monitor endpoint: count Calendly bookings in the last 24 hours
router.get("/calendly-booking-load", protect, async (req, res) => {
    try {
        const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const bookingsLast24Hours = await Schedule.countDocuments({
            source: "calendly",
            status: "booked",
            createdAt: { $gte: since }
        });

        res.json({
            bookingsLast24Hours,
            threshold: 2,
            alert: bookingsLast24Hours > 2
        });
    } catch (err) {
        console.error("Calendly booking load error:", err);
        res.status(500).json({ error: "Unable to check booking load" });
    }
});

// Current user's sessions
router.get("/my-sessions", protect, async (req, res) => {
    try {
        const sessions = await Schedule.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json(sessions);
    } catch (err) {
        console.error("My sessions error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// Admin: all sessions
router.get("/all", protect, async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ error: "Admin only" });
        }

        const sessions = await Schedule.find()
            .populate("userId", "name email")
            .sort({ createdAt: -1 });

        res.json(sessions);
    } catch (err) {
        console.error("All sessions error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// Admin: cancel session
router.delete("/:id", protect, async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ error: "Admin only" });
        }

        const session = await Schedule.findById(req.params.id);

        if (!session) {
            return res.status(404).json({ error: "Session not found" });
        }

        await session.deleteOne();
        res.json({ message: "Session cancelled" });
    } catch (err) {
        console.error("Cancel session error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// Admin: reschedule session
router.put("/:id", protect, async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ error: "Admin only" });
        }

        const { date, time } = req.body;
        const session = await Schedule.findById(req.params.id);

        if (!session) {
            return res.status(404).json({ error: "Session not found" });
        }

        session.date = date || session.date;
        session.time = time || session.time;

        await session.save();

        res.json({ message: "Session updated" });
    } catch (err) {
        console.error("Reschedule error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

router.get("/client-history/:userId", protect, async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ error: "Admin only" });
        }

        const sessions = await Schedule.find({
            userId: req.params.userId
        }).sort({
            date: 1,
            time: 1,
            createdAt: 1
        });

        res.json(sessions);
    } catch (err) {
        console.error("Client session history error:", err);
        res.status(500).json({ error: "Unable to load client history" });
    }
});

module.exports = router;
