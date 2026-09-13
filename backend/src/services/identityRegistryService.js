const Farmer = require("../models/Farmer");
const { Admin } = require("../models/Admin");
const IdentityRegistry = require("../models/IdentityRegistry");
const { debugLog } = require("../utils/debug");

const createIdentityConflict = () => {
  const error = new Error("An account with this Aadhaar number already exists.");
  error.statusCode = 409;
  return error;
};

const idsMatch = (left, right) => String(left) === String(right);

const reserveIdentity = async ({ aadhaarFingerprint, ownerType, ownerId }) => {
  const [farmer, admin, registry] = await Promise.all([
    Farmer.findOne({ aadhaarFingerprint }).select("_id"),
    Admin.findOne({ aadhaarFingerprint }).select("_id"),
    IdentityRegistry.findOne({ aadhaarFingerprint }).select("ownerType ownerId"),
  ]);

  const occupiedByAnotherFarmer = farmer && (ownerType !== "farmer" || !idsMatch(farmer._id, ownerId));
  const occupiedByAnotherAdmin = admin && (ownerType !== "admin" || !idsMatch(admin._id, ownerId));
  const occupiedInRegistry = registry && (registry.ownerType !== ownerType || !idsMatch(registry.ownerId, ownerId));

  if (occupiedByAnotherFarmer || occupiedByAnotherAdmin || occupiedInRegistry) {
    debugLog("identity.conflict", { ownerType });
    throw createIdentityConflict();
  }

  if (registry) return { created: false, registry };

  try {
    const createdRegistry = await IdentityRegistry.create({ aadhaarFingerprint, ownerType, ownerId });
    debugLog("identity.reserved", { ownerType, ownerId: String(ownerId) });
    return { created: true, registry: createdRegistry };
  } catch (error) {
    if (error.code === 11000) throw createIdentityConflict();
    throw error;
  }
};

const releaseIdentity = async ({ aadhaarFingerprint, ownerType, ownerId }) => {
  await IdentityRegistry.deleteOne({ aadhaarFingerprint, ownerType, ownerId });
  debugLog("identity.released", { ownerType, ownerId: String(ownerId) });
};

module.exports = { releaseIdentity, reserveIdentity };
