const { ProcurementSettings } = require("../models/ProcurementSettings");

const TIME_SLOT_PATTERN = /^\d{2}:\d{2} (AM|PM) - \d{2}:\d{2} (AM|PM)$/;

const validateProcurementSettings = ({ timeSlots, capacityPerSlot }) => {
  const timeSlotsAreValid = Array.isArray(timeSlots)
    && timeSlots.length > 0
    && timeSlots.length <= 12
    && new Set(timeSlots).size === timeSlots.length
    && timeSlots.every((timeSlot) => TIME_SLOT_PATTERN.test(timeSlot));

  if (!timeSlotsAreValid) {
    const error = new Error("Provide 1 to 12 unique time slots using HH:MM AM - HH:MM PM.");
    error.statusCode = 400;
    throw error;
  }

  const capacityIsValid = Number.isInteger(capacityPerSlot)
    && capacityPerSlot >= 1
    && capacityPerSlot <= 100;
  if (!capacityIsValid) {
    const error = new Error("Capacity per slot must be an integer between 1 and 100.");
    error.statusCode = 400;
    throw error;
  }
};

const updateProcurementSettings = async ({ timeSlots, capacityPerSlot, adminId }) => {
  validateProcurementSettings({ timeSlots, capacityPerSlot });
  return ProcurementSettings.findOneAndUpdate(
    { key: "default" },
    {
      timeSlots,
      capacityPerSlot,
      updatedBy: adminId,
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
    },
  );
};

module.exports = {
  updateProcurementSettings,
  validateProcurementSettings,
};
