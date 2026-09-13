const { ProcurementSubmission } = require("../models/ProcurementSubmission");

const REVIEWABLE_TICKET_STATUSES = [
  "submitted",
  "under_review",
  "accepted",
  "rejected",
];

const LOCKED_TICKET_STATUSES = [
  "slot_booked",
  "scheduled",
  "completed",
  "cancelled",
];

const submissionStatusByTicketStatus = {
  submitted: "submitted",
  under_review: "under_review",
  accepted: "approved",
  rejected: "rejected",
};

const syncSubmissionStatus = async (ticket) => {
  const submissionStatus = submissionStatusByTicketStatus[ticket.status];
  if (!submissionStatus) {
    return;
  }

  await ProcurementSubmission.updateOne(
    { _id: ticket.procurementSubmissionId },
    { status: submissionStatus },
  );
};

module.exports = {
  LOCKED_TICKET_STATUSES,
  REVIEWABLE_TICKET_STATUSES,
  syncSubmissionStatus,
};
