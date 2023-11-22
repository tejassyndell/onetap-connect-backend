const mongoose = require("mongoose");

const CouponSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    code: {
        type: String,
        unique: true,
        required: true,
    },
    description: {
        type: String,
    },
    type: {
        type: String,
        required: true,
    },
    planDiscount: [{
        plan_id: {
            type: String,
            default: null,
        },
        usageLimit: {
            type: Number,
            default: null,
        },
        discountValue: {
            type: Number,
            default: null,
        },
        discountedPrice: {
            type: Number,
            default: null,
        },
    }, ],
    productDiscount: [{
        product_id: {
            type: String,
            default: null,
        },
        discountValue: {
            type: Number,
            default: null,
        },
        discountedPrice: {
            type: Number,
            default: null,
        },
    }, ],
    addonesDiscount: [{
        addone_id: {
            type: String,
            default: null,
        },
        discountValue: {
            type: Number,
            default: null,
        },
        discountedPrice: {
            type: Number,
            default: null,
        },
    }, ],
    status: {
        type: String,
        required: true,
    },
    visibility: {
        type: String,
        required: true,
    },
    publishedBy: {
        type: String,
        required: true,
    },
    categories: [String],
    startDate: {
        type: Date,
        default: Date.now,
        validate: {
            validator: function(value) {
                return value <= this.expiryDate;
            },
            message: "Start date must be before or equal to expiry date.",
        },
    },
    expiryDate: {
        type: Date,
        validate: {
            validator: function(value) {
                return value >= this.startDate;
            },
            message: "Expiry date must be after or equal to start date.",
        },
    },
    usageLimit: {
        type: Number,
    },
    usageLimitPerUser: {
        type: Number,
    },
    autoApply: {
        type: Boolean,
    },
    restrictions: [{
        allowMultipleCoupons: {
            type: Boolean,
        },
        forClients: {
            type: Boolean,
        },
    }, ],
    plan_restrictions: [{
        plan_id: {
            type: Number,
            required: true,
        },
        plan_name: {
            type: Number,
            required: true,
        },
    }, ],
    teamPlanUsage: [
        (minUsers = {
            type: Number,
        }),
        (maxUsers = {
            type: Number,
        }),
    ],
    freeShipping: {
        type: Boolean,
        default: false,
    },
    minimumOrderPrice: {
        type: Number,
    },
    freeShipCountries: [{
        countryName: {
            type: String,
        },
        countryCode: {
            type: String,
        },
    }, ],
});

CouponSchema.pre("validate", function(next) {
    if (!this.freeShipping) {
        this.minimumOrderPrice = undefined;
        this.freeShipCountries = [];
    }
    next();
});

const Coupons =
    mongoose.models.otc_coupon || mongoose.model("otc_coupon", CouponSchema);

module.exports = Coupons;