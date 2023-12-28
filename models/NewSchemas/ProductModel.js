const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    status: { type: String },
    image: [{
      url: String,
      alt: String,
      name: String
    }],
    media: [{ type: String }],
    sku: {
      type: String,
      unique: true,
      sparse: true,
    },
    stockStatus: {
      type: String,
      enum: ["In Stock", "Backorder", null], // You can customize the options
      // required: true,
    },
    quantity: {
      type: Number,
      default: 0,
    },
    inventory: { type: String },
    shippingDate: { type: String },
    height: {
      type: Number,
    },
    width: {
      type: Number,
    },
    length: {
      type: Number,
    },
    weight: {
      type: Number,
    },
    unit: { type: String, default: 'oz' },
    price: {
      type: Number,
      // required: true,
    },
    saleprice: {
      type: Number,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "otc_categories", // Assuming you have a "productCategories" collection
    },
    Tags: {
      type: [String],
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isOnSale: {
      type: Boolean,
      default: false,
    },
    publishedBy: {
      type: String,
    },
    visibility: {
      type: String,
    },
    activityLog: {
      type: String,
    },
    LinkedCoupons: {
      type: [String],
    },
    CustomPermalink: {
      type: String,
    },
    producttype: {
      type: String,
      enum: ["Simple", "Variation", "Dow", null], // Add more options if needed
    },
    hasVariations: {
      type: Boolean,
    },
    shortDescription: {
      type: String,
    },
    description: {
      type: String,
    },
    CompatibilityInformation: {
      type: String,
    },
    ShippingAndReturnInformation: {
      type: String,
    },
    variations: [
      {

        Type: {
          type: String,
          required: true,
        },
        image: [{
          url: String,
          alt: String,
          name: String
        }],
        stockStatus: {
          type: String,
          enum: ["In Stock", "Backorder", null], // You can customize the options
          // required: true,
        },
        sku: {
          type: String,
          required: true,
          unique: true,
        },
        quantity: {
          type: Number,
        },
        price: {
          type: Number,
          required: true,
        },
        saleprice: {
          type: Number,
        },
        LinkedCoupons: [
          {
            type: String, // Assuming coupon codes are stored as strings
          },
        ],
        shortDescription: {
          type: String,
        },
        description: {
          type: String,
        },
        inventory: { type: String },
        shippingDate: { type: String },
        height: {
          type: Number,
        },
        width: {
          type: Number,
        },
        length: {
          type: Number,
        },
        weight: {
          type: Number,
        },
        unit: { type: String, default: 'oz' },
        CustomPermalink: {
          type: String,
        },
        prefix: { type: String },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    prefix: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("product", productSchema);
