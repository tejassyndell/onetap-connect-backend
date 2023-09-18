const mongoose = require("mongoose");

const Card_Schema = new mongoose.Schema(
    {
        nameOnCard: {
            type: String,
          },
          cardNumber: {
            type: Number,
            required: true,
          },
          cardExpiryMonth: {
            type: Number,
          },
          cardExpiryYear: {
            type: Number,
          },
          CVV: {
            type: String,
          },
          brand:{
            type: String,
          },
          status: {
            type: String,
            enum: ['expired', 'active','primary'],
            default: 'active',
          },
          userID: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Card_Schema", Card_Schema);