const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { Admin } = require("../models/Admin");
const AdminBootstrap = require("../models/AdminBootstrap");
const { isValidDateOnly } = require("../utils/date");
const { sendError, sendSuccess } = require("../utils/http");
const { debugLog } = require("../utils/debug");
const { reserveIdentity, releaseIdentity } = require("../services/identityRegistryService");
const { createAdminToken } = require("../services/tokenService");

const ADMIN_MINIMUM_PASSWORD_LENGTH = 10;

const createBootstrapRecord = async () => {
  const existingAdmin = await Admin.exists({});
  if (existingAdmin) {
    return {
      bootstrap: null,
      role: "procurement_officer",
    };
  }

  try {
    const bootstrap = await AdminBootstrap.create({ key: "initial" });
    return {
      bootstrap,
      role: "super_admin",
    };
  } catch (error) {
    if (error.code === 11000) {
      const conflict = new Error("The first administrator signup is in progress. Please try again shortly.");
      conflict.statusCode = 409;
      throw conflict;
    }
    throw error;
  }
};

const registerAdmin = async (req, res) => {
  const { fullname, officialEmail, employeeId, mobileNumber, department, password, dateOfBirth, aadhaarNumber } = req.body;
  debugLog("admin.signup");

  if (!fullname || !officialEmail || !employeeId || !mobileNumber || !department || !password || !dateOfBirth || !aadhaarNumber) {
    return sendError(res, 400, "All administrator signup fields are required.");
  }

  if (password.length < ADMIN_MINIMUM_PASSWORD_LENGTH) {
    return sendError(res, 400, "Administrator password must be at least 10 characters.");
  }

  if (!isValidDateOnly(dateOfBirth)) {
    return sendError(res, 400, "Date of birth must be a valid date in YYYY-MM-DD format.");
  }

  const { bootstrap, role } = await createBootstrapRecord();
  const identity = Admin.prepareIdentity(aadhaarNumber);
  const adminId = new mongoose.Types.ObjectId();
  let reservation;

  try {
    reservation = await reserveIdentity({
      aadhaarFingerprint: identity.aadhaarFingerprint,
      ownerType: "admin",
      ownerId: adminId,
    });

    const admin = await Admin.create({
      _id: adminId,
      fullname,
      officialEmail,
      employeeId,
      mobileNumber,
      department,
      role,
      dateOfBirth,
      ...identity,
      password: await bcrypt.hash(password, 12),
    });

    if (bootstrap) {
      bootstrap.adminId = admin._id;
      await bootstrap.save();
    }

    return sendSuccess(res, 201, {
      message: role === "super_admin" ? "Super administrator registered." : "Administrator registered.",
      token: createAdminToken(admin),
      admin,
    });
  } catch (error) {
    if (reservation && reservation.created) {
      await releaseIdentity({
        aadhaarFingerprint: identity.aadhaarFingerprint,
        ownerType: "admin",
        ownerId: adminId,
      });
    }

    if (bootstrap) {
      await AdminBootstrap.deleteOne({ _id: bootstrap._id });
    }

    throw error;
  }
};

const loginAdmin = async (req, res) => {
  const { officialEmail, password } = req.body;
  debugLog("admin.login");

  if (!officialEmail || !password) {
    return sendError(res, 400, "Official email and password are required.");
  }

  const admin = await Admin.findOne({
    officialEmail: officialEmail.toLowerCase().trim(),
  }).select("+password");
  if (!admin) {
    return sendError(res, 401, "Invalid administrator email or password.");
  }

  const passwordMatches = await admin.comparePassword(password);
  if (!passwordMatches) {
    return sendError(res, 401, "Invalid administrator email or password.");
  }

  if (!admin.isActive) {
    return sendError(res, 403, "This administrator account is inactive.");
  }

  return sendSuccess(res, 200, {
    token: createAdminToken(admin),
    admin,
  });
};

const getCurrentAdmin = async (req, res) => {
  debugLog("admin.session", { adminId: req.admin.id });
  const admin = await Admin.findById(req.admin.id);
  if (!admin || !admin.isActive) {
    return sendError(res, 404, "Administrator account not found.");
  }

  return sendSuccess(res, 200, { admin });
};

module.exports = {
  getCurrentAdmin,
  loginAdmin,
  registerAdmin,
};
