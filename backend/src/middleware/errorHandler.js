const errorHandler = (err, req, res, next) => {
  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err.message || err);

  // duplicate database key
  if (err.code === 11000) {
    const duplicateField = Object.keys(err.keyValue || {})[0] || "field";
    if (duplicateField === "aadhaarFingerprint") {
      return res.status(409).json({
        success: false,
        error: "An account with this Aadhaar number already exists.",
        field: "aadhaarNumber",
      });
    }
    const duplicateValue = err.keyValue ? err.keyValue[duplicateField] : "";
    return res.status(409).json({
      success: false,
      error: `The ${duplicateField} '${duplicateValue}' is already registered.`,
      field: duplicateField,
    });
  }

  // schema validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      error: messages.join(", "),
      details: messages,
    });
  }

  // invalid mongodb id
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      error: `Invalid identifier format: ${err.value}`,
    });
  }

  // fallback response
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || "An unexpected server error occurred.",
  });
};

const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

module.exports = {
  errorHandler,
  notFoundHandler,
};
