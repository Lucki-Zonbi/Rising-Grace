const SecurityEvent = require("../models/SecurityEvent");

async function detectThreat(eventData) {
  try {

    // Log the security event
    const event = new SecurityEvent({
      type: eventData.type,
      email: eventData.email,
      ip: eventData.ip,
      userAgent: eventData.userAgent,
      timestamp: new Date()
    });

    await event.save();

    console.log("Security Event Logged:", eventData.type);


    // -----------------------------------
    // ARIEZ THREAT DETECTION LOGIC
    // -----------------------------------

    // Detect repeated failed login attempts from same IP
    if (eventData.type === "LOGIN_FAILED") {

      const failedAttempts = await SecurityEvent.countDocuments({
        type: "LOGIN_FAILED",
        ip: eventData.ip,
        timestamp: { $gte: new Date(Date.now() - 10 * 60 * 1000) } // last 10 minutes
      });

      if (failedAttempts >= 5) {

        const threatAlert = new SecurityEvent({
          type: "THREAT_ALERT",
          email: eventData.email,
          ip: eventData.ip,
          userAgent: eventData.userAgent,
          details: "Multiple failed login attempts detected",
          timestamp: new Date()
        });

        await threatAlert.save();

        console.log("🚨 ARIEZ ALERT: Possible brute force attack detected");

      }

    }

  } catch (error) {

    console.error("Threat detection error:", error);

  }
}

module.exports = { detectThreat };
