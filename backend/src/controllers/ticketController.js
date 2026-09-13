const { ProcurementSubmission } = require("../models/ProcurementSubmission");
const { ProcurementTicket } = require("../models/ProcurementTicket");
const { sendError, sendSuccess } = require("../utils/http");

const listMyTickets = async (req, res) => {
  const tickets = await ProcurementTicket.find({ farmerId: req.user.id })
    .sort({ createdAt: -1 });

  return sendSuccess(res, 200, {
    count: tickets.length,
    tickets,
  });
};

const getMyTicket = async (req, res) => {
  const farmerId = req.user.id;
  const ticket = await ProcurementTicket.findOne({
    ticketId: req.params.ticketId,
    farmerId,
  });
  if (!ticket) {
    return sendError(res, 404, "Ticket not found or you are not authorized to view it.");
  }

  const submission = await ProcurementSubmission.findOne({
    ticketId: ticket.ticketId,
    farmerId,
  });
  return sendSuccess(res, 200, { ticket, submission });
};

module.exports = {
  getMyTicket,
  listMyTickets,
};
