const mongoose = require("mongoose");

const users_information = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    company_ID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "companies_information",
    },
    team: { type: mongoose.Schema.Types.ObjectId },
    company_name: {
      type: String,
    },
    website_url: {
      type: String,
      default: "",
    },
    global_email: {
      type: String,
    },
    cardEditorData: [
      {
        type: String,
        default: null,
      },
    ],
    primary_office_num: {
      type: Number,
      default: "",
    },
    fax_number: {
      type: Number,
    },
    address: {
      line1: { type: String, default: null },
      line2: { type: String, default: null },
      city: { type: String, default: null },
      state: { type: String, default: null },
      country: { type: String, default: null },
      postal_code: { type: String, default: null },
    },
    aboutUser: {
      type: String,
      default: "",
    },
    useraboutvideo: {
      type: String,
      default: "",
    },
    business_email: {
      type: String,
    },
    booking_links: {
      type: String,
      default: "",
    },
    keywords: { type: String },
    social_media: [
      {
        name: { type: String, default: null },
        link: { type: String, default: null },
      },
    ],
    other_links: [
      {
        icon: { type: String, default: "" },
        name: { type: String, default: "" },
        link: { type: String, default: "" },
      },
    ],
    custom_fields: [
      {
        name: { type: String, default: null },
        value: { type: String, default: null },
      },
    ],
    shipping_method: [
      {
        type: { type: String },
        price: { type: Number },
      },
    ],
    smartAccessories: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "product" },
        variationId: { type: String },
        subtotal: { type: Number },
        quantity: { type: Number },
        price: { type: Number }, // final price
        status: { type: String, default: "N/A" },
      },
    ],
    subscription_details: {
      planID: { type: mongoose.Schema.Types.ObjectId, ref: "otc_plans" },
      subscription_id: { type: String, default: null },
      customer_id: { type: String, default: null },
      addones: [
        {
          addonId: { type: mongoose.Schema.Types.ObjectId, ref: "otc_addons" },
          status: { type: String, default: "N/A" },
          assignTo: { type: String, default: "" },
          price: { type: Number, default: 0 },
          addonDiscountPrice: { type: Number, default: 0 },
        },
      ],
      userCount: { type: Number },
      total_amount: { type: Number },
      creditBalance: { type: Number, default: null },
      billing_cycle: { type: String },
      endDate: { type: Number, default: null },
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
      taxRate: { type: String, default: "0" },
    },

    isInitailUser: { type: Boolean, default: true },

    connect_button_behaviour: {
      type: Boolean,
      default: false,
    },
    default_crm_link: {
      value: {
        type: String,
        default: null,
      },
      permission: {
        type: Boolean,
        default: false,
      },
    },
    userProfile_edit_permission: {
      type: Boolean,
      default: true,
    },
    default_connect_msg: {
      value: {
        type: String,
        default:
          "Hi there, it’s {user_name}. Please click the link below so we can share contact info. Talk soon!",
      },
      permission: {
        type: Boolean,
        default: false,
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("users_information", users_information);
