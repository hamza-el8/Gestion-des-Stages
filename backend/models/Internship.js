const mongoose = require("mongoose");

const internshipSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    offerId: { type: mongoose.Schema.Types.ObjectId, ref: "Offer" },
    supervisorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    topic: { type: String, required: true },
    companyMentor: { type: String },
    status: {
      type: String,
      enum: ["ongoing", "completed", "cancelled"],
      default: "ongoing",
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    hoursPerWeek: { type: Number, default: 40 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Internship", internshipSchema);