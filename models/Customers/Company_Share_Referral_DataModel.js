const mongoose = require("mongoose");

const Company_Share_ReferralSchema = new mongoose.Schema(
  {
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
    reffer_name: {
      type: String,
      default: null,
    },
    companyID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "company",
      required: true,
    },
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

module.exports = mongoose.model(
  "companies_share_referral_data",
  Company_Share_ReferralSchema
);
