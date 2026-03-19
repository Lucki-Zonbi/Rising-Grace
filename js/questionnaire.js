const responses = {};

// Create 1–10 scales
document.querySelectorAll(".scale").forEach(scale => {

    const question = scale.dataset.question;

    for (let i = 1; i <= 10; i++) {

        const btn = document.createElement("button");
        btn.innerText = i;

        btn.addEventListener("click", () => {

            responses[question] = i;

            scale.querySelectorAll("button").forEach(b => b.classList.remove("selected"));
            btn.classList.add("selected");

        });

        scale.appendChild(btn);
    }
});


// Submit
document.getElementById("submitBtn").addEventListener("click", () => {

    const errorMsg = document.getElementById("errorMsg");
    errorMsg.innerText = "";

    // Collect text responses
    const data = {
        values: document.getElementById("values").value,
        energy: document.getElementById("energy").value,
        balance: responses.balance,
        disappointment: document.getElementById("disappointment").value,

        goal: document.getElementById("goal").value,
        future: document.getElementById("future").value,
        tenVision: document.getElementById("tenVision").value,

        struggles: document.getElementById("struggles").value,
        pastBlocks: document.getElementById("pastBlocks").value,
        sabotage: document.getElementById("sabotage").value,
        fears: document.getElementById("fears").value,

        learningStyle: document.getElementById("learningStyle").value,
        support: document.getElementById("support").value,
        help: document.getElementById("help").value,
        challenge: document.getElementById("challenge").value,

        firstStep: document.getElementById("firstStep").value,
        commitment: responses.commitment,
        sacrifice: document.getElementById("sacrifice").value
    };

    // Basic validation
    for (let key in data) {
        if (!data[key]) {
            errorMsg.innerText = "Please complete all fields.";
            return;
        }
    }

    // Acknowledgment check
    if (!document.getElementById("ack").checked) {
        errorMsg.innerText = "You must accept the acknowledgment.";
        return;
    }

    // Save to localStorage
    localStorage.setItem("questionnaireResponses", JSON.stringify(data));

    alert("Assessment submitted successfully!");

    // Redirect
    window.location.href = "dashboard.html";

});

await fetch("/api/questionnaire/submit", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        userId: localStorage.getItem("userId"),
        responses
    })
});
