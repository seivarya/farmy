const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const { createCorsOptions } = require("./config/cors");
const adminRoutes = require("./routes/admin");
const adminAuthRoutes = require("./routes/adminAuth");
const authRoutes = require("./routes/auth");
const notificationRoutes = require("./routes/notifications");
const procurementRoutes = require("./routes/procurements");
const slotRoutes = require("./routes/slot");
const ticketRoutes = require("./routes/tickets");
const requireDatabase = require("./middleware/databaseAvailable");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");
const { apiLimiter } = require("./middleware/rateLimiter");
const logApiRequest = require("./middleware/requestLogger");
const smsService = require("./services/smsService");

const createApp = () => {
  const app = express();

  app.use(cors(createCorsOptions()));
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));

  app.use("/api", logApiRequest);
  app.use("/api", apiLimiter);
  app.use("/api", requireDatabase);

  app.use("/api/auth", authRoutes);
  app.use("/api/slots", slotRoutes);
  app.use("/api/procurements", procurementRoutes);
  app.use("/api/tickets", ticketRoutes);
  app.use("/api/admin/auth", adminAuthRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/notifications", notificationRoutes);

  app.get("/health", (req, res) => {
    const databaseConnected = mongoose.connection.readyState === 1;
    return res.json({
      status: databaseConnected ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      database: databaseConnected ? "connected" : "disconnected",
      sms: smsService.getStatus(),
    });
  });

  app.get("/", (req, res) => {
    return res.json({
      service: "Farmy Crop Procurement API",
      version: "2.0.0",
      docs: "/api",
    });
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

module.exports = createApp;
