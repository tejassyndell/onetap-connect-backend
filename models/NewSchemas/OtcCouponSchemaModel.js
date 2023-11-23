const mongoose = require('mongoose');

const coupon_Schema = new mongoose.Schema(
    {
        name: { type: String },
        couponType: { type: String },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "otc_categories", // Assuming you have a "productCategories" collection
          },
        status: { type: String, default: 'Published' },
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
        // assignedUsers: [{
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref: 'user',
        // }],
    },
    { timestamps: true }
);

module.exports = mongoose.model('otc_coupons ', coupon_Schema);
