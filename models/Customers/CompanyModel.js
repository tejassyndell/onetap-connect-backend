const mongoose = require("mongoose");

const CompanySchema = new mongoose.Schema(
  {
    company_name: {
      type: String,
      required: [true, "Please Enter Your Company Name"],
    },
    company_name_permission: {
      type: Boolean,
      default: true,
    },
    industry: { type: String },
    about: {
      type: String,
      default: null,
    },
    // slug:{type:String},
    primary_account: {
      type: mongoose.Schema.ObjectId,
      ref: "user",
      required: true,
    },
    primary_manager: {
      type: mongoose.Schema.ObjectId,
      ref: "user",
    },
    primary_billing: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "user",
      },
    ],
    global_email: { type: String },
    keywords: { type: String },
    contact: {
      type: Number,
      default: null,
      maxLength: [30, "Contact must be 10 digits"],
      minLength: [10, "Contact must be 10 digits"],
    },
    fax_number: {
      type: Number,
      default: null,
      maxLength: [30, "Fax Number must be 10 digits"],
      minLength: [10, "Fax number must be 10 digits"],
    },
    address: {
      line1: { type: String, default: null },
      line2: { type: String, default: null },
      city: { type: String, default: null },
      state: { type: String, default: null },
      country: { type: String, default: null },
      postal_code: { type: Number, default: null },
    },
    company_website: { type: String },
    team_size: { type: String },
    total_members: { type: Number },
    teams: [{ type: String }],
    social_media: [
      {
        icon: { type: String, default: null },
        name: { type: String, default: null },
        link: { type: String, default: null },
      },
    ],
    booking_link: { type: String, default: null },
    additional_colors: [
      {
        name: { type: String, default: null },
        code: { type: String, default: null },
      },
    ],
    company_logo_name: { type: String, default: null },
    logo_alt:{ type: String, default: null },
    fav_icon: { type: String, default: null },
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
    make_private_permission: {
      type: Boolean,
      default: false,
    },
    address_permission: {
      type: Boolean,
      default: false,
    },
    apartment_permission: {
      type: Boolean,
      default: false,
    },
    city_permission: {
      type: Boolean,
      default: false,
    },
    state_permission: {
      type: Boolean,
      default: false,
    },
    postal_code_permission: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("companies_information", CompanySchema);
