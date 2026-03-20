const mongoose = require("mongoose");

const ScheduleSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    date: String,
    time: String,
    status: { type: String, default: "booked" },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Schedule", ScheduleSchema);
