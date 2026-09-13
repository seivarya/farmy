const express = require("express");
const notificationController = require("../controllers/notificationController");
const verifyToken = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.get("/mine", verifyToken, asyncHandler(notificationController.listMyNotifications));
router.patch("/:id/read", verifyToken, asyncHandler(notificationController.markNotificationAsRead));

module.exports = router;
