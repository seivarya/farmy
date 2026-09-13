require("dotenv").config();

const createApp = require("./app");
const { connectDB, disconnectDB } = require("./config/db");

const PORT = process.env.PORT || 6767;
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_farmy";
const app = createApp();

const warnAboutWeakJwtSecret = () => {
  const weakSecrets = ["yourSecretKey", "fallback_secret_farmy"];
  if (!weakSecrets.includes(JWT_SECRET)) {
    return;
  }

  console.warn("[security] JWT_SECRET is using a weak or default key. Configure a strong random secret in production.");
};

const startServer = async () => {
  warnAboutWeakJwtSecret();
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`[server] Farmy Backend running at http://localhost:${PORT}`);
  });

  const shutdown = (signal) => {
    console.log(`[server] received ${signal}; shutting down.`);
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
};

if (require.main === module) {
  startServer();
}

module.exports = app;
