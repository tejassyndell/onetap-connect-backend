const mongoose = require("mongoose");

const order_Schema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: true,
        },
        company: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'company',
            required: true,
        },
        type: [{ value: { type: String } }],
        smartAccessories: [
            {
                smartAccessoriesId: { type: mongoose.Schema.Types.ObjectId },
                quantity: { type: number },
                amount: { type: number },
            }
        ],
        subscriptionPlan: {
            subscription: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Subscription",
            },
        },
        totalAmount: { type: Number },
        tax: { type: Number },
        paymentStatus: { type: String },
        paymentDate: { type: Date },
        transactionId : {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("order", order_Schema);  