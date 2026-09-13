const express = require("express");
const adminAuthController = require("../controllers/adminAuthController");
const { requireAdmin } = require("../middleware/adminAuth");
const { authLimiter } = require("../middleware/rateLimiter");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.post("/signup", authLimiter, asyncHandler(adminAuthController.registerAdmin));
router.post("/login", authLimiter, asyncHandler(adminAuthController.loginAdmin));
router.get("/me", requireAdmin, asyncHandler(adminAuthController.getCurrentAdmin));

module.exports = router;
