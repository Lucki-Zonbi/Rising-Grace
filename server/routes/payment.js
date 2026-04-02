const Payment = require("../models/Payment");
const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const Payment = require("../models/Payment");
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

// 💳 Card (Mock)
router.post("/card", protect, async (req, res) => {
    try {
        res.json({
            message: "Payment successful (mock card)"
        });
    } catch (err) {
        res.status(500).json({ error: "Payment failed" });
    }
});

// 🧪 Stripe Placeholder
router.post("/stripe", protect, async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: "Rising Grace Session"
                        },
                        unit_amount: 5000 // $50
                    },
                    quantity: 1
                }
            ],
            success_url: "http://localhost:3000/payment-success.html",
            cancel_url: "http://localhost:3000/payment.html"
        });

        res.json({ url: session.url });

    } catch (err) {
        res.status(500).json({ error: "Stripe error" });
    }
});

// 🧪 PayPal Placeholder
router.post("/paypal", protect, async (req, res) => {
    res.json({
        message: "PayPal integration coming soon"
    });
});

// MongoDB record (for all methods)
router.post("/confirm", protect, async (req, res) => {
    try {
        const userId = req.user._id;

        // PAYMENT CHECK (Sprint 14D)
const paid = await Payment.findOne({
    userId,
    status: "paid",
    used: false
});

if (!paid) {
    return res.status(403).json({
        error: "Payment required before scheduling"
    });
}

        const payment = new Payment({
            userId,
            amount: 5000,
            status: "paid"
        });

        await payment.save();

        res.json({ message: "Payment recorded" });

    } catch (err) {
        res.status(500).json({ error: "Error saving payment" });
    }
});

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
        await payment.save();

        res.json({ message: "Payment refunded" });

    } catch (err) {
        res.status(500).json({ error: "Refund failed" });
    }
});

module.exports = router;
