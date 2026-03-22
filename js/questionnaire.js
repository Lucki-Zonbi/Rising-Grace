/* =========================================
   QUESTIONNAIRE ENGINE – FINAL VERSION
========================================= */

const responses = {};

// Optional preview mode helper (safe if already defined elsewhere)
function isPreviewMode() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("preview") === "true" ||
           localStorage.getItem("previewMode") === "true";
}

document.addEventListener("DOMContentLoaded", () => {

    /* =========================
       CREATE 1–10 SCALE UI
    ========================= */
    document.querySelectorAll(".scale").forEach(scale => {

        const question = scale.dataset.question;

        scale.classList.add("scale-container");

        for (let i = 1; i <= 10; i++) {

            const btn = document.createElement("button");
            btn.innerText = i;
            btn.classList.add("scale-btn");

            btn.addEventListener("click", () => {

                responses[question] = i;

                scale.querySelectorAll(".scale-btn")
                    .forEach(b => b.classList.remove("selected"));

                btn.classList.add("selected");

            });

            scale.appendChild(btn);
        }
    });

    /* =========================
       SUBMIT HANDLER
    ========================= */
    const submitBtn = document.getElementById("submitBtn");

    if (submitBtn) {

        submitBtn.addEventListener("click", async () => {

            const errorMsg = document.getElementById("errorMsg");
            errorMsg.innerText = "";

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

            /* =========================
               VALIDATION (SKIP IN PREVIEW)
            ========================= */
            if (!isPreviewMode()) {

                for (let key in data) {
                    if (!data[key]) {
                        errorMsg.innerText = "Please complete all fields.";
                        return;
                    }
                }

                if (!document.getElementById("ack").checked) {
                    errorMsg.innerText = "You must accept the acknowledgment.";
                    return;
                }
            }

            try {

                /* =========================
                   SAVE LOCALLY
                ========================= */
                localStorage.setItem("questionnaireResponses", JSON.stringify(data));

                /* =========================
                   SEND TO BACKEND (FIXED)
                ========================= */
                await fetch("/api/questionnaire/submit", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        userId: localStorage.getItem("userId"),
                        responses: data
                    })
                });

                alert("Assessment submitted successfully!");

                window.location.href = "dashboard.html";

            } catch (error) {

                console.error("Submission error:", error);
                errorMsg.innerText = "Error submitting questionnaire. Try again.";

            }

        });
    }

});
