const responses = JSON.parse(localStorage.getItem("questionnaireResponses"));

function hasCompletedQuestionnaire() {
    return responses && responses.length > 0;
}

// Guard on page load
if (!hasCompletedQuestionnaire() && !isPreviewMode()) {
    alert("Complete questionnaire first.");
    window.location.href = "/questionnaire.html";
}

async function scheduleSession() {
    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;
    const messageEl = document.getElementById("message");
    const token = localStorage.getItem("token");

    if (!date || !time) {
        messageEl.innerText = "Please select date and time.";
        return;
    }

    if (!hasCompletedQuestionnaire() && !isPreviewMode()) {
        alert("Complete questionnaire first.");
        window.location.href = "/questionnaire.html";
        return;
    }

    if (!token) {
        messageEl.innerText = "You must be logged in to schedule a session.";
        return;
    }

    try {
        messageEl.innerText = "Processing...";

        const res = await fetch("/api/schedule", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ date, time })
        });

        const data = await res.json();

        messageEl.innerText = data.message || data.error || "Unable to process request.";

        if (data.error === "Post-session survey required before scheduling another session") {
        alert("You must complete your post-session survey before booking another session.");

        setTimeout(() => {
        window.location.href = data.redirectTo || "/post-session-survey.html";
        }, 1000);

        return;
        }

        if (data.error === "Payment required before scheduling") {
            localStorage.setItem("pendingSession", JSON.stringify({ date, time }));

            setTimeout(() => {
                window.location.href = "/payment.html";
            }, 1000);

            return;
        }

        if (data.message) {
            localStorage.removeItem("pendingSession");

            setTimeout(() => {
                window.location.href = "/dashboard.html";
            }, 1000);
        }

    } catch (err) {
        console.error("Schedule error:", err);
        messageEl.innerText = "Error scheduling session.";
    }
}
