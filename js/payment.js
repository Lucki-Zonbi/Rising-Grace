function validateCard(name, cardNumber, expiry, cvv) {
    if (!name || !cardNumber || !expiry || !cvv) {
        return "All fields are required";
    }

    if (cardNumber.length < 12) {
        return "Invalid card number";
    }

    if (!expiry.includes("/")) {
        return "Invalid expiry format";
    }

    if (cvv.length < 3) {
        return "Invalid CVV";
    }

    return null;
}

// 💳 Card Payment (Mock)
async function payWithCard() {
    const name = document.getElementById("name").value;
    const cardNumber = document.getElementById("cardNumber").value;
    const expiry = document.getElementById("expiry").value;
    const cvv = document.getElementById("cvv").value;

    const error = validateCard(name, cardNumber, expiry, cvv);

    if (error) {
        document.getElementById("paymentMessage").innerText = error;
        return;
    }

    const token = localStorage.getItem("token");

    const res = await fetch("/api/payment/card", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ name })
    });

    const data = await res.json();

    document.getElementById("paymentMessage").innerText =
        data.message || data.error;
}

// 🧪 Stripe Placeholder
async function payWithStripe() {
    const token = localStorage.getItem("token");

    const res = await fetch("/api/payment/stripe", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    const data = await res.json();

    if (data.url) {
        window.location.href = data.url; // 🔥 redirect to Stripe
    } else {

    document.getElementById("paymentMessage").innerText =
        data.message;
}

// 🧪 PayPal Placeholder
async function payWithPayPal() {
    const token = localStorage.getItem("token");

    const res = await fetch("/api/payment/paypal", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    const data = await res.json();

    document.getElementById("paymentMessage").innerText =
        data.message;
}
