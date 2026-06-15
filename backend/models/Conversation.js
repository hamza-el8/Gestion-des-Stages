const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    participantIds: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ],
    type: {
      type: String,
      enum: ["student-supervisor", "student-company"],
      required: true,
    },
    internshipId: { type: mongoose.Schema.Types.ObjectId, ref: "Internship" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Conversation", conversationSchema);