const express = require("express");
const authController = require("../controllers/authController");
const verifyToken = require("../middleware/auth");
const { authLimiter } = require("../middleware/rateLimiter");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.post("/send-otp", authLimiter, asyncHandler(authController.sendOtp));
router.post("/verify-otp", authLimiter, asyncHandler(authController.verifyOtpCode));
router.post("/register", authLimiter, asyncHandler(authController.registerFarmer));
router.post("/login", authLimiter, asyncHandler(authController.loginFarmer));
router.post("/reset-password", authLimiter, asyncHandler(authController.resetPassword));
router.patch("/identity", verifyToken, asyncHandler(authController.updateIdentity));
router.get("/me", verifyToken, asyncHandler(authController.getCurrentFarmer));

module.exports = router;
