const responses = JSON.parse(localStorage.getItem("questionnaireResponses"));

if (!responses || responses.length === 0) {
    alert("Complete questionnaire first.");
    window.location.href = "/questionnaire.html";
}

async function scheduleSession() {
    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;

    const res = await fetch("/api/schedule", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            userId: localStorage.getItem("userId"),
            date,
            time
        })
    });

    const data = await res.json();

    document.getElementById("message").innerText =
        data.message || data.error;
}
