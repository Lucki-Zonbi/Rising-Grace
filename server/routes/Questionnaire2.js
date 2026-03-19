const express = require("express");
const router = express.Router();
const Questionnaire = require("../models/Questionnaire");

// reuse same logic
function calculateReadiness(responses) {
    let total = 0;
    let count = 0;

    responses.forEach(q => {
        if (q.type === "scale") {
            total += Number(q.answer);
            count++;
        }
    });

    const avg = count ? total / count : 0;

    let level = "Low";
    if (avg >= 7) level = "High";
    else if (avg >= 4) level = "Medium";

    return {
        score: Number(avg.toFixed(1)),
        level
    };
}

router.post("/submit", async (req, res) => {
    try {
        const { userId, responses } = req.body;

        const result = calculateReadiness(responses);

        const record = new Questionnaire({
            userId,
            responses,
            score: result.score,
            level: result.level
        });

        await record.save();

        res.json({ success: true, result });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
