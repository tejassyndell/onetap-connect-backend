const mongoose = require("mongoose");

const order_Schema = new mongoose.Schema(
  {
    user: {
      type: String,
    },
    first_name: {
      type: String,
    },
    last_name: {
      type: String,
    },
    email: {
      type: String,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "companies_information",
    },
    type: { type: String },
    smartAccessories: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "product" },
        variationId: { type: String },
        subtotal: { type: Number },
        quantity: { type: Number },
        price: { type: Number },
      },
    ],
    subscription_details: {
      addones: [{ type: mongoose.Schema.Types.ObjectId }],
      userCount: { type: Number },
      total_amount: { type: Number },
      billing_cycle: { type: String },
      plan: { type: String, default: null },
      total_user: [
        {
          baseUser: { type: Number },
          additionalUser: { type: Number },
        },
      ],
      recurring_amount: { type: Number },
      renewal_date: { type: Date },
      auto_renewal: { type: Boolean, default: true },
      taxRate: { type: String },
    },
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
    transactionId: {
      type: String,
    },
    shippingAddress: [
      {
        address_name: { type: String, default: "Default" },
        first_name: { type: String, default: null },
        last_name: { type: String, default: null },
        company_name: { type: String, default: null },
        line1: { type: String, default: null },
        line2: { type: String, default: null },
        city: { type: String, default: null },
        state: { type: String, default: null },
        country: { type: String, default: null },
        postal_code: { type: String, default: null },
      },
    ],
    billingAddress: [
      {
        address_name: { type: String, default: "Default" },
        first_name: { type: String, default: null },
        last_name: { type: String, default: null },
        company_name: { type: String, default: null },
        line1: { type: String, default: null },
        line2: { type: String, default: null },
        city: { type: String, default: null },
        state: { type: String, default: null },
        country: { type: String, default: null },
        postal_code: { type: String, default: null },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("order", order_Schema);
