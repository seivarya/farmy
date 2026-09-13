const Farmer = require("../models/Farmer");
const { ProcurementSubmission } = require("../models/ProcurementSubmission");
const { sendError, sendSuccess } = require("../utils/http");
const { debugLog } = require("../utils/debug");
const { createSubmissionAndTicket, findActiveTicket } = require("../services/procurementService");

const submitProcurement = async (req, res) => {
  const { surveyNumber, crop, expectedWeightQuintals, bankAccountNumber, ifsc } = req.body;
  const farmerId = req.user.id;
  debugLog("procurement.submit", { farmerId });

  const farmer = await Farmer.findById(farmerId);
  if (!farmer || !farmer.dateOfBirth || !farmer.aadhaarLast4) {
    return sendError(res, 409, "Complete your date of birth and Aadhaar identity profile before submitting a procurement form.");
  }

  const existingActiveTicket = await findActiveTicket({ farmerId, crop });
  if (existingActiveTicket) {
    return sendError(res, 409, `You already have an active ${crop} procurement ticket: ${existingActiveTicket.ticketId}.`, {
      ticketId: existingActiveTicket.ticketId,
    });
  }

  try {
    const { submission, ticket } = await createSubmissionAndTicket({
      farmerId,
      surveyNumber,
      crop,
      expectedWeightQuintals,
      bankAccountNumber,
      ifsc,
    });

    return sendSuccess(res, 201, {
      message: "Produce intake details submitted and ticket generated successfully.",
      submission,
      ticket,
    });
  } catch (error) {
    if (error.code === 11000) {
      return sendError(res, 409, "You already have an active procurement ticket for this crop.");
    }
    throw error;
  }
};

const listMySubmissions = async (req, res) => {
  const farmerId = req.user.id;
  debugLog("procurement.list_mine", { farmerId });

  const submissions = await ProcurementSubmission.find({ farmerId })
    .sort({ createdAt: -1 });

  return sendSuccess(res, 200, {
    count: submissions.length,
    submissions,
  });
};

module.exports = {
  listMySubmissions,
  submitProcurement,
};
