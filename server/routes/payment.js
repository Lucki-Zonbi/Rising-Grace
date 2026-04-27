const express = require("express");
const Stripe = require("stripe");
const Payment = require("../models/Payment");
const { protect } = require("../middleware/authMiddleware");

if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Missing STRIPE_SECRET_KEY in environment variables");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

const router = express.Router();

function isValidZip(zip) {
    return /^\d{5}$/.test(String(zip || "").trim());
}

function isValidCardBrand(cardBrand) {
    return ["visa", "mastercard", "amex", "discover", "unknown"].includes(
        String(cardBrand || "").toLowerCase()
    );
}

function isValidLast4(cardLast4) {
    return /^\d{4}$/.test(String(cardLast4 || "").trim());
}

// Mock card payment
router.post("/card", protect, async (req, res) => {
    try {
        console.log("✅ /api/payment/card route hit");

        const userId = req.user._id;
        const {
            name,
            zip,
            cardBrand,
            cardLast4
        } = req.body;

        if (!name || !String(name).trim()) {
            return res.status(400).json({ error: "Cardholder name is required" });
        }

        if (!isValidZip(zip)) {
            return res.status(400).json({ error: "ZIP code must be 5 digits" });
        }

        if (!isValidCardBrand(cardBrand)) {
            return res.status(400).json({ error: "Invalid card brand" });
        }

        if (!isValidLast4(cardLast4)) {
            return res.status(400).json({ error: "Invalid last 4 digits" });
        }

        const payment = new Payment({
            userId,
            amount: 5000,
            status: "paid",
            used: false,
            paymentMethod: "card",
            cardBrand: String(cardBrand).toLowerCase(),
            cardLast4: String(cardLast4).trim(),
            billingZip: String(zip).trim()
        });

        await payment.save();

        res.json({
            message: "Payment successful (mock card validation passed)"
        });
    } catch (err) {
        console.error("Mock card payment error:", err);
        res.status(500).json({ error: "Payment failed" });
    }
});

// Stripe Checkout
router.post("/stripe", protect, async (req, res) => {
    try {
        const userId = req.user._id;

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            billing_address_collection: "required",
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: "Rising Grace Session"
                        },
                        unit_amount: 5000
                    },
                    quantity: 1
                }
            ],
            metadata: {
                userId: userId.toString()
            },
            success_url: "http://localhost:3000/payment-success.html",
            cancel_url: "http://localhost:3000/payment.html"
        });

        res.json({ url: session.url });
    } catch (err) {
        console.error("Stripe checkout error:", err);
        res.status(500).json({ error: "Stripe error" });
    }
});

// PayPal placeholder
router.post("/paypal", protect, async (req, res) => {
    res.json({
        message: "PayPal integration coming soon"
    });
});

// Manual confirm fallback
router.post("/confirm", protect, async (req, res) => {
    try {
        const userId = req.user._id;

        const payment = new Payment({
            userId,
            amount: 5000,
            status: "paid",
            used: false,
            paymentMethod: "manual"
        });

        await payment.save();

        res.json({ message: "Payment recorded" });
    } catch (err) {
        console.error("Manual confirm error:", err);
        res.status(500).json({ error: "Error saving payment" });
    }
});

// Admin refund
router.post("/refund/:id", protect, async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ error: "Admin only" });
        }

        const payment = await Payment.findById(req.params.id);

        if (!payment) {
            return res.status(404).json({ error: "Payment not found" });
        }

        payment.status = "refunded";
        payment.used = false;
        await payment.save();

        res.json({ message: "Payment refunded" });
    } catch (err) {
        console.error("Refund error:", err);
        res.status(500).json({ error: "Refund failed" });
    }
});

// Stripe webhook
router.post("/webhook", async (req, res) => {
    if (!endpointSecret) {
        return res.status(500).json({ error: "Missing STRIPE_WEBHOOK_SECRET" });
    }

    const sig = req.headers["stripe-signature"];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.error("Webhook signature failed:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
        const session = event.data.object;

        try {
            const existingPayment = await Payment.findOne({
                stripeSessionId: session.id
            });

            if (!existingPayment) {
                await Payment.create({
                    userId: session.metadata.userId,
                    amount: session.amount_total,
                    status: "paid",
                    stripeSessionId: session.id,
                    used: false,
                    paymentMethod: "stripe"
                });

                console.log("✅ Payment saved from webhook");
            } else {
                console.log("ℹ️ Payment already recorded for this Stripe session");
            }
        } catch (err) {
            console.error("Webhook payment save error:", err);
            return res.status(500).json({ error: "Webhook processing failed" });
        }
    }

    res.json({ received: true });
});

// Admin: all payments preview
router.get("/all", protect, async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ error: "Admin only" });
        }

        const payments = await Payment.find()
            .populate("userId", "name email")
            .sort({ createdAt: -1 });

        res.json(payments);
    } catch (err) {
        console.error("Payment preview error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
