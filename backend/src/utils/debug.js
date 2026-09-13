const debugLog = (event, context = {}) => {
  // do not pass sensitive data here
  console.debug(`[debug] ${new Date().toISOString()} ${event}`, context);
};

module.exports = { debugLog };
