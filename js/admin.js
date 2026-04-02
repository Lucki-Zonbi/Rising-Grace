async function loadSecurityEvents() {

    const token = localStorage.getItem("token");

    if (!token) {
        console.warn("No token found");
        return;
    }

    try {

        const response = await fetch("http://127.0.0.1:5000/api/security/events", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            console.error("Failed to fetch security events:", response.status);
            return;
        }

        const events = await response.json();

        const eventsContainer = document.getElementById("securityEvents");

        if (!eventsContainer) {
            console.warn("securityEvents element not found in admin.html");
            return;
        }

        if (events.length === 0) {
            eventsContainer.innerHTML = "<p>No security events recorded.</p>";
            return;
        }

        eventsContainer.innerHTML = events.map(event => {

            const time = new Date(event.timestamp).toLocaleString();

            return `
                <div class="event-card">
                    <strong>${event.type || event.event}</strong>
                    <p>User: ${event.email || "Unknown"}</p>
                    <p>IP: ${event.ip || "Unknown"}</p>
                    <p>Time: ${time}</p>
                </div>
            `;

        }).join("");

    } catch (error) {

        console.error("Error loading security events:", error);

    }

}

async function loadUsers(){

const token = localStorage.getItem("token");

try{

const response = await fetch("http://127.0.0.1:5000/api/admin/users",{
headers:{
Authorization:`Bearer ${token}`
}
});

const users = await response.json();

let html="";

users.forEach(user=>{

html += `
<p>
<strong>${user.name}</strong><br>
${user.email}<br>
Role: ${user.role}<br>
Status: ${user.locked ? "Locked" : "Active"}<br>

${user.locked ?
`<button onclick="unlockUser('${user._id}')">Unlock</button>`
: ""}

</p>
<hr>
`;

});

document.getElementById("usersList").innerHTML = html;

}
catch(error){

console.error("User load error",error);

}

}

async function unlockUser(userId){

const token = localStorage.getItem("token");

await fetch(`http://127.0.0.1:5000/api/admin/unlock/${userId}`,{

method:"PUT",

headers:{
Authorization:`Bearer ${token}`
}

});

loadUsers();

}

async function loadSessions() {
    const res = await fetch("/api/schedule/all");
    const sessions = await res.json();

    const container = document.getElementById("sessionsList");

    container.innerHTML = sessions.map(s => `
    <div class="card">
        <p><strong>${s.userId?.name || "User"}</strong></p>
        <p>${s.date} at ${s.time}</p>

        <button onclick="cancelSession('${s._id}')">Cancel</button>
        <button onclick="rescheduleSession('${s._id}')">Reschedule</button>
    </div>
`).join("");
}

// call this ONLY if admin
if (document.getElementById("sessionsList")) {
    loadSessions();
}

document.getElementById("backToDashboard").addEventListener("click", () => {
    window.location.href = "dashboard.html";
});

async function cancelSession(id) {
    const token = localStorage.getItem("token");

    await fetch(`/api/schedule/${id}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    loadSessions();
}

async function rescheduleSession(id) {
    const newDate = prompt("Enter new date (YYYY-MM-DD):");
    const newTime = prompt("Enter new time (HH:MM):");

    const token = localStorage.getItem("token");

    await fetch(`/api/schedule/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ date: newDate, time: newTime })
    });

    loadSessions();
}

async function loadAnalytics() {
    const token = localStorage.getItem("token");

    try {
        const res = await fetch("/api/analytics/stats", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await res.json();

        // Fill numbers
        document.getElementById("totalSessions").innerText = data.totalSessions;
        document.getElementById("totalUsers").innerText = data.totalUsers;
        document.getElementById("lowCount").innerText = data.readiness.low;
        document.getElementById("mediumCount").innerText = data.readiness.medium;
        document.getElementById("highCount").innerText = data.readiness.high;

        // Create chart
        const ctx = document.getElementById("readinessChart");

        // ✅ Prevent duplicate charts
        if (window.readinessChartInstance) {
            window.readinessChartInstance.destroy();
        }

        window.readinessChartInstance = new Chart(ctx, {
            type: "pie",
            data: {
                labels: ["Low", "Medium", "High"],
                datasets: [{
                    data: [
                        data.readiness.low,
                        data.readiness.medium,
                        data.readiness.high
                    ]
                }]
            }
        });

    } catch (err) {
        console.error("Analytics error:", err);
    }
}

async function refundPayment(id) {
    const token = localStorage.getItem("token");

    await fetch(`/api/payment/refund/${id}`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    alert("Payment refunded");
}
