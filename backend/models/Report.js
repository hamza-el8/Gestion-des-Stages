const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
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
    type: { type: String, enum: ["daily", "weekly"], required: true },
    title: { type: String, required: true },
    date: { type: Date, required: true },
    content: { type: String, required: true },
    status: {
      type: String,
      enum: ["draft", "submitted", "approved", "rejected"],
      default: "draft",
    },
    feedback: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Report", reportSchema);