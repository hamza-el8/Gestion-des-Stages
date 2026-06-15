const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    filiere: { type: String, required: true },
    durationWeeks: { type: Number, required: true },
    city: { type: String, required: true },
    paid: { type: Boolean, default: false },
    remote: { type: Boolean, default: false },
    skills: [{ type: String }],
    status: { type: String, enum: ["open", "closed"], default: "open" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Offer", offerSchema);