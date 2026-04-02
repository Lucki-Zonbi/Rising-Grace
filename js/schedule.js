const responses = JSON.parse(localStorage.getItem("questionnaireResponses"));

if ((!responses || responses.length === 0) && !isPreviewMode()) {
    alert("Complete questionnaire first.");
    window.location.href = "/questionnaire.html";
    return;
    }

async function scheduleSession() {
    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;

    const token = localStorage.getItem("token");

    if (!date || !time) {
        document.getElementById("message").innerText = "Please select date and time.";
        return;
    }

    if (!questionnaireCompleted && !isPreviewMode()) {
    alert("Complete questionnaire first");
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

//Redirect if payment required
if (data.error === "Payment required before scheduling") {
    setTimeout(() => {
        window.location.href = "/payment.html";
    }, 1000);
}

// REDIRECT AFTER SUCCESS
if (data.message) {
    setTimeout(() => {
        window.location.href = "/payment.html";
    }, 1000);
}

        // REDIRECT AFTER SUCCESS
        if (data.message) {
        setTimeout(() => {
        window.location.href = "/payment.html";
        }, 1000); // slight delay so user sees message
    }

    } catch (err) {
        document.getElementById("message").innerText = "Error scheduling session.";
    }
}
