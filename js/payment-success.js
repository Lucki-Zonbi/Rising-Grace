async function autoSchedule() {
    const token = localStorage.getItem("token");
    const pending = JSON.parse(localStorage.getItem("pendingSession"));
    const messageEl = document.getElementById("successMessage");

    if (!pending) {
        messageEl.innerText = "No pending session was found.";
        return;
    }

    if (!token) {
        messageEl.innerText = "You must be logged in to complete scheduling.";
        return;
    }

    try {
        messageEl.innerText = "Finalizing your booking...";

        const res = await fetch("/api/schedule", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(pending)
        });

        const data = await res.json();

        if (data.message) {
            localStorage.removeItem("pendingSession");
            messageEl.innerText = data.message;

            setTimeout(() => {
                window.location.href = "/dashboard.html";
            }, 1500);

            return;
        }

        messageEl.innerText = data.error || "Scheduling failed.";
    } catch (err) {
        console.error("Auto schedule error:", err);
        messageEl.innerText = "Error scheduling session.";
    }
}

autoSchedule();
