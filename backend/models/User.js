const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "student", "supervisor", "company"],
      required: true,
    },
    phone: { type: String },
    avatarColor: { type: String, default: "#4f46e5" },
    active: { type: Boolean, default: true },

    // Student specific
    bio: { type: String },
    filiere: { type: String },
    level: { type: String },
    city: { type: String },
    cvName: { type: String },
    cvData: { type: String },
    skills: [{ type: String }],

    // Company user
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);