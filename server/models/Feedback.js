const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    sessionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Schedule",
        required: true
    },
    organized: {
        type: Boolean,
        required: true
    },
    durationAppropriate: {
        type: String,
        enum: ["Too short", "Just right", "Too long"],
        required: true
    },
    comfortRating: {
        type: Number,
        min: 1,
        max: 10,
        required: true
    },
    mostHelpful: {
        type: String,
        default: ""
    },
    needsImprovement: {
        type: String,
        default: ""
    },
    teresaSessionSummary: {
        type: String,
        default: ""
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Feedback", feedbackSchema);
