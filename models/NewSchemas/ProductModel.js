const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    image: [
      {
        type: String, // Assuming each image is stored as a URL
      },
    ],
    sku: {
      type: String,
      unique: true,
      required: true,
    },
    isstock: {
      type: String,
      enum: ["In Stock", "Out of Stock"], // You can customize the options
      required: true,
    },
    quantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: true,
    },
    saleprice: {
      type: Number,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductCategory", // Assuming you have a "productCategories" collection
    },
    Description: {
      type: [String],
    },
    Tags: {
      type: [String],
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    LinkedCoupons: {
      type: [String],
    },
    CustomPermalink: {
      type: String,
    },
    producttype: {
      type: String,
      enum: ["Simple product", "Variations Products", "Dow"], // Add more options if needed
    },
    hasVariations: {
      type: Boolean,
    },
    shortDescription: {
      tagline: String,
      shortdescription: String
    },
    description: {
      type: String,
    },
    variations: [
      {
       
        Type: {
          type: String,
          required: true,
        },
        Image: [
          {
            type: String, // Assuming each image is stored as a URL
          },
        ],
        isstock: {
          type: String,
          enum: ["In Stock", "Out of Stock"], // You can customize the options
          required: true,
        },
        Sku: {
          type: String,
          required: true,
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
          tagline: String,
          shortdescription: String
        },
        description: {
          type: String,
        },
        CustomPermalink: {
          type: String,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("product", productSchema);
