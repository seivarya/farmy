const express = require("express");
const adminController = require("../controllers/adminController");
const { requireAdmin, requireRole } = require("../middleware/adminAuth");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.use(requireAdmin);

router.get("/tickets", asyncHandler(adminController.listTickets));
router.get("/tickets/:ticketId", asyncHandler(adminController.getTicket));
router.patch(
  "/tickets/:ticketId/status",
  requireRole("super_admin", "procurement_officer"),
  asyncHandler(adminController.updateTicketStatus),
);
router.patch(
  "/farmers/:farmerId/profile",
  requireRole("super_admin"),
  asyncHandler(adminController.updateFarmerProfile),
);
router.get(
  "/settings/procurement",
  requireRole("super_admin"),
  asyncHandler(adminController.readProcurementSettings),
);
router.patch(
  "/settings/procurement",
  requireRole("super_admin"),
  asyncHandler(adminController.saveProcurementSettings),
);
router.post(
  "/farmers/:farmerId/notifications",
  requireRole("super_admin", "procurement_officer", "support_officer"),
  asyncHandler(adminController.sendFarmerNotification),
);

module.exports = router;
