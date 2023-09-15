const mongoose = require('mongoose');

const refunds_schema = new mongoose.Schema(
    {
        userID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: true,
        },
        order_id: {
            type: Schema.Types.ObjectId,
            ref: 'order',
            required: true,
        },
        refundamount: {
            type: Number,
            required: true,
            min: 0,
        },
        refundreason: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            required: true,
            enum: ['requested', 'approved', 'rejected', 'processed'],
            default: 'requested',
        },
        requestdate: {
            type: Date,
            required: true,
        },
        approvaldate: {
            type: Date,
        },
        processeddate: {
            type: Date,
        },
        adminnotes: {
            type: String,
        },
        paymentmethod: {
            type: String,
            required: true,
        },
        paymentdetails: {
            transaction_id: {
                type: String,
                required: true,
            },
            amount: {
                type: Number,
                required: true,
                min: 0,
            },
            date: {
                type: Date,
                required: true,
            },
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('refunds ', refunds_schema);
