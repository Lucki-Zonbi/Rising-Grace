const mongoose = require("mongoose");

const ScheduleSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    date: String,
    time: String,
    status: {
        type: String,
        enum: ["booked", "cancelled", "pending_payment"],
        default: "booked"
    },
    source: {
        type: String,
        enum: ["internal", "calendly"],
        default: "internal"
    },
    calendlyEventUri: {
        type: String,
        default: null
    },
    calendlyInviteeUri: {
        type: String,
        default: null
    },
    inviteeEmail: {
        type: String,
        default: null
    },
    inviteeName: {
        type: String,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
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
sessionNotes: {
    type: String,
    default: ""
},
recordingLink: {
    type: String,
    default: null
},
completedAt: {
    type: Date,
    default: null
}
});

module.exports = mongoose.model("Schedule", ScheduleSchema);
