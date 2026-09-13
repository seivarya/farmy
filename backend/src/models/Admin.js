const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { encryptAadhaar, getAadhaarFingerprint, getAadhaarLast4, validateAadhaar } = require("../utils/identity");

const ADMIN_ROLES = ["super_admin", "procurement_officer", "support_officer"];

const adminSchema = new mongoose.Schema(
  {
    fullname: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    officialEmail: { type: String, required: true, unique: true, lowercase: true, trim: true, match: /^\S+@\S+\.\S+$/ },
    employeeId: { type: String, required: true, unique: true, uppercase: true, trim: true, match: /^[A-Z0-9-]{4,30}$/ },
    mobileNumber: { type: String, required: true, match: /^\d{10}$/ },
    dateOfBirth: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    aadhaarEncrypted: { type: String, required: true, select: false },
    aadhaarFingerprint: { type: String, required: true, select: false },
    aadhaarLast4: { type: String, required: true, match: /^\d{4}$/ },
    department: { type: String, required: true, enum: ["procurement", "operations", "support", "administration"] },
    role: { type: String, enum: ADMIN_ROLES, default: "procurement_officer" },
    password: { type: String, required: true, minlength: 10, select: false },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

// allow legacy records without a fingerprint
adminSchema.index(
  { aadhaarFingerprint: 1 },
  { name: "admin_aadhaar_fingerprint_unique", unique: true, partialFilterExpression: { aadhaarFingerprint: { $type: "string" } } }
);

adminSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

adminSchema.methods.toJSON = function toJSON() {
  const admin = this.toObject();
  delete admin.password;
  delete admin.aadhaarEncrypted;
  delete admin.aadhaarFingerprint;
  delete admin.__v;
  return admin;
};

adminSchema.statics.prepareIdentity = (aadhaarNumber) => {
  if (!validateAadhaar(aadhaarNumber)) {
    const error = new Error("Aadhaar number must contain exactly 12 digits.");
    error.statusCode = 400;
    throw error;
  }

  return {
    aadhaarEncrypted: encryptAadhaar(aadhaarNumber),
    aadhaarFingerprint: getAadhaarFingerprint(aadhaarNumber),
    aadhaarLast4: getAadhaarLast4(aadhaarNumber),
  };
};

module.exports = {
  Admin: mongoose.model("Admin", adminSchema),
  ADMIN_ROLES,
};
