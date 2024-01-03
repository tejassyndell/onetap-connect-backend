const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
// Define the schema for administrators
const adminSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      default: null,
    },
    lastName: {
      type: String,
      default: null,
    },
    email: {
      type: String,
      default: null,
    },
    password: {
      type: String,
      minLength: [8, "Minimum 8 character"],
      select: false,
      default: null,
    },
    userRole: {
      type: String,
      default: null,
    },
    phoneNumber: {
      type: String,
      default: null,
    },
    avatar: { type: String, default: "" },
    officenumber: {
      type: String,
      default: null,
    },
    jobTitles: [{ type: String }],
    team: { type: mongoose.Schema.Types.ObjectId, ref: "Otc_Adminteams" },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  
  { timestamps: true }
);

adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  console.log(this);
  console.log(this.password);
  this.password = await bcrypt.hash(this.password, 10);
});

adminSchema.methods.comparePassword = async function (enteredPassword) {
  console.log(enteredPassword, this.password);
  return await bcrypt.compare(enteredPassword, this.password);
};

adminSchema.methods.getJWTToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

adminSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPasswordExpire = Date.now() + 15 * 60 * 60 * 1000;
  return this.resetPasswordToken; // Return the value stored in this.resetPasswordToken
};
// Create a model based on the schema
const Admin = mongoose.model("Otc_Adminusers", adminSchema);

module.exports = Admin;
