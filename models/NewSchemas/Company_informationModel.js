const mongoose = require("mongoose");

const Company_information = new mongoose.Schema(
  {
    company_name: {
      type: String,
      required: [true, "Please Enter Your Company Name"],
    },
    contact: { type: Number, default: null },
    fax_number: {
      type: Number,
      // required: [true, "Please Enter The Company fax Number"],
    },
    address: {
      line1: { type: String, default: null },
      line2: { type: String, default: null },
      city: { type: String, default: null },
      state: { type: String, default: null },
      country: { type: String, default: null },
      postal_code: { type: String, default: null },
    },
    global_email: {
      type: String,
      // required: [true, "Please Enter The Company email"],
    },
    industry: { type: String },
    companyurlslug: {
      type: String,
      default: function () {
        return this.company_name.toLowerCase().replace(/[^a-z0-9-]/g, "");
      },
    },
    keywords: [{ type: String }],
    website_url: {
      type: String,
      // required: [true, "Please Enter The Company URL"],
    },
    about: {
      type: String,
      default: null,
    },
    videoAboutUrl: {
      type: String,
      default: null,
    },
    timeZone: { type: String, default: "" },
    booking_links: [
      {
        value: { type: String, default: null },
        permission: { type: Boolean, default: false },
      },
    ],
    other_links: [
      {
        title: { type: String, default: null },
        value: { type: String, default: null },
        permission: { type: Boolean, default: false },
      },
    ],
    custom_fields: [
      {
        title: { type: String, default: null },
        value: { type: String, default: null },
        permission: { type: Boolean, default: false },
      },
    ],
    socialLinks: [
      {
        title: { type: String, default: null },
        value: { type: String, default: null },
        permission: { type: Boolean, default: false },
      },
    ],
    primary_account: {
      type: mongoose.Schema.ObjectId,
      required: true,
      ref: "user",
    },
    primary_billing: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "user",
      },
    ],
    primary_manager: {
      type: mongoose.Schema.ObjectId,
      ref: "user",
    },
    user_profile_edit_permission: {
      type: Boolean,
      default: true,
    },
    company_url_edit_permission: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("companies_information", Company_information);
