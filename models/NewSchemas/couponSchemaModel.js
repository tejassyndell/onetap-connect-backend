const mongoose = require('mongoose');

const coupon_Schema = new mongoose.Schema(
    {
        code: {
            type: String,
            unique: true,
            required: true,
        },
        discountAmount: {
            type: Number,
            required: true,
            min: 0,
        },
        validFrom: {
            type: Date,
            required: true,
        },
        validTo: {
            type: Date,
            required: true,
        },
        assignedUsers: [{
            type: Schema.Types.ObjectId,
            ref: 'user',
        }],
    },
    { timestamps: true }
);

module.exports = mongoose.model('coupon ', coupon_Schema);
