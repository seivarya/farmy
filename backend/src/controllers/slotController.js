const Farmer = require("../models/Farmer");
const { Slot } = require("../models/Slot");
const { getProcurementSettings } = require("../models/ProcurementSettings");
const { ProcurementTicket } = require("../models/ProcurementTicket");
const { isValidDateOnly } = require("../utils/date");
const { sendError, sendSuccess } = require("../utils/http");
const smsService = require("../services/smsService");
const {
  cancelReservedSlot,
  getSlotAvailability,
  reserveSlotWithinCapacity,
} = require("../services/slotBookingService");

const getToday = () => new Date().toISOString().split("T")[0];

const listAvailableSlots = async (req, res) => {
  const { date } = req.query;
  if (!isValidDateOnly(date)) {
    return sendError(res, 400, "Valid date query parameter in YYYY-MM-DD format is required.");
  }

  const settings = await getProcurementSettings();
  const slots = await getSlotAvailability({
    date,
    timeSlots: settings.timeSlots,
    capacityPerSlot: settings.capacityPerSlot,
  });

  return sendSuccess(res, 200, { date, slots });
};

const bookProcurementSlot = async (req, res) => {
  const { date, timeSlot, ticketId } = req.body;
  const farmerId = req.user.id;

  if (!date || !timeSlot || !ticketId) {
    return sendError(res, 400, "Ticket ID, date (YYYY-MM-DD), and time slot are required.");
  }

  if (!isValidDateOnly(date)) {
    return sendError(res, 400, "Date must be a valid YYYY-MM-DD value.");
  }

  if (date < getToday()) {
    return sendError(res, 400, "Cannot book procurement slots for past dates.");
  }

  const settings = await getProcurementSettings();
  if (!settings.timeSlots.includes(timeSlot)) {
    return sendError(res, 400, "Invalid procurement time slot selected.", {
      validSlots: settings.timeSlots,
    });
  }

  const ticket = await ProcurementTicket.findOne({ ticketId, farmerId });
  if (!ticket) {
    return sendError(res, 404, "Procurement ticket not found or not owned by you.");
  }

  if (ticket.status !== "accepted") {
    return sendError(res, 409, `Ticket ${ticketId} cannot book a slot while its status is ${ticket.status}.`);
  }

  const existingBooking = await Slot.findOne({
    farmerId,
    date,
    timeSlot,
    status: "booked",
  });
  if (existingBooking) {
    return sendError(res, 409, `You already have an active booking for ${timeSlot} on ${date}.`);
  }

  const slot = await reserveSlotWithinCapacity({
    farmerId,
    ticketId,
    date,
    timeSlot,
    cropType: ticket.crop,
    quantityQuintals: ticket.expectedWeightQuintals,
    capacity: settings.capacityPerSlot,
  });
  if (!slot) {
    return sendError(res, 409, `The ${timeSlot} slot on ${date} is fully booked or this ticket already has a booking. Please refresh and choose another slot.`);
  }

  const reservedTicket = await ProcurementTicket.findOneAndUpdate(
    { _id: ticket._id, status: "accepted" },
    {
      $set: { slotId: slot._id, status: "slot_booked" },
      $push: {
        statusHistory: {
          status: "slot_booked",
          note: `Slot booked for ${date}, ${timeSlot}.`,
        },
      },
    },
    { new: true },
  );

  if (!reservedTicket) {
    await cancelReservedSlot(slot);
    return sendError(res, 409, "This ticket was updated while the slot was being booked. Please refresh and try again.");
  }

  const farmer = await Farmer.findById(farmerId);
  if (farmer && farmer.mobileNumber) {
    await smsService.sendSlotConfirmationSms({
      mobileNumber: farmer.mobileNumber,
      farmerName: farmer.fullname,
      cropType: ticket.crop,
      quantityQuintals: ticket.expectedWeightQuintals,
      date,
      timeSlot,
      bookingId: slot._id,
    });
  }

  return sendSuccess(res, 201, {
    message: "Procurement slot booked successfully. Confirmation SMS sent.",
    slot,
  });
};

const listMySlots = async (req, res) => {
  const slots = await Slot.find({ farmerId: req.user.id })
    .sort({ date: 1, timeSlot: 1, createdAt: -1 })
    .populate("farmerId", "fullname mobileNumber");

  return sendSuccess(res, 200, {
    count: slots.length,
    slots,
  });
};

const cancelProcurementSlot = async (req, res) => {
  const slot = await Slot.findOne({
    _id: req.params.id,
    farmerId: req.user.id,
  });
  if (!slot) {
    return sendError(res, 404, "Procurement slot not found or you are not authorized to cancel it.");
  }

  if (slot.status === "cancelled") {
    return sendError(res, 400, "This slot has already been cancelled.");
  }

  if (slot.status === "completed") {
    return sendError(res, 400, "Completed procurement slots cannot be cancelled.");
  }

  await cancelReservedSlot(slot);

  const ticket = await ProcurementTicket.findOne({
    ticketId: slot.ticketId,
    farmerId: req.user.id,
  });
  if (ticket && ticket.status === "slot_booked") {
    ticket.slotId = null;
    ticket.status = "accepted";
    ticket.statusHistory.push({
      status: "accepted",
      note: "Booked slot was cancelled; ticket remains accepted for a new slot.",
    });
    await ticket.save();
  }

  const farmer = await Farmer.findById(req.user.id);
  if (farmer && farmer.mobileNumber) {
    await smsService.sendSlotCancellationSms({
      mobileNumber: farmer.mobileNumber,
      farmerName: farmer.fullname,
      date: slot.date,
      timeSlot: slot.timeSlot,
      bookingId: slot._id,
    });
  }

  return sendSuccess(res, 200, {
    message: "Procurement slot cancelled successfully. Notification SMS sent.",
    slot,
  });
};

module.exports = {
  bookProcurementSlot,
  cancelProcurementSlot,
  listAvailableSlots,
  listMySlots,
};
