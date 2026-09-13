import apiClient from "./client";

export const sendOtp = (mobileNumber, purpose = "registration") => {
  return apiClient.post("/auth/send-otp", { mobileNumber, purpose });
};

export const verifyOtp = (mobileNumber, otp, purpose = "registration") => {
  return apiClient.post("/auth/verify-otp", { mobileNumber, otp, purpose });
};

export const registerFarmer = ({ fullname, dateOfBirth, aadhaarNumber, mobileNumber, password }) => {
  return apiClient.post("/auth/register", { fullname, dateOfBirth, aadhaarNumber, mobileNumber, password });
};

export const loginFarmer = ({ mobileNumber, password }) => {
  return apiClient.post("/auth/login", { mobileNumber, password });
};

export const resetPassword = ({ mobileNumber, newPassword }) => {
  return apiClient.post("/auth/reset-password", { mobileNumber, newPassword });
};

export const getCurrentFarmer = () => {
  return apiClient.get("/auth/me");
};

export const updateFarmerIdentity = ({ dateOfBirth, aadhaarNumber }) =>
  apiClient.patch("/auth/identity", { dateOfBirth, aadhaarNumber });
