const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    loginAttempts: {
      type: Number,
      default: 0
    },

    lockUntil: {
      type: Date,
      default: null
},

locked: {
  type: Boolean,
  default: false
},

role: {
  type: String,
  enum: ["user", "admin"],
  default: "user",
},

isVerified: {
  type: Boolean,
  default: false,
},

lastLogin: {
type: Date,
},

 }, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
