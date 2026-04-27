const API_BASE = "http://localhost:3000";

window.addEventListener("DOMContentLoaded", () => {
    const messageEl = document.getElementById("paymentMessage");
    const token = localStorage.getItem("token");

    if (!token && messageEl) {
        messageEl.innerText = "You must log in through the live app before testing payment.";
    }

    setupPaymentFormatting();
});

function isPreviewMode() {
    return window.location.search.includes("preview=true");
}

function digitsOnly(value) {
    return value.replace(/\D/g, "");
}

function detectCardType(cardNumber) {
    const cleaned = digitsOnly(cardNumber);

    if (/^4/.test(cleaned)) return "visa";
    if (/^3[47]/.test(cleaned)) return "amex";
    if (/^(5[1-5]|2(2[2-9]|[3-6]\d|7[01]|720))/.test(cleaned)) return "mastercard";
    if (/^6(?:011|5)/.test(cleaned)) return "discover";

    return "unknown";
}

function formatCardNumber(value) {
    const cleaned = digitsOnly(value).slice(0, 16);
    return cleaned.match(/.{1,4}/g)?.join(" ") || cleaned;
}

function formatExpiry(value) {
    const cleaned = digitsOnly(value).slice(0, 4);

    if (cleaned.length <= 2) {
        return cleaned;
    }

    return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
}

function formatZip(value) {
    return digitsOnly(value).slice(0, 5);
}

function formatCvv(value, cardNumber) {
    const cleaned = digitsOnly(value);
    const cardType = detectCardType(cardNumber);
    const maxLength = cardType === "amex" ? 4 : 3;

    return cleaned.slice(0, maxLength);
}

function luhnCheck(cardNumber) {
    const cleaned = digitsOnly(cardNumber);
    let sum = 0;
    let shouldDouble = false;

    for (let i = cleaned.length - 1; i >= 0; i--) {
        let digit = parseInt(cleaned.charAt(i), 10);

        if (shouldDouble) {
            digit *= 2;
            if (digit > 9) {
                digit -= 9;
            }
        }

        sum += digit;
        shouldDouble = !shouldDouble;
    }

    return sum % 10 === 0;
}

function isValidExpiry(expiry) {
    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
        return false;
    }

    const [monthStr, yearStr] = expiry.split("/");
    const month = parseInt(monthStr, 10);
    const year = parseInt(`20${yearStr}`, 10);

    if (month < 1 || month > 12) {
        return false;
    }

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    if (year < currentYear) {
        return false;
    }

    if (year === currentYear && month < currentMonth) {
        return false;
    }

    return true;
}

function isValidZip(zip) {
    return /^\d{5}$/.test(zip);
}

function isValidCvv(cvv, cardNumber) {
    const cardType = detectCardType(cardNumber);

    if (cardType === "amex") {
        return /^\d{4}$/.test(cvv);
    }

    return /^\d{3}$/.test(cvv);
}

function setupPaymentFormatting() {
    const cardNumberInput = document.getElementById("cardNumber");
    const expiryInput = document.getElementById("expiry");
    const cvvInput = document.getElementById("cvv");
    const zipInput = document.getElementById("zip");

    if (cardNumberInput) {
        cardNumberInput.addEventListener("input", () => {
            cardNumberInput.value = formatCardNumber(cardNumberInput.value);

            if (cvvInput) {
                cvvInput.value = formatCvv(cvvInput.value, cardNumberInput.value);
                const cardType = detectCardType(cardNumberInput.value);
                cvvInput.placeholder = cardType === "amex" ? "4-digit CVV" : "3-digit CVV";
            }
        });
    }

    if (expiryInput) {
        expiryInput.addEventListener("input", () => {
            expiryInput.value = formatExpiry(expiryInput.value);
        });
    }

    if (cvvInput) {
        cvvInput.addEventListener("input", () => {
            const currentCardNumber = cardNumberInput ? cardNumberInput.value : "";
            cvvInput.value = formatCvv(cvvInput.value, currentCardNumber);
        });
    }

    if (zipInput) {
        zipInput.addEventListener("input", () => {
            zipInput.value = formatZip(zipInput.value);
        });
    }
}

function validateCard(name, cardNumber, expiry, cvv, zip) {
    if (!name || !cardNumber || !expiry || !cvv || !zip) {
        return "All fields are required";
    }

    const cleanedCardNumber = digitsOnly(cardNumber);
    const cleanedCvv = digitsOnly(cvv);
    const cleanedZip = digitsOnly(zip);

    if (cleanedCardNumber.length < 13 || cleanedCardNumber.length > 16) {
        return "Invalid card number";
    }

    if (!luhnCheck(cleanedCardNumber)) {
        return "Card number is not valid";
    }

    if (!isValidExpiry(expiry)) {
        return "Invalid expiry format";
    }

    if (!isValidCvv(cleanedCvv, cleanedCardNumber)) {
        return detectCardType(cleanedCardNumber) === "amex"
            ? "American Express cards require a 4-digit CVV"
            : "CVV must be 3 digits";
    }

    if (!isValidZip(cleanedZip)) {
        return "ZIP code must be 5 digits";
    }

    return null;
}

async function payWithCard() {
    const messageEl = document.getElementById("paymentMessage");

    if (isPreviewMode()) {
        messageEl.innerText =
            "Payment processing is disabled in preview mode. Open payment.html directly to test.";
        return;
    }

    const name = document.getElementById("name").value.trim();
    const cardNumber = document.getElementById("cardNumber").value.trim();
    const expiry = document.getElementById("expiry").value.trim();
    const cvv = document.getElementById("cvv").value.trim();
    const zip = document.getElementById("zip").value.trim();

    const error = validateCard(name, cardNumber, expiry, cvv, zip);

    if (error) {
        messageEl.innerText = error;
        return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
        messageEl.innerText = "You must be logged in to make a payment.";
        return;
    }

    try {
        messageEl.innerText = "Processing payment...";

        const res = await fetch(`${API_BASE}/api/payment/card`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                name,
                zip: digitsOnly(zip),
                cardBrand: detectCardType(cardNumber),
                cardLast4: digitsOnly(cardNumber).slice(-4)
            })
        });

        const data = await res.json();
        messageEl.innerText = data.message || data.error || "Payment request failed.";
    } catch (err) {
        console.error("Card payment error:", err);
        messageEl.innerText = "Unable to reach payment server. Open the page directly from localhost.";
    }
}

async function payWithStripe() {
    const token = localStorage.getItem("token");
    const messageEl = document.getElementById("paymentMessage");

    if (isPreviewMode()) {
        messageEl.innerText =
            "Stripe checkout is disabled in preview mode. Open payment.html directly to test.";
        return;
    }

    if (!token) {
        messageEl.innerText = "You must be logged in to make a payment.";
        return;
    }

    try {
        messageEl.innerText = "Redirecting to Stripe...";

        const res = await fetch(`${API_BASE}/api/payment/stripe`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await res.json();

        if (data.url) {
            window.location.href = data.url;
            return;
        }

        messageEl.innerText = data.error || "Unable to start Stripe checkout.";
    } catch (err) {
        console.error("Stripe payment error:", err);
        messageEl.innerText = "Unable to reach payment server. Open the page directly from localhost.";
    }
}

async function payWithPayPal() {
    const token = localStorage.getItem("token");
    const messageEl = document.getElementById("paymentMessage");

    if (isPreviewMode()) {
        messageEl.innerText =
            "PayPal preview only. Open payment.html directly to test.";
        return;
    }

    if (!token) {
        messageEl.innerText = "You must be logged in to make a payment.";
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/api/payment/paypal`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await res.json();
        messageEl.innerText = data.message || data.error || "PayPal request failed.";
    } catch (err) {
        console.error("PayPal error:", err);
        messageEl.innerText = "Unable to reach payment server. Open the page directly from localhost.";
    }
}
