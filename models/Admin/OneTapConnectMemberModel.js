const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { title } = require("process");
require('dotenv').config();
const oneTapConnectMemberSchema = new mongoose.Schema({
    first_name: {
        type: String,
        required: [true, "Please Enter Your Name"],
    },
    last_name: {
        type: String,
        required: [true, "Please Enter Your Name"],
    },
    email: {
        type: String,
        required: [true, "Please Enter Your Email"],
        unique: true,
        validate: [validator.isEmail, "Please enter valid Email"],
    },
    password: {
        type: String,
        required: [true, "Please Enter Your Password"],
        minLength: [8, "Minimum 8 character"],
        select: false,
    },
    contact: { type: Number, default: null },
    billing_address: {
        line1: { type: String, default: null },
        line2: { type: String, default: null },
        city: { type: String, default: null },
        state: { type: String, default: null },
        country: { type: String, default: null },
        postal_code: { type: Number, default: null }
    },
    shipping_address: {
        line1: { type: String, default: null },
        line2: { type: String, default: null },
        city: { type: String, default: null },
        state: { type: String, default: null },
        country: { type: String, default: null },
        postal_code: { type: Number, default: null }
    },
    avatar: { type: String },
    designation: {type:String} ,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
}, { timestamps: true });
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next();
    }
    this.password = await bcrypt.hash(this.password, 10);
});
// JWT Token
userSchema.methods.getJWTToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
};
// compare Password
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};
//generatinjg password reset token
userSchema.methods.getResetPasswordToken = function () {
    //generating token
    const resetToken = crypto.randomBytes(20).toString("hex");
    // hashing and adding to user schema
    this.resetPasswordToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
    this.resetPasswordExpire = Date.now() + 15 * 60 * 60 * 1000;
    return resetToken;
};
module.exports = mongoose.model("oneTapConnectMembers", userSchema);