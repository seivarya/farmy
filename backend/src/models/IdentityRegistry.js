const mongoose = require("mongoose");

const identityRegistrySchema = new mongoose.Schema(
  {
    aadhaarFingerprint: { type: String, required: true, unique: true, select: false },
    ownerType: { type: String, required: true, enum: ["farmer", "admin"] },
    ownerId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  },
  { timestamps: true }
);

identityRegistrySchema.index({ ownerType: 1, ownerId: 1 });

module.exports = mongoose.model("IdentityRegistry", identityRegistrySchema);
