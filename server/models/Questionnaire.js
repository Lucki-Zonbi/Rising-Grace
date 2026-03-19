const mongoose = require("mongoose");

const QuestionnaireSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    responses: [
        {
            question: String,
            type: String,
            answer: mongoose.Schema.Types.Mixed
        }
    ],
    score: Number,
    level: String,
    completedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Questionnaire", QuestionnaireSchema);
