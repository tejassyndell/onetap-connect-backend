const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
require("dotenv").config();

const guestCustomerSchema = new mongoose.Schema(
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
        last_name: {
            type: String,
        },
        email: {
            type: String,
            unique: true,
            validate: [validator.isEmail, "Please enter valid Email"],
        },
        contact: { type: Number, default: null },
        billing_address: {
            first_name: { type: String, default: null },
            last_name: { type: String, default: null },
            line1: { type: String, default: null },
            line2: { type: String, default: null },
            city: { type: String, default: null },
            state: { type: String, default: null },
            country: { type: String, default: null },
            postal_code: { type: String, default: null },
        },
        shipping_address: [
            {
                first_name: { type: String, default: null },
                last_name: { type: String, default: null },
                line1: { type: String, default: null },
                line2: { type: String, default: null },
                city: { type: String, default: null },
                state: { type: String, default: null },
                country: { type: String, default: null },
                postal_code: { type: String, default: null }
            }],
        card_details: {
            nameOnCard: { type: String },
            cardNumber: { type: Number, required: true },
            cardExpiryMonth: { type: Number },
            cardExpiryYear: { type: Number },
            CVV: { type: String },
            brand: { type: String },
        },
        shipping_method: [{
            type: { type: String },
            price: { type: Number }
          }],
    },
    { timestamps: true }
);

guestCustomerSchema.methods.getJWTToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
};

module.exports = mongoose.model("guestCustomer", guestCustomerSchema);
