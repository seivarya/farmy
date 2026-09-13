const express = require("express");
const slotController = require("../controllers/slotController");
const verifyToken = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.get("/available", asyncHandler(slotController.listAvailableSlots));
router.post("/book", verifyToken, asyncHandler(slotController.bookProcurementSlot));
router.get("/my-slots", verifyToken, asyncHandler(slotController.listMySlots));
router.patch("/:id/cancel", verifyToken, asyncHandler(slotController.cancelProcurementSlot));

module.exports = router;
