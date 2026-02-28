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
