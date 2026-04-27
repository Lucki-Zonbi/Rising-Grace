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
        <button onclick="loadClientSessionHistory('${s.userId?._id}')">
    View Client File
</button>
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

async function loadPayments() {
    const token = localStorage.getItem("token");
    const container = document.getElementById("paymentsList");

    if (!container) return;

    try {
        const res = await fetch("/api/payment/all", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const payments = await res.json();

        if (!Array.isArray(payments) || payments.length === 0) {
            container.innerHTML = "<p>No payments found.</p>";
            return;
        }

        container.innerHTML = payments.map(payment => `
            <div class="card">
                <p><strong>${payment.userId?.name || "Unknown User"}</strong></p>
                <p>${payment.userId?.email || "No email available"}</p>
                <p>Amount: $${((payment.amount || 0) / 100).toFixed(2)}</p>
                <p>Status: ${payment.status}</p>
                <p>Created: ${new Date(payment.createdAt).toLocaleString()}</p>
                <p>Stripe Session: ${payment.stripeSessionId || "N/A"}</p>

                ${payment.status === "paid" ? `
                    <button onclick="refundPayment('${payment._id}')">Refund</button>
                ` : ""}
            </div>
        `).join("");
    } catch (err) {
        console.error("Load payments error:", err);
        container.innerHTML = "<p>Error loading payments.</p>";
    }
}

async function refundPayment(id) {
    const token = localStorage.getItem("token");

    try {
        const res = await fetch(`/api/payment/refund/${id}`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await res.json();
        alert(data.message || data.error || "Refund processed");

        loadPayments();
    } catch (err) {
        console.error("Refund error:", err);
        alert("Refund failed");
    }
}

if (document.getElementById("paymentsList")) {
    loadPayments();
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

async function loadClientSessionHistory(userId) {
    const token = localStorage.getItem("token");
    const container = document.getElementById("clientSessionHistory");

    if (!container || !userId) return;

    try {
        const res = await fetch(`/api/schedule/client-history/${userId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const sessions = await res.json();

        if (!Array.isArray(sessions) || sessions.length === 0) {
            container.innerHTML = "<p>No sessions recorded for this client.</p>";
            return;
        }

        container.innerHTML = sessions.map(session => `
            <div class="card">
                <p><strong>${session.date || "No date"} at ${session.time || "No time"}</strong></p>
                <p>Status: ${session.status}</p>
                <p>Source: ${session.source || "internal"}</p>
                <p>Meeting Platform: ${session.meetingProvider || "Not recorded"}</p>
                <p>
                    Meeting Link:
                    ${
                        session.meetingLink
                            ? `<a href="${session.meetingLink}" target="_blank">Open Session Link</a>`
                            : "Not available"
                    }
                </p>
                <p>
                    Recording:
                    ${
                        session.recordingLink
                            ? `<a href="${session.recordingLink}" target="_blank">Open Recording</a>`
                            : "Not uploaded"
                    }
                </p>
                <p>Created: ${new Date(session.createdAt).toLocaleString()}</p>
            </div>
        `).join("");
    } catch (err) {
        console.error("Client history error:", err);
        container.innerHTML = "<p>Error loading client session history.</p>";
    }
}
