const Otp = require("../models/Otp");
const smsService = require("./smsService");

const OTP_TTL_SECONDS = 300;
const MAX_OTP_ATTEMPTS = 5;

const createOtp = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

const requestOtp = async ({ mobileNumber, purpose }) => {
  const usesTwilioVerify = smsService.usesTwilioVerify();
  const generatedOtp = usesTwilioVerify ? undefined : createOtp();

  await Otp.deleteMany({ mobileNumber, purpose });
  await Otp.create({
    mobileNumber,
    otp: generatedOtp,
    purpose,
    provider: usesTwilioVerify ? "twilio_verify" : "local",
  });

  return smsService.sendOtpSms(mobileNumber, generatedOtp, purpose);
};

const verifyOtp = async ({ mobileNumber, otp, purpose }) => {
  const otpRecord = await Otp.findOne({ mobileNumber, purpose });
  if (!otpRecord) {
    return {
      verified: false,
      reason: "missing",
    };
  }

  if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) {
    await Otp.deleteOne({ _id: otpRecord._id });
    return {
      verified: false,
      reason: "attempt_limit",
    };
  }

  const submittedOtp = otp.trim();
  let isVerified;

  if (otpRecord.provider === "twilio_verify") {
    const providerResult = await smsService.verifyOtp(mobileNumber, submittedOtp);
    if (!providerResult.success) {
      return {
        verified: false,
        reason: "provider_unavailable",
      };
    }
    isVerified = providerResult.approved;
  } else {
    isVerified = otpRecord.otp === submittedOtp;
  }

  if (!isVerified) {
    otpRecord.attempts += 1;
    await otpRecord.save();
    return {
      verified: false,
      reason: "invalid",
      attemptsRemaining: MAX_OTP_ATTEMPTS - otpRecord.attempts,
    };
  }

  otpRecord.verified = true;
  await otpRecord.save();
  return { verified: true };
};

const hasVerifiedOtp = async ({ mobileNumber, purpose }) => {
  const otpRecord = await Otp.findOne({ mobileNumber, purpose });
  return Boolean(otpRecord && otpRecord.verified);
};

const removeOtp = async ({ mobileNumber, purpose }) => {
  await Otp.deleteMany({ mobileNumber, purpose });
};

module.exports = {
  OTP_TTL_SECONDS,
  hasVerifiedOtp,
  removeOtp,
  requestOtp,
  verifyOtp,
};
