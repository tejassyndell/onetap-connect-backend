const mongoose = require("mongoose");

const user_billing_address = new mongoose.Schema(
    {
        userId : {
            type: mongoose.Types.ObjectId,
            ref: 'user',
            required: true,
        },
          billing_address: {
            line1: { type: String, default: null },
            line2: { type: String, default: null },
            city: { type: String, default: null },
            state: { type: String, default: null },
            country: { type: String, default: null },
            postal_code: { type: String, default: null },
          },
    },
    { timestamps: true }
);

module.exports = mongoose.model("user_billing_address", user_billing_address);