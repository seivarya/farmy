const test = require("node:test");
const assert = require("node:assert/strict");
const { ProcurementSettings } = require("../src/models/ProcurementSettings");
const { validateProcurementSettings } = require("../src/services/procurementSettingsService");

test("settings service rejects an empty time-slot schedule", () => {
  assert.throws(
    () => validateProcurementSettings({ timeSlots: [], capacityPerSlot: 5 }),
    /Provide 1 to 12 unique time slots/,
  );
});

test("settings model rejects an empty time-slot schedule", async () => {
  const settings = new ProcurementSettings({
    key: "test",
    timeSlots: [],
    capacityPerSlot: 5,
  });

  await assert.rejects(
    settings.validate(),
    /At least one procurement time slot is required/,
  );
});
