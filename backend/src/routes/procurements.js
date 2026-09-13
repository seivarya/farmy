const express = require("express");
const procurementController = require("../controllers/procurementController");
const verifyToken = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.post("/", verifyToken, asyncHandler(procurementController.submitProcurement));
router.get("/mine", verifyToken, asyncHandler(procurementController.listMySubmissions));

module.exports = router;
