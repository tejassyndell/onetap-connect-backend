const mongoose = require('mongoose');
const user_subscription = new mongoose.Schema(
    {
        userID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: true,
        },
        companyID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'company',
            required: true,
        },
        addons: [
            {
                title: { type: String, default: null },
                name: { type: String, default: null },
            },
        ],
        total_user: { type: Number },
        planID: { type: mongoose.Schema.ObjectId },
        paymentID: { type: mongoose.Schema.ObjectId },
    },
    { timestamps: true }
);
module.exports = mongoose.model('user_subscription ', user_subscription);
