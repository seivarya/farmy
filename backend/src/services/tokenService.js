const jwt = require("jsonwebtoken");

const getJwtSecret = () => process.env.JWT_SECRET || "fallback_secret_farmy";

const createFarmerToken = (farmerId) => {
  return jwt.sign(
    { id: farmerId },
    getJwtSecret(),
    { expiresIn: "7d" },
  );
};

const createAdminToken = (admin) => {
  return jwt.sign(
    {
      id: admin._id,
      role: "admin",
      accessRole: admin.role,
    },
    getJwtSecret(),
    { expiresIn: "8h" },
  );
};

module.exports = {
  createAdminToken,
  createFarmerToken,
  getJwtSecret,
};
