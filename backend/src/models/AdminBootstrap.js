const mongoose = require("mongoose");

const adminBootstrapSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, immutable: true, default: "initial" },
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AdminBootstrap", adminBootstrapSchema);
