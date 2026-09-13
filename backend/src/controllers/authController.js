const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Farmer = require("../models/Farmer");
const { isAtLeastAge, isValidDateOnly } = require("../utils/date");
const { sendError, sendSuccess } = require("../utils/http");
const { debugLog } = require("../utils/debug");
const { reserveIdentity, releaseIdentity } = require("../services/identityRegistryService");
const { OTP_TTL_SECONDS, hasVerifiedOtp, removeOtp, requestOtp, verifyOtp } = require("../services/otpService");
const { createFarmerToken } = require("../services/tokenService");

const MOBILE_NUMBER_PATTERN = /^\d{10}$/;
const FARMER_MINIMUM_AGE = 25;

const validateMobileNumber = (mobileNumber) => {
  return typeof mobileNumber === "string" && MOBILE_NUMBER_PATTERN.test(mobileNumber);
};

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

const sendOtp = async (req, res) => {
  const { mobileNumber, purpose = "registration" } = req.body;
  debugLog("auth.send_otp", { purpose });

  if (!validateMobileNumber(mobileNumber)) {
    return sendError(res, 400, "A valid 10-digit mobile number is required.");
  }

  const existingFarmer = await Farmer.findOne({ mobileNumber });
  if (purpose === "registration" && existingFarmer) {
    return sendError(res, 409, "A farmer with this mobile number is already registered. Please log in.");
  }

  if (purpose === "reset_password" && !existingFarmer) {
    return sendError(res, 404, "No farmer account found with this mobile number.");
  }

  const smsResult = await requestOtp({ mobileNumber, purpose });
  if (!smsResult.success) {
    await removeOtp({ mobileNumber, purpose });
    return sendError(res, 502, "Unable to send the verification SMS. Please check the SMS provider configuration and try again.");
  }

  return sendSuccess(res, 200, {
    message: `OTP sent successfully to +91 ${mobileNumber}.`,
    expiresInSeconds: OTP_TTL_SECONDS,
    smsProvider: smsResult.provider,
  });
};

const verifyOtpCode = async (req, res) => {
  const { mobileNumber, otp, purpose = "registration" } = req.body;
  debugLog("auth.verify_otp", { purpose });

  if (!mobileNumber || !otp) {
    return sendError(res, 400, "Both mobile number and OTP code are required.");
  }

  const result = await verifyOtp({ mobileNumber, otp, purpose });
  if (result.reason === "missing") {
    return sendError(res, 400, "OTP has expired or was never requested. Please request a new code.");
  }

  if (result.reason === "attempt_limit") {
    return sendError(res, 429, "Maximum verification attempts exceeded. Please request a new OTP.");
  }

  if (result.reason === "provider_unavailable") {
    return sendError(res, 502, "Unable to verify the OTP with Twilio. Please request a new code and try again.");
  }

  if (!result.verified) {
    return sendError(res, 400, `Invalid OTP code. You have ${result.attemptsRemaining} attempts remaining.`);
  }

  return sendSuccess(res, 200, {
    message: "OTP verified successfully.",
  });
};

const registerFarmer = async (req, res) => {
  const { fullname, mobileNumber, password, dateOfBirth, aadhaarNumber } = req.body;
  debugLog("auth.register_farmer");

  if (!fullname || !mobileNumber || !password || !dateOfBirth || !aadhaarNumber) {
    return sendError(res, 400, "Full name, date of birth, Aadhaar number, mobile number, and password are required.");
  }

  if (!validateMobileNumber(mobileNumber)) {
    return sendError(res, 400, "Mobile number must be exactly 10 digits.");
  }

  if (password.length < 6) {
    return sendError(res, 400, "Password must be at least 6 characters long.");
  }

  if (!isValidDateOnly(dateOfBirth)) {
    return sendError(res, 400, "Date of birth must be a valid date in YYYY-MM-DD format.");
  }

  if (!isAtLeastAge(dateOfBirth, FARMER_MINIMUM_AGE)) {
    return sendError(res, 400, "Farmers must be at least 25 years old to register.");
  }

  const otpIsVerified = await hasVerifiedOtp({ mobileNumber, purpose: "registration" });
  if (!otpIsVerified) {
    return sendError(res, 400, "Mobile number has not been verified with OTP.");
  }

  const existingFarmer = await Farmer.findOne({ mobileNumber });
  if (existingFarmer) {
    return sendError(res, 409, "A farmer with this mobile number is already registered.");
  }

  const identity = Farmer.prepareIdentity(aadhaarNumber);
  const farmerId = new mongoose.Types.ObjectId();
  const reservation = await reserveIdentity({
    aadhaarFingerprint: identity.aadhaarFingerprint,
    ownerType: "farmer",
    ownerId: farmerId,
  });

  let farmer;
  try {
    farmer = await Farmer.create({
      _id: farmerId,
      fullname: fullname.trim(),
      mobileNumber: mobileNumber.trim(),
      password: await hashPassword(password),
      dateOfBirth,
      ...identity,
    });
  } catch (error) {
    if (reservation.created) {
      await releaseIdentity({
        aadhaarFingerprint: identity.aadhaarFingerprint,
        ownerType: "farmer",
        ownerId: farmerId,
      });
    }
    throw error;
  }

  await removeOtp({ mobileNumber, purpose: "registration" });
  return sendSuccess(res, 201, {
    message: "Farmer registered successfully.",
    token: createFarmerToken(farmer._id),
    farmer,
  });
};

const loginFarmer = async (req, res) => {
  const { mobileNumber, password } = req.body;
  debugLog("auth.login_farmer");

  if (!mobileNumber || !password) {
    return sendError(res, 400, "Both mobile number and password are required.");
  }

  const farmer = await Farmer.findOne({ mobileNumber });
  if (!farmer) {
    return sendError(res, 401, "Invalid mobile number or password.");
  }

  const passwordMatches = await farmer.comparePassword(password);
  if (!passwordMatches) {
    return sendError(res, 401, "Invalid mobile number or password.");
  }

  return sendSuccess(res, 200, {
    message: "Welcome back! Login successful.",
    token: createFarmerToken(farmer._id),
    farmer,
  });
};

const resetPassword = async (req, res) => {
  const { mobileNumber, newPassword } = req.body;
  debugLog("auth.reset_password");

  if (!mobileNumber || !newPassword) {
    return sendError(res, 400, "Mobile number and new password are required.");
  }

  if (newPassword.length < 6) {
    return sendError(res, 400, "New password must be at least 6 characters long.");
  }

  const otpIsVerified = await hasVerifiedOtp({ mobileNumber, purpose: "reset_password" });
  if (!otpIsVerified) {
    return sendError(res, 400, "OTP verification required before resetting password.");
  }

  const farmer = await Farmer.findOne({ mobileNumber });
  if (!farmer) {
    return sendError(res, 404, "Farmer account not found.");
  }

  farmer.password = await hashPassword(newPassword);
  await farmer.save();
  await removeOtp({ mobileNumber, purpose: "reset_password" });

  return sendSuccess(res, 200, {
    message: "Password reset successfully. You can now log in with your new password.",
  });
};

const updateIdentity = async (req, res) => {
  const { dateOfBirth, aadhaarNumber } = req.body;

  if (!isValidDateOnly(dateOfBirth)) {
    return sendError(res, 400, "Date of birth must be a valid date in YYYY-MM-DD format.");
  }

  if (!isAtLeastAge(dateOfBirth, FARMER_MINIMUM_AGE)) {
    return sendError(res, 400, "Farmers must be at least 25 years old.");
  }

  const farmer = await Farmer.findById(req.user.id).select("+aadhaarFingerprint");
  if (!farmer) {
    return sendError(res, 404, "Farmer profile not found.");
  }

  const identity = Farmer.prepareIdentity(aadhaarNumber);
  const previousFingerprint = farmer.aadhaarFingerprint;
  const reservation = await reserveIdentity({
    aadhaarFingerprint: identity.aadhaarFingerprint,
    ownerType: "farmer",
    ownerId: farmer._id,
  });

  farmer.dateOfBirth = dateOfBirth;
  Object.assign(farmer, identity);
  try {
    await farmer.save();
  } catch (error) {
    if (reservation.created) {
      await releaseIdentity({
        aadhaarFingerprint: identity.aadhaarFingerprint,
        ownerType: "farmer",
        ownerId: farmer._id,
      });
    }
    throw error;
  }

  if (previousFingerprint && previousFingerprint !== identity.aadhaarFingerprint) {
    await releaseIdentity({
      aadhaarFingerprint: previousFingerprint,
      ownerType: "farmer",
      ownerId: farmer._id,
    });
  }

  debugLog("auth.identity_updated", { farmerId: String(farmer._id) });
  return sendSuccess(res, 200, {
    message: "Identity profile saved.",
    farmer,
  });
};

const getCurrentFarmer = async (req, res) => {
  const farmer = await Farmer.findById(req.user.id);
  if (!farmer) {
    return sendError(res, 404, "Farmer profile not found.");
  }

  return sendSuccess(res, 200, { farmer });
};

module.exports = {
  getCurrentFarmer,
  loginFarmer,
  registerFarmer,
  resetPassword,
  sendOtp,
  updateIdentity,
  verifyOtpCode,
};
