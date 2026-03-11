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
