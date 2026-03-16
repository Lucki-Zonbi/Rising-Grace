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
