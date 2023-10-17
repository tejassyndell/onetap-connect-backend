const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
require("dotenv").config();

const userSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      validate: {
        validator: function (value) {
          return value.trim() !== ""; // Check that first_name is not an empty string
        },
        message: "First name cannot be empty",
      },
    },
    team: { type: mongoose.Schema.Types.ObjectId, require: false, set: v => v === '' ? null : v },
    // team: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   default: null,
    //   validate: {
    //     validator: function(value) {
    //       if (value === null || value === "") {
    //         return true; // Allow null or empty string
    //       }
    //       return typeof value === "string" && validator.isMongoId(value);
    //     },
    //     message: "Team must be a valid ObjectId, null, or an empty string",
    //   },
    // },
    first_login: {
      type: Boolean, default: true,
    },
    last_name: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
      validate: [validator.isEmail, "Please enter valid Email"],
    },
    password: {
      type: String,
      minLength: [8, "Minimum 8 character"],
      select: false,
      default: null,
    },
    userurlslug: {
      type: String,
      default: function () {
        const firstName = this.first_name
          .toLowerCase()
          .replace(/[^a-z0-9-]/g, "");
        const lastName = this.last_name
          .toLowerCase()
          .replace(/[^a-z0-9-]/g, "");
        return `${firstName}${lastName}`;
      },
    },
    user_line1_address_permission: {
      type: Boolean,
      default: false,
    },
    user_line2_apartment_permission: {
      type: Boolean,
      default: false,
    },
    user_city_permission: {
      type: Boolean,
      default: false,
    },
    user_state_permission: {
      type: Boolean,
      default: false,
    },
    user_postal_code_permission: {
      type: Boolean,
      default: false,
    },
    contact: { type: Number, default: null },
    address: {
      line1: { type: String, default: null },
      line2: { type: String, default: null },
      city: { type: String, default: null },
      state: { type: String, default: null },
      country: { type: String, default: null },
      postal_code: { type: String, default: null },
    },
    user_line1_address_permission: {
      type: Boolean,
      default: false,
    },
    user_line2_apartment_permission: {
      type: Boolean,
      default: false,
    },
    user_city_permission: {
      type: Boolean,
      default: false,
    },
    user_state_permission: {
      type: Boolean,
      default: false,
    },
    user_postal_code_permission: {
      type: Boolean,
      default: false,
    },
    avatar: { type: String, default: "" },
    designation: [{ type: String }],
    isVerified: {
      type: Boolean,
      default: false,
    },
    status: { type: String, default: "active" },
    delete_account_status:{ type: String, default: "active" },
    recoveryToken: String,
    statusChangeDate: { type: Date },
    isIndividual: {
      type: Boolean,
      default: false,
    },
    keywords: { type: String, default: null },
    userurlslug: {
      type: String,
      default: function () {
        const firstName = this.first_name
          .toLowerCase()
          .replace(/[^a-z0-9-]/g, "");
        const lastName = this.last_name
          .toLowerCase()
          .replace(/[^a-z0-9-]/g, "");
        return `${firstName}${lastName}`;
      },
    },
    isPaidUser: { type: Boolean, default: false },
    role: { type: String, default: "superadmin" },
    googleId: { type: String, default: null },
    companyID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "company",
      default: null,
    },
    otp:{type: String, default: null},
    personlize_company_name: {type: String, default: null},
    personlize_primary_office_number : {type: Number, default: null},
    personlize_Website_url: {type: String, default: null},
    personlize_Primary_activities : {type: String, default: null},
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  console.log(this);
  console.log(this.password);
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.getJWTToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

userSchema.methods.comparePassword = async function (enteredPassword) {
  console.log(enteredPassword, this.password);
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPasswordExpire = Date.now() + 15 * 60 * 60 * 1000;
  return this.resetPasswordToken; // Return the value stored in this.resetPasswordToken
};

userSchema.pre("save", function (next) {
  if (this.isModified("status")) {
    this.statusChangeDate = new Date();
  }
  next();
});

module.exports = mongoose.model("user", userSchema);
