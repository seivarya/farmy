const { ProcurementSubmission } = require("../models/ProcurementSubmission");
const { ACTIVE_TICKET_STATUSES, ProcurementTicket, generateTicketId } = require("../models/ProcurementTicket");

const findActiveTicket = async ({ farmerId, crop }) => {
  return ProcurementTicket.findOne({
    farmerId,
    crop,
    status: { $in: ACTIVE_TICKET_STATUSES },
  });
};

const createSubmissionAndTicket = async ({
  farmerId,
  surveyNumber,
  crop,
  expectedWeightQuintals,
  bankAccountNumber,
  ifsc,
}) => {
  const ticketId = generateTicketId();
  const submission = await ProcurementSubmission.create({
    farmerId,
    surveyNumber,
    crop,
    expectedWeightQuintals,
    bankAccountNumber,
    ifsc: typeof ifsc === "string" ? ifsc.toUpperCase() : ifsc,
    ticketId,
  });

  try {
    const ticket = await ProcurementTicket.create({
      ticketId,
      farmerId,
      procurementSubmissionId: submission._id,
      crop,
      expectedWeightQuintals,
    });

    return { submission, ticket };
  } catch (error) {
    await ProcurementSubmission.deleteOne({ _id: submission._id });
    throw error;
  }
};

module.exports = {
  createSubmissionAndTicket,
  findActiveTicket,
};
