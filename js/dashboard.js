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
