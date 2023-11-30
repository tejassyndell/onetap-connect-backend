const mongoose = require("mongoose");

const CouponSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    customPermaLink: {
        type: String,
        // required: true,
    },
    code: {
        type: String,
        unique: true,
        required: true,
    },
    description: {
        type: String,
    },
    discountType: {
        type: String,
        required: true,
    },
    discountAmount: {
        type: Number,
        // required: true,
    },
    planDiscount: [{
        plan_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'otc_plans',
        },
        monthly: {
            usageLimit: {
                type: Number,
                default: null,
            },
            // discountValue: {
            //     type: Number,
            //     default: null,
            // },
            discountedPrice: {
                type: Number,
                default: null,
            },
        },
        yearly: {
            usageLimit: {
                type: Number,
                default: null,
            },
            // discountValue: {
            //     type: Number,
            //     default: null,
            // },
            discountedPrice: {
                type: Number,
                default: null,
            },
        },
    }],
    productDiscount: [{
        product_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'product',
        },
        discountedPrice: {
            type: Number,
            default: null,
        },
        variations: [{
            variation_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'product',
            },
            variationDiscountedPrice: {
                type: Number,
                default: null,
            },
        }],
    },],
    addonDiscount: [{
        addon_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'otc_addons',
        },
        type: {
            type: String,
            default: null,
        },
        price: {
            type: Number,
            default: null,
        },
        value: {
            type: Number,
            default: null,
        },
        monthlyDiscountedPrice: {
            type: Number,
            default: null,
        },
        yearlyDiscountedPrice: {
            type: Number,
            default: null,
        },

    },],
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
        // required: true,
    },
    categories: [String],
    startDate: {
        type: Date,
        default: Date.now,
        validate: {
            validator: function (value) {
                return value <= this.expiryDate;
            },
            message: "Start date must be before or equal to expiry date.",
        },
    },
    expiryDate: {
        type: Date,
        validate: {
            validator: function (value) {
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
    restrictions: {
        allowMultipleCoupons: {
            type: Boolean,
        },
        forClients: {
            type: Boolean,
        },
    },
    plan_restrictions: [{
        plan_id: {
            type: String,
            required: true,
        },
        plan_name: {
            type: String,
            required: true,
        },
    },],
    teamPlanUsage: {
        minUsers: {
            type: Number,
        },
        maxUsers: {
            type: Number,
        },
    }
    ,
    freeShipping: {
        type: Boolean,
        default: false,
    },
    minimumOrderPrice:   {
        type: Number,
    },
    freeShipCountries: [{
        countryName: {
            type: String,
        },
        countryCode: {
            type: String,
        },
    },],
}, { timestamps: true });

CouponSchema.pre("validate", function (next) {
    if (!this.freeShipping) {
        this.minimumOrderPrice = undefined;
        this.freeShipCountries = [];
    }
    next();
});
CouponSchema.pre('save', function (next) {
    if (this.type === 'test') {
        this.price = this.value; 
        this.monthly = undefined; 
        this.yearly = undefined;
    } else if (this.type === 'test1') {
        this.value = undefined; 
    }
    next();
});

const Coupons =
    mongoose.models.otc_coupon || mongoose.model("otc_coupon", CouponSchema);

module.exports = Coupons;