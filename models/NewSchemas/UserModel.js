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
    team: {
      type: mongoose.Schema.Types.ObjectId,
      require: false,
      set: (v) => (v === "" ? null : v),
    },
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
      type: Boolean,
      default: true,
    },
    last_name: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
      validate: [validator.isEmail, "Please enter valid Email"],
      lowercase: true,
      set: function (email) {
        return email.toLowerCase();
      }
    },
    businessemail: {
      type: String,
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
    delete_account_status: { type: String, default: "active" },
    recoveryToken: String,
    statusChangeDate: { type: Date },
    isIndividual: {
      type: Boolean,
      default: false,
    },
    Account_setup: {
      introvideostep1: { type: Boolean, default: false },
      completecompanysetupstep2: { type: Boolean, default: false },
      completepersonalsetupstep3: { type: Boolean, default: false },
      completedesigncardstep4: { type: Boolean, default: false },
      sharewithworldstep5: { type: Boolean, default: false },
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
    // unique_slug:{type: String, unique: true},
    companyID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "companies_information",
      default: null,
    },
    card_temp: [{type: Object}],
    publish_card_temp: [{type: Object}],
    otptoken: { type: String, default: null },
    personlize_company_name: { type: String, default: "" },
    personlize_primary_office_number: { type: Number, default: null },
    personlize_Website_url: { type: String, default: null },
    personlize_Primary_activities: { type: String, default: null },
    resetPasswordToken: String,
    resetPasswordExpire: Date,


    dealOwner: {
      type: String,
    },
    referrer: {
      type: String,
    },
    referrerName: {
      type: String,
    },
    customerIp: {
      type: String,
    },
    userID: {
      type: Number,
      default: 1,
    },
    Account_status: {
      type: String,
      default: 'is_Activated'
    }
  },
  
  { timestamps: true }
);


userSchema.pre("save", async function (next) {
  // Increment userID only if it's a new document
  if (this.isNew && this.userID) {
    const highestOrder = await this.constructor.findOne({}, {}, { sort: { userID: -1 } });
    this.userID = highestOrder ? highestOrder.userID + 1 : 1;
  }
  next();
});


userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    console.log("ADSFD")
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
  console.log(enteredPassword, this);
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
