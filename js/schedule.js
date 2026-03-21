const responses = JSON.parse(localStorage.getItem("questionnaireResponses"));

if (!responses || responses.length === 0) {
    alert("Complete questionnaire first.");
    window.location.href = "/questionnaire.html";
}

async function scheduleSession() {
    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;

    const token = localStorage.getItem("token");

    if (!date || !time) {
        document.getElementById("message").innerText = "Please select date and time.";
        return;
    }

    try {
        const res = await fetch("/api/schedule", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}` // ✅ REQUIRED
            },
            body: JSON.stringify({
                date,
                time
            })
        });

        const data = await res.json();

        document.getElementById("message").innerText =
            data.message || data.error;

    } catch (err) {
        document.getElementById("message").innerText = "Error scheduling session.";
    }
}
