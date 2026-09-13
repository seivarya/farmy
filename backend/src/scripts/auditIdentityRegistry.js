require("dotenv").config();

const mongoose = require("mongoose");
const { connectDB, disconnectDB } = require("../config/db");
const Farmer = require("../models/Farmer");
const { Admin } = require("../models/Admin");
const IdentityRegistry = require("../models/IdentityRegistry");

const apply = process.argv.includes("--apply");

const main = async () => {
  await connectDB();
  if (mongoose.connection.readyState !== 1) throw new Error("Database connection is unavailable.");

  const [farmers, admins] = await Promise.all([
    Farmer.find({ aadhaarFingerprint: { $exists: true } }).select("_id aadhaarFingerprint").lean(),
    Admin.find({ aadhaarFingerprint: { $exists: true } }).select("_id aadhaarFingerprint").lean(),
  ]);
  const claims = [
    ...farmers.map((farmer) => ({ ownerType: "farmer", ownerId: farmer._id, aadhaarFingerprint: farmer.aadhaarFingerprint })),
    ...admins.map((admin) => ({ ownerType: "admin", ownerId: admin._id, aadhaarFingerprint: admin.aadhaarFingerprint })),
  ];

  const duplicateFingerprints = [...claims.reduce((duplicates, claim) => {
    const owners = duplicates.get(claim.aadhaarFingerprint) || [];
    owners.push(`${claim.ownerType}:${claim.ownerId}`);
    duplicates.set(claim.aadhaarFingerprint, owners);
    return duplicates;
  }, new Map()).values()].filter((owners) => owners.length > 1);

  console.log(`[identity-audit] farmers=${farmers.length} admins=${admins.length} duplicateClaims=${duplicateFingerprints.length}`);
  if (duplicateFingerprints.length) {
    console.error("[identity-audit] Duplicate Aadhaar ownership detected. Resolve it manually before backfill.");
    process.exitCode = 1;
    return;
  }

  if (!apply) {
    console.log("[identity-audit] Read-only audit complete. Run npm run backfill:identities to create missing registry records.");
    return;
  }

  const operations = claims.map((claim) => ({
    updateOne: {
      filter: { aadhaarFingerprint: claim.aadhaarFingerprint },
      update: { $setOnInsert: claim },
      upsert: true,
    },
  }));
  if (operations.length) await IdentityRegistry.bulkWrite(operations, { ordered: true });
  console.log(`[identity-audit] Backfill complete for ${claims.length} identity claims.`);
};

main()
  .catch((error) => {
    console.error(`[identity-audit] ${error.message}`);
    process.exitCode = 1;
  })
  .finally(disconnectDB);
