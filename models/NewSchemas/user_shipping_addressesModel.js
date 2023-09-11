const mongoose = require("mongoose");

const user_shipping_addresses = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: true,
        },
        shipping_address: {
            line1: { type: String, default: null },
            line2: { type: String, default: null },
            city: { type: String, default: null },
            state: { type: String, default: null },
            country: { type: String, default: null },
            postal_code: { type: Number, default: null }
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("user_shipping_addresses", user_shipping_addresses);