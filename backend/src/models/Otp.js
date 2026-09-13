const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  mobileNumber: {
    type: String,
    required: true,
    index: true,
    match: [/^\d{10}$/, "Mobile number must be 10 digits"],
  },
  otp: {
    type: String,
    required() {
      return this.provider === "local";
    },
  },
  provider: {
    type: String,
    enum: ["local", "twilio_verify"],
    default: "local",
  },
  purpose: {
    type: String,
    enum: ["registration", "login", "reset_password"],
    default: "registration",
  },
  attempts: {
    type: Number,
    default: 0,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300,
  },
});

otpSchema.index({ mobileNumber: 1, purpose: 1 });

module.exports = mongoose.model("Otp", otpSchema);
