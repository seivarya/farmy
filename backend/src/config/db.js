const mongoose = require("mongoose");

const DEFAULT_DATABASE_URI = "mongodb://localhost:27017/farmy";
const DEFAULT_SERVER_SELECTION_TIMEOUT_MS = 5000;
const DEFAULT_SOCKET_TIMEOUT_MS = 45000;
const DEFAULT_MAX_POOL_SIZE = 10;

mongoose.set("bufferCommands", false);

const parsePositiveInteger = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isInteger(parsed) && parsed > 0) {
    return parsed;
  }

  return fallback;
};

const getDatabaseOptions = () => {
  return {
    autoIndex: process.env.MONGOOSE_AUTO_INDEX !== "false",
    maxPoolSize: parsePositiveInteger(process.env.MONGO_MAX_POOL_SIZE, DEFAULT_MAX_POOL_SIZE),
    serverSelectionTimeoutMS: parsePositiveInteger(
      process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS,
      DEFAULT_SERVER_SELECTION_TIMEOUT_MS,
    ),
    socketTimeoutMS: parsePositiveInteger(
      process.env.MONGO_SOCKET_TIMEOUT_MS,
      DEFAULT_SOCKET_TIMEOUT_MS,
    ),
  };
};

const registerConnectionLogging = () => {
  mongoose.connection.on("error", (error) => {
    console.error("[database] connection error:", error.message);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("[database] disconnected.");
  });

  mongoose.connection.on("reconnected", () => {
    console.log("[database] reconnected.");
  });
};

registerConnectionLogging();

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const mongoUri = process.env.MONGO_URI || DEFAULT_DATABASE_URI;

  const options = getDatabaseOptions();

  try {
    const connection = await mongoose.connect(mongoUri, options);
    console.log(`[database] connected: ${connection.connection.host} / ${connection.connection.name}`);
    return connection;
  } catch (error) {
    console.error("[database] connection failed:", error.message);
    return null;
  }
};

const disconnectDB = async () => {
  if (mongoose.connection.readyState === 0) {
    return;
  }

  try {
    await mongoose.connection.close(false);
    console.log("[database] connection closed.");
  } catch (error) {
    console.error("[database] disconnect error:", error.message);
  }
};

module.exports = {
  connectDB,
  disconnectDB,
  getDatabaseOptions,
};
