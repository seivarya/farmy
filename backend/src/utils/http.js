const sendError = (res, statusCode, error, additionalFields = {}) => {
  const response = {
    success: false,
    error,
    ...additionalFields,
  };

  return res.status(statusCode).json(response);
};

const sendSuccess = (res, statusCode, payload) => {
  return res.status(statusCode).json({
    success: true,
    ...payload,
  });
};

module.exports = {
  sendError,
  sendSuccess,
};
