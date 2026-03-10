/* ========================================
   Rising Grace Life Coach
   Production Structured JS
======================================== */

document.addEventListener("DOMContentLoaded", function () {

    /* =======================================================
       Login Handler – Connects to API and manages authentication flow
    ======================================================= */

   const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async function (e) {

    e.preventDefault();

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    try {

      const data = await loginUser(email, password);

      // store JWT token
      localStorage.setItem("token", data.token);

      alert("Login successful");

      // redirect to dashboard
      window.location.href = "../dashboard.html";

    } catch (error) {

      alert(error.message || "Login failed");

    }

  });
}

    /* =======================================================
       HOME PAGE – QUOTE ROTATION
    ======================================================= */

    const quoteDisplay = document.getElementById("quote-display");

    if (quoteDisplay) {

        const quotes = [
            "Grace grows when faith overcomes fear.",
            "Every setback prepares you for a comeback.",
            "You are becoming who you were meant to be.",
            "Growth begins outside your comfort zone.",
            "Purpose unfolds when you walk boldly in truth."
        ];

        let currentQuote = 0;

        function showQuote() {
            quoteDisplay.style.opacity = 0;

            setTimeout(() => {
                quoteDisplay.textContent = quotes[currentQuote];
                quoteDisplay.style.opacity = 1;
                currentQuote = (currentQuote + 1) % quotes.length;
            }, 500);
        }

        showQuote();
        setInterval(showQuote, 5000);
    }

    /* =======================================================
       MOBILE NAVIGATION
    ======================================================= */

    const toggle = document.getElementById("menu-toggle");
    const navLinks = document.getElementById("nav-links");

    if (toggle && navLinks) {
        toggle.addEventListener("click", () => {
            navLinks.classList.toggle("active");
        });
    }

    /* =======================================================
       ABOUT PAGE – SCROLL FADE
    ======================================================= */

    const fadeElements = document.querySelectorAll(".fade-on-scroll");

    if (fadeElements.length > 0) {

        function checkFade() {
            fadeElements.forEach(el => {
                const rect = el.getBoundingClientRect();
                if (rect.top < window.innerHeight - 50) {
                    el.classList.add("visible");
                }
            });
        }

        window.addEventListener("scroll", checkFade);
        window.addEventListener("load", checkFade);
    }

    /* =======================================================
       CONTACT PAGE LOGIC
    ======================================================= */

    const contactForm = document.getElementById("contactForm");

    if (contactForm) {

        const sendBtn = document.getElementById("sendBtn");
        const cancelBtn = document.getElementById("cancelBtn");
        const successBox = document.getElementById("successMessage");
        const verificationNotice = document.getElementById("verificationNotice");

        const requiredFields = contactForm.querySelectorAll("input[required], textarea[required]");

        contactForm.addEventListener("input", () => {

            let allFilled = true;

            requiredFields.forEach(field => {
                if (!field.value.trim()) allFilled = false;
            });

            const radioChecked = contactForm.querySelector("input[name='contactMethod']:checked");
            if (!radioChecked) allFilled = false;

            sendBtn.disabled = !allFilled;
        });

        cancelBtn.addEventListener("click", () => {
            if (confirm("Are you sure you want to cancel?")) {
                window.location.href = "../index.html";
            }
        });

        contactForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const email = document.getElementById("email").value;
            const verifiedEmails = JSON.parse(localStorage.getItem("verifiedEmails")) || [];

            contactForm.classList.add("hidden");
            successBox.classList.remove("hidden");

            if (!verifiedEmails.includes(email)) {
                verificationNotice.innerText =
                    "A verification email has been sent to your email address.";

                verifiedEmails.push(email);
                localStorage.setItem("verifiedEmails", JSON.stringify(verifiedEmails));
            } else {
                verificationNotice.innerText =
                    "Your email has already been verified.";
            }
        });
    }

    /* =======================================================
       REGISTRATION WIZARD
    ======================================================= */

    const registerForm = document.getElementById("registerForm");

    if (registerForm) {

        const steps = document.querySelectorAll(".form-step");
        const nextBtns = document.querySelectorAll(".next-btn");
        const backBtns = document.querySelectorAll(".back-btn");
        const progressFill = document.getElementById("progressFill");
        const cancelRegisterBtn = document.getElementById("cancelRegister");

        let currentStep = 0;

        function showStep(step) {
            steps.forEach((s, index) => {
                s.classList.toggle("active", index === step);
            });

            progressFill.style.width =
                ((step + 1) / steps.length) * 100 + "%";
        }

        function validateStep(step) {
            let valid = true;
            const inputs = steps[step].querySelectorAll("input");

            inputs.forEach(input => {
                const error = input.parentElement.querySelector(".error-msg");
                input.classList.remove("error");
                error.textContent = "";

                if (!input.checkValidity()) {
                    input.classList.add("error");
                    error.textContent = "This field is required.";
                    valid = false;
                }
            });

            return valid;
        }

        nextBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                if (!validateStep(currentStep)) return;

                if (currentStep < steps.length - 1) {
                    currentStep++;
                    showStep(currentStep);
                }
            });
        });

        backBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                if (currentStep > 0) {
                    currentStep--;
                    showStep(currentStep);
                }
            });
        });

        cancelRegisterBtn.addEventListener("click", () => {
            if (confirm("Cancel registration? All progress will be lost.")) {
                localStorage.removeItem("registerData");
                window.location.href = "../index.html";
            }
        });

        registerForm.addEventListener("submit", (e) => {
            e.preventDefault();
            localStorage.removeItem("registerData");

            registerForm.innerHTML = `
                <h2>Account Created Successfully 🌸</h2>
                <p>You may now log in.</p>
                <button onclick="window.location.href='login.html'" class="submit-btn">
                    Go To Login
                </button>
            `;
        });

        showStep(currentStep);
    }

});
