const mongoose = require("mongoose");

const Cart_Schema = new mongoose.Schema(
    {
        userID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: true,
        },
        products: [
            {
                // Define the structure of each product object in the array
                product: Object,
                quantity: Number,
            },
        ],

    },
    { timestamps: true }
);

module.exports = mongoose.model("Cart", Cart_Schema);