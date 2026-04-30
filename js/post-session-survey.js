let pendingSessionId = null;
let organizedAnswer = null;
let durationAnswer = null;
let comfortRating = null;

window.addEventListener("DOMContentLoaded", () => {
    loadPendingSurvey();
    buildComfortScale();
});

function buildComfortScale() {
    const scale = document.getElementById("comfortScale");

    if (!scale) return;

    scale.innerHTML = "";

    for (let i = 1; i <= 10; i++) {
        const button = document.createElement("button");
        button.type = "button";
        button.innerText = i;

        button.addEventListener("click", () => {
            comfortRating = i;
            document.getElementById("comfortChoice").innerText = `Selected: ${i}/10`;
        });

        scale.appendChild(button);
    }
}

function setOrganized(value) {
    organizedAnswer = value;
    document.getElementById("organizedChoice").innerText = value ? "Selected: Yes" : "Selected: No";
}

function setDuration(value) {
    durationAnswer = value;
    document.getElementById("durationChoice").innerText = `Selected: ${value}`;
}

async function loadPendingSurvey() {
    const token = localStorage.getItem("token");
    const messageEl = document.getElementById("surveyMessage");
    const summaryEl = document.getElementById("sessionSummary");

    if (!token) {
        messageEl.innerText = "You must be logged in to complete the survey.";
        return;
    }

    try {
        const res = await fetch("/api/feedback/pending", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await res.json();

        if (!data.hasPendingSurvey) {
            summaryEl.innerText = "No post-session survey is currently required.";
            messageEl.innerText = "You may return to the dashboard.";
            return;
        }

        pendingSessionId = data.session._id;

        summaryEl.innerText = data.session.sessionNotes || "No session summary was provided.";
    } catch (err) {
        console.error("Load pending survey error:", err);
        messageEl.innerText = "Unable to load post-session survey.";
    }
}

async function submitPostSessionSurvey() {
    const token = localStorage.getItem("token");
    const messageEl = document.getElementById("surveyMessage");

    const mostHelpful = document.getElementById("mostHelpful").value.trim();
    const needsImprovement = document.getElementById("needsImprovement").value.trim();

    if (!pendingSessionId) {
        messageEl.innerText = "No completed session found for feedback.";
        return;
    }

    if (organizedAnswer === null) {
        messageEl.innerText = "Please answer whether the session was organized.";
        return;
    }

    if (!durationAnswer) {
        messageEl.innerText = "Please select whether the duration was appropriate.";
        return;
    }

    if (!comfortRating) {
        messageEl.innerText = "Please select a comfort rating from 1 to 10.";
        return;
    }

    try {
        const res = await fetch("/api/feedback", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                sessionId: pendingSessionId,
                organized: organizedAnswer,
                durationAppropriate: durationAnswer,
                comfortRating,
                mostHelpful,
                needsImprovement
            })
        });

        const data = await res.json();

        if (!res.ok) {
            messageEl.innerText = data.error || "Unable to submit survey.";
            return;
        }

        messageEl.innerText = "Survey submitted successfully. You may now schedule your next session.";

        setTimeout(() => {
            window.location.href = "/schedule.html";
        }, 1200);
    } catch (err) {
        console.error("Submit survey error:", err);
        messageEl.innerText = "Unable to submit survey.";
    }
}
