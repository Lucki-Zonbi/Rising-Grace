async function loadDashboard() {

    const token = localStorage.getItem("token");

    if (!token) {
        return;
    }

    try {

        const response = await fetch("http://127.0.0.1:5000/api/auth/me", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const user = await response.json();

         // Format last login time
        let lastLoginFormatted = "First Login";

        if (user.lastLogin) {
            const date = new Date(user.lastLogin);

            lastLoginFormatted = date.toLocaleString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit"
            });
        }

        document.getElementById("userInfo").innerHTML = `
            <p><strong>Name:</strong> ${user.name}</p>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Role:</strong> ${user.role}</p>
            <p><strong>Last Login:</strong> ${lastLoginFormatted}</p>
        `;

         showRoleFeatures(user.role);

    } catch (error) {

        console.error("Dashboard load error:", error);

    }

}

function showRoleFeatures(role) {

    const roleArea = document.getElementById("roleFeatures");

    if (!roleArea) return;

    if (role === "admin") {

        roleArea.innerHTML = `
            <h2>Admin Security Controls</h2>
            <button onclick="goToAdminPanel()">Open Admin Panel</button>
        `;

    } else {

        roleArea.innerHTML = `
            <p>User account active.</p>
        `;

    }
}

function goToAdminPanel() {
    window.location.href = "/admin.html";
}

async function loadSecurityEvents(){

    const token = localStorage.getItem("token");

    if(!token) return;

    try{

        const response = await fetch("http://127.0.0.1:5000/api/security/events",{
            headers:{
                Authorization:`Bearer ${token}`
            }
        });

        const events = await response.json();

        let html = "";

        if(events.length === 0){
            html = "<p>No recent security activity.</p>";
        }

        events.slice(0,5).forEach(event =>{

            const date = new Date(event.timestamp).toLocaleString();

            html += `
                <p>
                <strong>${event.type}</strong><br>
                ${event.email || "Unknown user"}<br>
                <small>${date}</small>
                </p>
                <hr>
            `;
        });

        document.getElementById("securityEvents").innerHTML = html;

    }
    catch(error){

        console.error("Security panel error:",error);

    }
}

function startAriezMonitor(){

setInterval(checkForThreats,5000);

}

async function checkForThreats(){


const token = localStorage.getItem("token");

if(!token) return;

try{

const response = await fetch("http://127.0.0.1:5000/api/security/events",{

headers:{
Authorization:`Bearer ${token}`
}

});

const events = await response.json();


const threatEvent = events.find(event =>

event.type && (
event.type.includes("LOCK") ||
event.type.includes("FAIL") ||
event.type === "FAILED_LOGIN" ||
event.type === "MULTIPLE_FAILED_LOGINS"
));

if(threatEvent){

activateAriezAlert(threatEvent);

}

}
catch(error){

console.error("Ariez monitor error:",error);

}

}

function activateAriezAlert(event){

const banner = document.getElementById("ariezAlertBanner");

banner.classList.remove("hidden");

banner.innerHTML = `
⚠ ARIEZ ALERT: ${event.type} DETECTED
`;

}

const responses = JSON.parse(localStorage.getItem("questionnaireResponses"));

if (responses && responses.length > 0) {
    const result = calculateReadiness(responses);

    document.getElementById("readinessScore").innerText = result.score;
    document.getElementById("readinessLevel").innerText = result.level;

 // (Ariez insight)
    const insight = ariezSchedulingInsight(result.score, 0);

    const ariezEl = document.getElementById("ariezMessage");
    if (ariezEl) {
        ariezEl.innerText = insight;
    }
}

// Ariezz scheduling insight logic (bonus feature)
function ariezSchedulingInsight(score, sessionsToday) {
    if (score < 4) {
        return "⚠️ Client not ready. Limit scheduling.";
    }

    if (score < 7) {
        return "⚠️ Moderate readiness. Recommend 1 session.";
    }

    if (sessionsToday >= 2) {
        return "⛔ Limit reached for today.";
    }

    return "✅ Client ready for scheduling.";
}

function previewPage(url) {
    window.location.href = `${url}?preview=true`;
}

function startFullPreview() {
    localStorage.setItem("previewMode", "true");
    window.location.href = "../index.html?preview=true";
}

async function createAdmin() {

    const name = document.getElementById("adminName").value;
    const email = document.getElementById("adminEmail").value;
    const password = document.getElementById("adminPassword").value;

    const res = await fetch("http://localhost:5000/api/auth/create-admin", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, email, password })
    });

    const data = await res.json();

    alert(data.message);
}
// Ariez live scheduling insight (bonus feature)
async function loadAriezLive() {
    const token = localStorage.getItem("token");

    const res = await fetch("/api/schedule/my-sessions", {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    const sessions = await res.json();

    const today = new Date().toISOString().split("T")[0];

    const sessionsToday = sessions.filter(s => s.date === today).length;

    const responses = JSON.parse(localStorage.getItem("questionnaireResponses"));

    if (responses) {
        const result = calculateReadiness(responses);

        const insight = ariezSchedulingInsight(result.score, sessionsToday);

        const el = document.getElementById("ariezMessage");
        if (el) el.innerText = insight;
    }
}

if (document.getElementById("ariezMessage")) {
    loadAriezLive();
}

const CALENDLY_URL = "https://calendly.com/YOUR-CALENDLY-USERNAME/YOUR-EVENT-TYPE";

document.addEventListener("DOMContentLoaded", () => {
    loadCalendlyPromptAfterRegistration();

    if (typeof AriezCalendlyMonitor !== "undefined") {
        AriezCalendlyMonitor.checkCalendlyBookingLoad();
    }
});

function loadCalendlyPromptAfterRegistration() {
    const calendlySection = document.getElementById("calendlyScheduleSection");
    const calendlyWidget = document.getElementById("calendlyInlineWidget");
    const calendlyMessage = document.getElementById("calendlyMessage");

    if (!calendlySection || !calendlyWidget) return;

    const registrationComplete =
        localStorage.getItem("registrationComplete") === "true";

    if (!registrationComplete) {
        calendlySection.style.display = "none";
        return;
    }

    calendlySection.style.display = "block";

    if (calendlyMessage) {
        calendlyMessage.innerText =
            "Your registration is complete. Please choose an available session time below.";
    }

    if (window.Calendly) {
        Calendly.initInlineWidget({
            url: CALENDLY_URL,
            parentElement: calendlyWidget,
            prefill: {},
            utm: {
                utmSource: "Rising Grace Dashboard",
                utmMedium: "Client Portal",
                utmCampaign: "Post Registration Scheduling"
            }
        });
    } else {
        setTimeout(loadCalendlyPromptAfterRegistration, 500);
    }
}

async function checkPendingPostSessionSurvey() {
    const token = localStorage.getItem("token");
    const surveyCard = document.getElementById("postSessionSurveyCard");

    if (!token || !surveyCard) return;

    try {
        const res = await fetch("/api/feedback/pending", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await res.json();

        if (data.hasPendingSurvey) {
            surveyCard.style.display = "block";
        } else {
            surveyCard.style.display = "none";
        }
    } catch (err) {
        console.error("Pending survey check error:", err);
    }
}
