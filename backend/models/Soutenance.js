const mongoose = require("mongoose");

const soutenanceSchema = new mongoose.Schema(
  {
    internshipId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Internship",
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    room: { type: String, required: true },
    juryIds: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ],
    presidentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    grade: { type: Number },
    status: {
      type: String,
      enum: ["scheduled", "done", "cancelled"],
      default: "scheduled",
    },
    notes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Soutenance", soutenanceSchema);