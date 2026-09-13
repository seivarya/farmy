const mongoose = require("mongoose");
const { sendError } = require("../utils/http");

const requireDatabase = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return sendError(res, 503, "Database is unavailable. Start MongoDB or configure MONGO_URI, then try again.");
  }

  return next();
};

module.exports = requireDatabase;
