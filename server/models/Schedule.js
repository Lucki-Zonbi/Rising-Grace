const mongoose = require("mongoose");

const ScheduleSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    date: String,
    time: String,
    status: {
        type: String,
        enum: ["booked", "cancelled", "completed", "pending_payment"],
        default: "booked"
    },
    source: {
        type: String,
        enum: ["internal", "calendly"],
        default: "internal"
    },
    meetingProvider: {
        type: String,
        enum: ["zoom", "google_meet", "microsoft_teams", "calendly", "manual", null],
        default: null
    },
    meetingLink: {
        type: String,
        default: null
    },
    recordingLink: {
        type: String,
        default: null
    },
    sessionNotes: {
        type: String,
        default: ""
    },
    completedAt: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Schedule", ScheduleSchema);
