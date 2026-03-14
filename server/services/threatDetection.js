const SecurityEvent = require("../models/SecurityEvent");

async function detectThreat(eventData) {
  try {

    const event = new SecurityEvent({
      type: eventData.type,
      email: eventData.email,
      ip: eventData.ip,
      userAgent: eventData.userAgent,
      timestamp: new Date()
    });

    await event.save();

    console.log("Security Event Logged:", eventData.type);

  } catch (error) {
    console.error("Threat detection error:", error);
  }
}

module.exports = { detectThreat };
