const { debugLog } = require("../utils/debug");

const logApiRequest = (req, res, next) => {
  const startedAt = Date.now();
  debugLog("api.request", {
    method: req.method,
    path: req.path,
  });

  res.on("finish", () => {
    debugLog("api.response", {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      durationMs: Date.now() - startedAt,
    });
  });

  next();
};

module.exports = logApiRequest;
