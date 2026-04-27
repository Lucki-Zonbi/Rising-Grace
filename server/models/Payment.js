const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        default: "pending"
    }, // pending, paid, refunded
    stripeSessionId: {
        type: String,
        default: null
    },
    used: {
        type: Boolean,
        default: false
    },
    paymentMethod: {
        type: String,
        enum: ["card", "stripe", "paypal", "manual"],
        default: "card"
    },
    cardBrand: {
        type: String,
        default: null
    },
    cardLast4: {
        type: String,
        default: null
    },
    billingZip: {
        type: String,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Payment", paymentSchema);
