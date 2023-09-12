const mongoose = require("mongoose");

const user_shipping_addresses = new mongoose.Schema(
    {
        userId : {
            type: mongoose.Types.ObjectId,
            ref: 'user',
            required: true,
        },
          shipping_address: [
            {
              first_name:{ type: String, default: null },
              last_name:{ type: String, default: null },
              company_name:{ type: String, default: null },
              line1: { type: String, default: null },
              line2: { type: String, default: null },
              city: { type: String, default: null },
              state: { type: String, default: null },
              country: { type: String, default: null },
              postal_code: { type: String, default: null }
          }],
    },
    { timestamps: true }
);

module.exports = mongoose.model("user_shipping_addresses", user_shipping_addresses);