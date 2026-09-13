const Farmer = require("../models/Farmer");
const { ProcurementSubmission } = require("../models/ProcurementSubmission");
const { ProcurementTicket, TICKET_STATUSES } = require("../models/ProcurementTicket");
const { getProcurementSettings } = require("../models/ProcurementSettings");
const { isAtLeastAge, isValidDateOnly } = require("../utils/date");
const { sendError, sendSuccess } = require("../utils/http");
const { debugLog } = require("../utils/debug");
const { reserveIdentity, releaseIdentity } = require("../services/identityRegistryService");
const { createFarmerNotification } = require("../services/farmerNotificationService");
const {
  LOCKED_TICKET_STATUSES,
  REVIEWABLE_TICKET_STATUSES,
  syncSubmissionStatus,
} = require("../services/adminTicketService");
const { updateProcurementSettings } = require("../services/procurementSettingsService");

const MOBILE_NUMBER_PATTERN = /^\d{10}$/;
const FARMER_MINIMUM_AGE = 25;
const NOTIFICATION_TYPES = ["ticket", "slot", "identity", "general"];
const farmerProjection = "fullname mobileNumber dateOfBirth aadhaarLast4 identityVerificationStatus";

const listTickets = async (req, res) => {
  debugLog("admin.list_tickets", { adminId: req.admin.id });
  const { status, search = "" } = req.query;
  const query = {};

  if (status && TICKET_STATUSES.includes(status)) {
    query.status = status;
  }

  if (search.trim()) {
    query.ticketId = {
      $regex: search.trim(),
      $options: "i",
    };
  }

  const tickets = await ProcurementTicket.find(query)
    .populate("farmerId", farmerProjection)
    .sort({ createdAt: -1 })
    .limit(100);

  return sendSuccess(res, 200, {
    count: tickets.length,
    tickets,
  });
};

const getTicket = async (req, res) => {
  const { ticketId } = req.params;
  debugLog("admin.read_ticket", { adminId: req.admin.id, ticketId });

  const ticket = await ProcurementTicket.findOne({ ticketId })
    .populate("farmerId", farmerProjection);
  if (!ticket) {
    return sendError(res, 404, "Procurement ticket not found.");
  }

  const submission = await ProcurementSubmission.findById(ticket.procurementSubmissionId);
  return sendSuccess(res, 200, { ticket, submission });
};

const updateTicketStatus = async (req, res) => {
  const { ticketId } = req.params;
  const { status, note } = req.body;
  debugLog("admin.update_ticket_status", { adminId: req.admin.id, ticketId });

  if (!REVIEWABLE_TICKET_STATUSES.includes(status)) {
    return sendError(res, 400, "Status must be submitted, under_review, accepted, or rejected.");
  }

  if (!note || !note.trim()) {
    return sendError(res, 400, "A decision note is required.");
  }

  const ticket = await ProcurementTicket.findOne({ ticketId });
  if (!ticket) {
    return sendError(res, 404, "Procurement ticket not found.");
  }

  if (LOCKED_TICKET_STATUSES.includes(ticket.status)) {
    return sendError(res, 409, `Ticket cannot be reviewed while status is ${ticket.status}.`);
  }

  ticket.status = status;
  ticket.statusHistory.push({
    status,
    note: note.trim(),
  });
  await ticket.save();
  await syncSubmissionStatus(ticket);

  await createFarmerNotification({
    farmerId: ticket.farmerId,
    ticketId: ticket.ticketId,
    title: "Procurement ticket updated",
    message: `Ticket ${ticket.ticketId} is now ${status.replaceAll("_", " ")}: ${note.trim()}`,
    type: "ticket",
    createdBy: req.admin.id,
  });

  return sendSuccess(res, 200, {
    message: "Ticket status updated and farmer notified in the portal.",
    ticket,
  });
};

const updateFarmerProfile = async (req, res) => {
  const { farmerId } = req.params;
  const { fullname, mobileNumber, dateOfBirth, aadhaarNumber } = req.body;
  debugLog("admin.update_farmer_profile", { adminId: req.admin.id, farmerId });

  if (!fullname && !mobileNumber && !dateOfBirth && !aadhaarNumber) {
    return sendError(res, 400, "Provide at least one farmer profile field to update.");
  }

  if (dateOfBirth && !isValidDateOnly(dateOfBirth)) {
    return sendError(res, 400, "Date of birth must be a valid date in YYYY-MM-DD format.");
  }

  if (dateOfBirth && !isAtLeastAge(dateOfBirth, FARMER_MINIMUM_AGE)) {
    return sendError(res, 400, "Farmer date of birth must be at least 25 years ago.");
  }

  if (mobileNumber && !MOBILE_NUMBER_PATTERN.test(mobileNumber)) {
    return sendError(res, 400, "Mobile number must contain exactly 10 digits.");
  }

  const farmer = await Farmer.findById(farmerId).select("+aadhaarFingerprint");
  if (!farmer) {
    return sendError(res, 404, "Farmer not found.");
  }

  const previousFingerprint = farmer.aadhaarFingerprint;
  const identity = aadhaarNumber ? Farmer.prepareIdentity(aadhaarNumber) : null;
  const reservation = identity
    ? await reserveIdentity({
      aadhaarFingerprint: identity.aadhaarFingerprint,
      ownerType: "farmer",
      ownerId: farmer._id,
    })
    : null;

  if (fullname) {
    farmer.fullname = fullname.trim();
  }
  if (mobileNumber) {
    farmer.mobileNumber = mobileNumber;
  }
  if (dateOfBirth) {
    farmer.dateOfBirth = dateOfBirth;
  }
  if (identity) {
    Object.assign(farmer, identity);
    farmer.identityVerificationStatus = "officially_reviewed";
  }

  try {
    await farmer.save();
  } catch (error) {
    if (reservation && reservation.created) {
      await releaseIdentity({
        aadhaarFingerprint: identity.aadhaarFingerprint,
        ownerType: "farmer",
        ownerId: farmer._id,
      });
    }
    throw error;
  }

  if (identity && previousFingerprint && previousFingerprint !== identity.aadhaarFingerprint) {
    await releaseIdentity({
      aadhaarFingerprint: previousFingerprint,
      ownerType: "farmer",
      ownerId: farmer._id,
    });
  }

  await createFarmerNotification({
    farmerId: farmer._id,
    title: "Farmer profile updated",
    message: "Your farmer profile was updated by a super administrator. No full Aadhaar number is displayed in this portal.",
    type: "identity",
    createdBy: req.admin.id,
  });

  return sendSuccess(res, 200, {
    message: "Farmer profile updated.",
    farmer,
  });
};

const readProcurementSettings = async (req, res) => {
  debugLog("admin.read_procurement_settings", { adminId: req.admin.id });
  const settings = await getProcurementSettings();
  return sendSuccess(res, 200, { settings });
};

const saveProcurementSettings = async (req, res) => {
  debugLog("admin.update_procurement_settings", { adminId: req.admin.id });
  const { timeSlots, capacityPerSlot } = req.body;
  const settings = await updateProcurementSettings({
    timeSlots,
    capacityPerSlot,
    adminId: req.admin.id,
  });

  return sendSuccess(res, 200, {
    message: "Procurement slot settings updated.",
    settings,
  });
};

const sendFarmerNotification = async (req, res) => {
  const { farmerId } = req.params;
  const { title, message, ticketId = null, type = "general" } = req.body;
  debugLog("admin.send_notification", { adminId: req.admin.id, farmerId });

  if (!title || !title.trim() || !message || !message.trim()) {
    return sendError(res, 400, "Notification title and message are required.");
  }

  if (!NOTIFICATION_TYPES.includes(type)) {
    return sendError(res, 400, "Notification type is invalid.");
  }

  const farmerExists = await Farmer.exists({ _id: farmerId });
  if (!farmerExists) {
    return sendError(res, 404, "Farmer not found.");
  }

  if (ticketId) {
    const ticketExists = await ProcurementTicket.exists({ ticketId, farmerId });
    if (!ticketExists) {
      return sendError(res, 400, "The ticket does not belong to this farmer.");
    }
  }

  const notification = await createFarmerNotification({
    farmerId,
    ticketId,
    title,
    message,
    type,
    createdBy: req.admin.id,
  });

  return sendSuccess(res, 201, {
    message: "In-app farmer notification created.",
    notification,
  });
};

module.exports = {
  getTicket,
  listTickets,
  readProcurementSettings,
  saveProcurementSettings,
  sendFarmerNotification,
  updateFarmerProfile,
  updateTicketStatus,
};
