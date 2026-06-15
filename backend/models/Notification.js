const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    type: {
      type: String,
      enum: ["info", "success", "warning", "application", "report", "eval", "soutenance"],
      default: "info",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);