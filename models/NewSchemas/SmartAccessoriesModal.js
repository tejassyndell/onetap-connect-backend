const mongoose = require("mongoose");

const purchasedSmartAccessory = new mongoose.Schema(
    {

        companyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'company',
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            require: false,
            set: (v) => (v === "" ? null : v),
        },
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "product" },
        variationId: { type: String },
        productName: { type: String },
        subtotal: { type: Number },
        quantity: { type: Number },
        price: { type: Number }, // final price
        status: { type: String, default: 'N/A' },
        uniqueId: { type: String, default: '', }

    },
    { timestamps: true }
);

module.exports = mongoose.model("smart_accessories", purchasedSmartAccessory);
