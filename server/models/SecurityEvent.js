const mongoose = require("mongoose");

const securityEventSchema = new mongoose.Schema({
  event: String,
  user: String,
  details: Object,
  timestamp: {
    type: Date,
    default: Date.now
  },
  ip: String
});

module.exports = mongoose.model("SecurityEvent", securityEventSchema);
