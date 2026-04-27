/* ======================================
   ARIEZ AI SECURITY ENGINE
====================================== */

const Ariez = {

    sessionStart: Date.now(),

    securityLog: [],

    logEvent(eventType, details) {

    const entry = {
        time: new Date().toISOString(),
        event: eventType,
        details: details
    };

    console.log("ARIEZ EVENT:", entry);

    this.securityLog.push(entry);

    // Send event to backend
    if (typeof logSecurityEvent === "function") {
        logSecurityEvent(eventType, details);
    }
    },

    monitorSession() {

        const sessionDuration = Date.now() - this.sessionStart;

        if (sessionDuration > 3600000) { // 1 hour

            this.logEvent("SESSION_TIMEOUT", "Session exceeded safe duration");

            alert("Your session has expired for security reasons.");

            localStorage.removeItem("token");

            window.location.href = "auth/login.html";
        }

    },

    detectSuspiciousLoginAttempts(attemptCount) {

        if (attemptCount >= 5) {

            this.logEvent("SUSPICIOUS_LOGIN_ACTIVITY", {
                attempts: attemptCount
            });

            alert("Multiple failed login attempts detected.");

        }

    }

};

const AriezCalendlyMonitor = {
    maxBookingsPer24Hours: 2,

    async checkCalendlyBookingLoad() {
        const token = localStorage.getItem("token");

        if (!token) return;

        try {
            const response = await fetch("/api/schedule/calendly-booking-load", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                console.warn("Ariez Calendly monitor error:", data.error);
                return;
            }

            if (data.bookingsLast24Hours > this.maxBookingsPer24Hours) {
                this.alertAdmin(data.bookingsLast24Hours);
            }
        } catch (error) {
            console.error("Ariez Calendly monitoring failed:", error);
        }
    },

    alertAdmin(bookingsCount) {
        console.warn(
            `ARIEZ ALERT: ${bookingsCount} Calendly sessions were booked within the last 24 hours.`
        );

        fetch("/api/security/event", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify({
                event: "CALENDLY_BOOKING_VOLUME_ALERT",
                user: "system",
                details: {
                    bookingsLast24Hours: bookingsCount,
                    threshold: this.maxBookingsPer24Hours
                }
            })
        }).catch(error => {
            console.error("Failed to log Ariez Calendly alert:", error);
        });
    }
};
