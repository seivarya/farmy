const express = require("express");
const ticketController = require("../controllers/ticketController");
const verifyToken = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.get("/mine", verifyToken, asyncHandler(ticketController.listMyTickets));
router.get("/:ticketId", verifyToken, asyncHandler(ticketController.getMyTicket));

module.exports = router;
