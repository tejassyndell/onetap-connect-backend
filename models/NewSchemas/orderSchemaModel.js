const mongoose = require("mongoose");

const order_Schema = new mongoose.Schema(
  {

    orderNumber: {
      type: Number,
      default: 1,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      default: null,
    },
    isGuest: {
      type: Boolean,
      default: false,
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
    contact: { type: Number, default: null },
    status: {
      type: String,
      default: "On Hold"
    },
    fulfillment: {
      type: String,
      default: "In Progress"
    },
    addOnStatus: String,
    addOnsNote: String,
    addOnsActivityLog: String,
    shippingNotes: {
      type: String,
      default: ""
    },
    customPrintingNotes: {
      type: String,
      default: ""
    },
    orderNotes: {
      type: String,
      default: ""
    },
    activityLog: {
      type: String,
      default: ""
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "companies_information",
      default: null,
    },
    type: { type: String },
    smartAccessories: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "product" },
        variationId: { type: String },
        subtotal: { type: Number },
        quantity: { type: Number },
        price: { type: Number }, // final price
        status: { type: String, default: 'N/A' },

      },
    ],
    addaddons: [
      {
        addonId: { type: mongoose.Schema.Types.ObjectId, ref: "otc_addons" },
        status: { type: String, default: 'N/A' },
        assignTo: { type: String, default: '' },
        price: { type: Number, default: 0 },
        addonDiscountPrice: { type: Number, default: 0 }
      },
    ],
    addusers:
    {
      addusercount: { type: Number },
      status: { type: String, default: 'N/A' },
      price: { type: Number },
      plan: { type: String },
      billing_cycle: { type: String },
    },
    subscription_details: {
      planID: { type: mongoose.Schema.Types.ObjectId, ref: "otc_plans" },
      discountedPrice: { type: Number },
      addOnsWithPlan: [],  // addon included in plan
      smartAccessoriesWithPlan: [], // products included in plan
      addones: [
        {
          addonId: { type: mongoose.Schema.Types.ObjectId, ref: "otc_addons" },
          status: { type: String, default: 'N/A' },
          assignTo: { type: String, default: '' },
          price: { type: Number, default: 0 }
        }
      ],
      // addones: [{ type: mongoose.Schema.Types.ObjectId , ref: "otc_addons"}],
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
      InitialSetupFee: { type: Number, default: 0 },
      perUserDiscountPrice: { type: Number, default: '' },
      perUser_price: { type: Number, default: 0 },
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
    isCouponUsed: { type: Boolean, default: false },
    coupons: {
      code: { type: String, default: null },
      value: { type: Number, default: null }
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
    shipping_method: [{
      type: { type: String },
      price: { type: Number }
    }],
    tracking_number: { type: String },
    sumTotalWeights: { type: String },
    discount: { type: Number }, //when admin creates order, special discount on order is given (subtract this amount from total)
  },
  { timestamps: true }
);

//middleware to autoincrement value
order_Schema.pre("save", async function (next) {
  console.log("Middleware called");
  if (this.orderNumber) {
    const highestOrder = await this.constructor.findOne({}, {}, { sort: { orderNumber: -1 } });
    this.orderNumber = highestOrder ? highestOrder.orderNumber + 1 : 1;
  }
  next();
});

module.exports = mongoose.model("order", order_Schema);
