const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    industry: { type: String, required: true },
    city: { type: String, required: true },
    address: { type: String, required: true },
    website: { type: String },
    email: { type: String, required: true },
    phone: { type: String },
    description: { type: String },
    logoColor: { type: String, default: "#3b82f6" },
    ownerUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    partner: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Company", companySchema);