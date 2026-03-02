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

        loginForm.addEventListener("submit", function (e) {
            e.preventDefault();

            // Frontend authentication simulation
            alert("Login successful (Frontend Simulation Only).");

            // Temporary session storage simulation
            sessionStorage.setItem("risingGraceUser", loginEmail.value);

            // Redirect to home
            window.location.href = "../index.html";
        });
    }

});
