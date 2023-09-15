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
    booking_link: { type: String, default: null },
    other_links: [
        {
            name: { type: String, default: null },
            link: { type: String, default: null },
            permission: { type: Boolean, default: false },
        },
    ],
    custom_fields: [
        {
            name: { type: String, default: null },
            value: { type: String, default: null },
            permission: { type: Boolean, default: false },
        },
    ],
    socialLinks: [
        {
            icon: { type: String, default: null },
            name: { type: String, default: null },
            link: { type: String, default: null },
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
    company_logo_name: { type: String, default: null },
    logo_alt: { type: String, default: null },
    logopath: { type: String, default: "" },
    fav_icon: { type: String, default: null },
    fav_icon_path: { type: String, default: "" },
    additional_colors: [
        {
          name: { type: String, default: null },
          code: { type: String, default: null },
        },
      ],
    company_name_permission: {
        type: Boolean,
        default: false,
      },
    website_url_permission: {
        type: Boolean,
        default: false,
      },
      global_email_address_permission: {
        type: Boolean,
        default: false,
      },
      primary_office_number_permission: {
        type: Boolean,
        default: false,
      },
      fax_number_permission: {
        type: Boolean,
        default: false,
      },
      primary_activities_permission: {
        type: Boolean,
        default: false,
      },
      booking_link_permission: {
        type: Boolean,
        default: false,
      },
      make_private_permission: {
        type: Boolean,
        default: false,
      },
      company_line1_address_permission: {
        type: Boolean,
        default: false,
      },
      company_line2_apartment_permission: {
        type: Boolean,
        default: false,
      },
      company_city_permission: {
        type: Boolean,
        default: false,
      },
      company_state_permission: {
        type: Boolean,
        default: false,
      },
      company_postal_code_permission: {
        type: Boolean,
        default: false,
      },
  },
  { timestamps: true }
);

module.exports = mongoose.model("companies_information", Company_information);
