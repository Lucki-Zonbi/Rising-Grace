/* ======================================== */
/* Rising Grace Life Coach */
/* Sprint 1 - Responsive JS */
/* ======================================== */

document.addEventListener("DOMContentLoaded", function () {

    /* ======================================== */
    /* Inspirational Quote Rotation */
    /* ======================================== */

    const quotes = [
        "Grace grows when faith overcomes fear.",
        "Every setback prepares you for a comeback.",
        "You are becoming who you were meant to be.",
        "Growth begins outside your comfort zone.",
        "Purpose unfolds when you walk boldly in truth."
    ];

    const quoteDisplay = document.getElementById("quote-display");
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

    /* ======================================== */
    /* Mobile Navigation Toggle */
    /* ======================================== */

    const toggle = document.getElementById("menu-toggle");
    const navLinks = document.getElementById("nav-links");

    toggle.addEventListener("click", () => {
        navLinks.classList.toggle("active");
    });

});

/* ======================================== */
/* Scroll Fade Animation - About Page */
/* ======================================== */

const fadeElements = document.querySelectorAll(".fade-on-scroll");

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

/*========================================== */
// Contact Form Validation
/*========================================== */
const contactForm = document.getElementById("contactForm");

if (contactForm) {
    contactForm.addEventListener("submit", function (e) {

        const email = document.getElementById("email").value;
        const phone = document.getElementById("phone").value;

        const emailPattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;
        const phonePattern = /^[0-9\-\+\s\(\)]{7,15}$/;

        if (!email.match(emailPattern)) {
            alert("Please enter a valid email address.");
            e.preventDefault();
        }

        if (!phone.match(phonePattern)) {
            alert("Please enter a valid phone number.");
            e.preventDefault();
        }
    });
}

const form = document.getElementById("contactForm");
const sendBtn = document.getElementById("sendBtn");
const cancelBtn = document.getElementById("cancelBtn");
const successBox = document.getElementById("successMessage");
const verificationNotice = document.getElementById("verificationNotice");

if (form) {

    const requiredFields = form.querySelectorAll("input[required], textarea[required]");

    // Enable Send Button Only When All Fields Filled
    form.addEventListener("input", () => {
        let allFilled = true;

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                allFilled = false;
            }
        });

        const radioChecked = form.querySelector("input[name='contactMethod']:checked");

        if (!radioChecked) allFilled = false;

        sendBtn.disabled = !allFilled;
    });

    // Cancel Logic
    cancelBtn.addEventListener("click", () => {
        const confirmCancel = confirm("Are you sure you want to cancel?");
        if (confirmCancel) {
            window.location.href = "../index.html";
        }
    });

    // Submit Logic
    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const email = document.getElementById("email").value;

        const verifiedEmails = JSON.parse(localStorage.getItem("verifiedEmails")) || [];

        form.classList.add("hidden");
        successBox.classList.remove("hidden");

        if (!verifiedEmails.includes(email)) {
            verificationNotice.innerText =
                "A verification email has been sent to your email address. Please confirm to complete validation.";

            verifiedEmails.push(email);
            localStorage.setItem("verifiedEmails", JSON.stringify(verifiedEmails));
        } else {
            verificationNotice.innerText =
                "Your email has already been verified. Thank you for staying connected with Rising Grace.";
        }
    });
}

/* ========================================
   SPRINT 4 – LOGIN LOGIC
======================================== */

document.addEventListener("DOMContentLoaded", function () {

    const loginEmail = document.getElementById("loginEmail");
    const loginPassword = document.getElementById("loginPassword");
    const loginBtn = document.getElementById("loginBtn");
    const loginForm = document.getElementById("loginForm");

    if (loginEmail && loginPassword && loginBtn && loginForm) {

        function validateLogin() {
            if (
                loginEmail.value.trim() !== "" &&
                loginPassword.value.trim() !== ""
            ) {
                loginBtn.disabled = false;
                loginBtn.classList.add("enabled");
            } else {
                loginBtn.disabled = true;
                loginBtn.classList.remove("enabled");
            }
        }

        loginEmail.addEventListener("input", validateLogin);
        loginPassword.addEventListener("input", validateLogin);

        /* ========================================
            PASSWORD STRENGTH LOGIC
        ======================================== */

function checkPasswordStrength(password) {

    let strength = 0;

    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    return strength;
}

if (loginPassword) {

    const strengthBar = document.getElementById("strengthBar");
    const strengthText = document.getElementById("strengthText");

    loginPassword.addEventListener("input", function () {

        const value = loginPassword.value;
        const strength = checkPasswordStrength(value);

        let width = 0;
        let color = "";
        let text = "";

        switch (strength) {
            case 0:
            case 1:
                width = 25;
                color = "red";
                text = "Weak password";
                break;
            case 2:
                width = 50;
                color = "orange";
                text = "Moderate password";
                break;
            case 3:
                width = 75;
                color = "#C357E6";
                text = "Strong password";
                break;
            case 4:
                width = 100;
                color = "limegreen";
                text = "Very strong password";
                break;
        }

        strengthBar.style.width = width + "%";
        strengthBar.style.backgroundColor = color;
        strengthText.textContent = text;
        strengthText.style.color = color;
    });
}
    }

    /* ========================================
   LOGIN ATTEMPT LOCKOUT (FIXED)
======================================== */

let failedAttempts = 0;
let lockoutTime = null;

if (loginForm) {

    loginForm.addEventListener("submit", function (e) {

        e.preventDefault();

        // Check lockout FIRST
        if (lockoutTime && Date.now() < lockoutTime) {
            alert("Account locked. Try again later.");
            return;
        }

        const storedUser = "admin@risinggrace.com";
        const storedPassHash = btoa("Secure123!");

        const enteredEmail = loginEmail.value;
        const enteredPassHash = btoa(loginPassword.value);

        if (enteredEmail === storedUser && enteredPassHash === storedPassHash) {

            failedAttempts = 0;
            sessionStorage.setItem("risingGraceUser", enteredEmail);
            alert("Login successful.");
            window.location.href = "../index.html";

        } else {

            failedAttempts++;
            console.log("Failed attempts:", failedAttempts);

            if (failedAttempts >= 4) {
                lockoutTime = Date.now() + (5 * 60 * 1000);
                alert("Too many failed attempts. Locked for 5 minutes.");
            } else {
                alert("Invalid credentials.");
            }
        }

    });
}

/* ========================================
   SESSION TIMEOUT (INACTIVITY LOGOUT)
======================================== */

const SESSION_LIMIT = 5 * 60 * 1000; // 5 minutes
let inactivityTimer;

// Only apply timeout if user is logged in
if (sessionStorage.getItem("risingGraceUser")) {

    function resetInactivityTimer() {

        clearTimeout(inactivityTimer);

        inactivityTimer = setTimeout(function () {

            alert("Session expired due to inactivity.");

            sessionStorage.removeItem("risingGraceUser");

            window.location.href = "../auth/login.html";

        }, SESSION_LIMIT);
    }

    // Events that reset inactivity
    window.onload = resetInactivityTimer;
    document.onmousemove = resetInactivityTimer;
    document.onkeydown = resetInactivityTimer;
    document.onclick = resetInactivityTimer;
    document.onscroll = resetInactivityTimer;
}

});

/* ========================================
   MULTI STEP REGISTRATION WIZARD
======================================== */

const steps = document.querySelectorAll(".form-step");
const nextBtns = document.querySelectorAll(".next-btn");
const backBtns = document.querySelectorAll(".back-btn");
const progressFill = document.getElementById("progressFill");

let currentStep = 0;

if (steps.length > 0) {

    function showStep(step) {
        steps.forEach((s, index) => {
            s.classList.remove("active");
            if (index === step) s.classList.add("active");
        });

        progressFill.style.width = ((step + 1) / steps.length) * 100 + "%";
    }

    nextBtns.forEach(btn => {
        btn.addEventListener("click", () => {
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

    showStep(currentStep);
}

/* ========================================
   PRODUCTION VALIDATION + PERSISTENCE
======================================== */

const registerForm = document.getElementById("registerForm");

if (registerForm) {

    const fields = {
        username: document.getElementById("regUsername"),
        email: document.getElementById("regEmail"),
        password: document.getElementById("regPassword"),
        fullName: document.getElementById("regFullName"),
        phone: document.getElementById("regPhone")
    };

    // Restore saved progress
    const savedData = JSON.parse(localStorage.getItem("registerData"));
    if (savedData) {
        Object.keys(fields).forEach(key => {
            if (savedData[key]) fields[key].value = savedData[key];
        });
    }

    function validateStep(step) {
        let valid = true;
        const inputs = steps[step].querySelectorAll("input");

        inputs.forEach(input => {
            const error = input.parentElement.querySelector(".error-msg");
            input.classList.remove("error");
            error.textContent = "";

            if (!input.checkValidity()) {
                valid = false;
                input.classList.add("error");
                error.textContent = "This field is required.";
            }
        });

        // Password strength enforcement
        if (step === 0) {
            if (fields.password.value.length < 6) {
                valid = false;
                fields.password.classList.add("error");
                fields.password.parentElement.querySelector(".error-msg").textContent =
                    "Password must be at least 6 characters.";
            }
        }

        return valid;
    }

    nextBtns.forEach(btn => {
        btn.addEventListener("click", () => {

            if (!validateStep(currentStep)) return;

            // Save progress
            const data = {};
            Object.keys(fields).forEach(key => {
                data[key] = fields[key].value;
            });
            localStorage.setItem("registerData", JSON.stringify(data));

            if (currentStep < steps.length - 1) {
                currentStep++;
                showStep(currentStep);
            }

            // Build review screen
            if (currentStep === 2) {
                const reviewBox = document.getElementById("reviewBox");
                reviewBox.innerHTML = `
                    <p><strong>Username:</strong> ${fields.username.value}</p>
                    <p><strong>Email:</strong> ${fields.email.value}</p>
                    <p><strong>Full Name:</strong> ${fields.fullName.value}</p>
                    <p><strong>Phone:</strong> ${fields.phone.value}</p>
                `;
            }
        });
    });

    if (registerForm) {

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

    /* ========================================
       REGISTRATION CANCEL LOGIC
    ======================================== */

    const cancelRegisterBtn = document.getElementById("cancelRegister");

    if (cancelRegisterBtn) {
        cancelRegisterBtn.addEventListener("click", () => {

            const confirmCancel = confirm(
                "Are you sure you want to cancel registration?\n\nAll progress will be lost."
            );

            if (confirmCancel) {
                localStorage.removeItem("registerData");
                window.location.href = "../index.html";
            }
        });
    }

}
