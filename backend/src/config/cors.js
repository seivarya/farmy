const developmentOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
];

const getAllowedOrigins = () => {
  const configuredOrigins = process.env.CORS_ORIGINS;
  if (!configuredOrigins) {
    return developmentOrigins;
  }

  return configuredOrigins
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
};

const createCorsOptions = () => {
  const allowedOrigins = getAllowedOrigins();

  return {
    origin(origin, callback) {
      const isAllowed = !origin || allowedOrigins.includes(origin);
      callback(null, isAllowed);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  };
};

module.exports = {
  createCorsOptions,
};
