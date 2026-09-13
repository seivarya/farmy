const FarmerNotification = require("../models/FarmerNotification");

const createFarmerNotification = async ({
  farmerId,
  ticketId = null,
  title,
  message,
  type = "general",
  createdBy,
}) => {
  return FarmerNotification.create({
    farmerId,
    ticketId,
    title,
    message,
    type,
    createdBy,
  });
};

module.exports = {
  createFarmerNotification,
};
