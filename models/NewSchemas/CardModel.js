const mongoose = require("mongoose");

const Card_Schema = new mongoose.Schema(
    {
        Name_on_card: {
            type: String,
            required: true,
        },
        cardNumber: {
            type: String,
            required: true,
            unique: true,
            // Validate card number using regex (this is a basic example)
            match: /^[0-9]{16}$/, // Assuming a 16-digit card number format
        },
        expiration_date: {
            type: Date,
            required: true,
        },
        security_code: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ['expired', 'active'],
            default: 'active',
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Card_Schema", Card_Schema);