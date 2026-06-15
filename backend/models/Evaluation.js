const mongoose = require("mongoose");

const evaluationSchema = new mongoose.Schema(
  {
    internshipId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Internship",
      required: true,
    },
    type: {
      type: String,
      enum: ["midterm", "final"],
      required: true,
    },
    score: { type: Number, required: true },
    criteria: [
      {
        label: { type: String, required: true },
        value: { type: Number, required: true },
      },
    ],
    comment: { type: String },
    evaluatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Evaluation", evaluationSchema);