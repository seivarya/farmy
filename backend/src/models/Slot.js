const mongoose = require("mongoose");

const VALID_TIME_SLOTS = [
  "08:00 AM - 10:00 AM",
  "10:00 AM - 12:00 PM",
  "12:00 PM - 02:00 PM",
  "02:00 PM - 04:00 PM",
  "04:00 PM - 06:00 PM",
];

const slotSchema = new mongoose.Schema(
  {
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Farmer",
      required: [true, "Farmer ID is required"],
      index: true,
    },
    ticketId: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: [true, "Date is required"],
      match: [/^\d{4}-\d{2}-\d{2}$/, "Date must follow YYYY-MM-DD format"],
      index: true,
    },
    timeSlot: {
      type: String,
      required: [true, "Time slot is required"],
      trim: true,
    },
    bookingSequence: { type: Number, min: 1, max: 100 },
    cropType: {
      type: String,
      trim: true,
      default: "Wheat",
    },
    quantityQuintals: {
      type: Number,
      min: [1, "Quantity must be at least 1 quintal"],
      max: [5000, "Quantity cannot exceed 5000 quintals per booking"],
      default: 25,
    },
    status: {
      type: String,
      enum: ["booked", "completed", "cancelled"],
      default: "booked",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

slotSchema.index({ date: 1, timeSlot: 1, status: 1 });
slotSchema.index(
  { date: 1, timeSlot: 1, bookingSequence: 1 },
  { unique: true, partialFilterExpression: { status: "booked", bookingSequence: { $exists: true } } }
);
slotSchema.index(
  { ticketId: 1 },
  {
    name: "active_ticket_booking_unique",
    unique: true,
    partialFilterExpression: { status: "booked", ticketId: { $exists: true } },
  }
);
slotSchema.index({ farmerId: 1, date: 1, timeSlot: 1, status: 1 });

module.exports = {
  Slot: mongoose.model("Slot", slotSchema),
  VALID_TIME_SLOTS,
};
