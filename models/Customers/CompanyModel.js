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
      default: null
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
    timezone: { type: String, default: "" },
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
    companyurlslug: {
      type: String,
      default: function () {
        return this.company_name.toLowerCase().replace(/[^a-z0-9-]/g, "");
      },
    },
    address: {
      line1: { type: String, default: null },
      line2: { type: String, default: null },
      city: { type: String, default: null },
      state: { type: String, default: null },
      country: { type: String, default: null },
      postal_code: { type: String, default: null },
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
        permission: { type: Boolean, default: false },
      },
    ],
    booking_link: { type: String, default: null },
    facebook_link: { type: String, default: null },
    linkedin_link: { type: String, default: null },
    additional_colors: [
      {
        name: { type: String, default: null },
        code: { type: String, default: null },
      },
    ],
    company_logo_name: { type: String, default: null },
    logo_alt: { type: String, default: null },
    fav_icon: { type: String, default: null },
    company_video: { type: String, default: null },
    custom_fields_data: [
      {
        value: { type: String, default: null },
        permission: { type: Boolean, default: false },
      },
    ],
    other_links: [
      {
        name: { type: String, default: null },
        link: { type: String, default: null },
        permission: { type: Boolean, default: false },
      },
    ],
    custom_link: { type: String, default: null },
    license: { type: String, default: null },
    booking_link_permission: {
      type: Boolean,
      default: false,
    },
    license_permission: {
      type: Boolean,
      default: false,
    },
    custom_link_permission: {
      type: Boolean,
      default: false,
    },
    logo_alt: { type: String, default: null },
    logopath: { type: String, default: "" },
    fav_icon: { type: String, default: null },
    fav_icon_path: { type: String, default: "" },
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
    default_crm_link: { type: String, default: null },
    default_crm_link_permission: {
      type: Boolean,
      default: false,
    },
    default_connect_msg: { type: String, default: null },
    default_connect_msg_permission: {
      type: Boolean,
      default: false,
    },
    company_url_edit_permission: {
      type: Boolean,
      default: true,
    },
    share_by_text: {
      type: String,
      default:
        "Hi this is {user_name} at {company_name}. Please find below the link to my business card. ",
    },
    share_by_email: {
      type: String,
      default: `Hi! This is {user_name} at {company_name}. Please find below the link to my Digital Business Card on which you'll be able to learn more about me, my company and the services we provide.\nHave a great day!`,
    },
    share_by_socialmedia: {
      type: String,
      default:
        "Hi! This is {user_name} at {company_name}. Please find below the link to my Digital Business Card on which you'll be able to learn more about me, my company and the services we provide. \nHave a great day!",
    },
    reffer_name: {
      type: String,
      default: "",
    },
    refer_by_text: {
      type: String,
      default:
        "I thought you may be interested in {user_name} OneTapConnect card. Click the link below to learn about his company {company_name} and services. ",
    },
    refer_by_email: {
      type: String,
      default: `Hi! {referrer_name} is inviting you to see {user_name} Digital Business Card. Click the link below to learn more about his company {company_name} and services.\n{card URL}\nHave a great day!\nThe OneTapConnect team`,
    },
    refer_by_socialmedia: {
      type: String,
      default:
        "I thought you may be interested in {user_name} OneTapConnect card. Click the link below to learn about his company {company_name} and services. ",
    },
    connect_button_behaviour: {
      type: Boolean,
      default: false,
    },
    user_profile_edit_permission: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("temp_companies_information", CompanySchema);
