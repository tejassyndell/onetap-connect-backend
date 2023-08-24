const mongoose = require("mongoose");

const CompanySchema = new mongoose.Schema(
  {
    company_name: {
      type: String,
      required: [true, "Please Enter Your Company Name"],
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
    primary_billing: [{
        type: mongoose.Schema.ObjectId,
        ref: "user",
    }],
    global_email : {tyep:String},
    contact: { 
        type: Number, 
        default: null, 
        maxLength: [30, "Contact must be 10 digits"], 
        minLength: [10, "Contact must be 10 digits"] 
    },
    fax_number: {
      type: Number,
      default: null,
      maxLength: [30, "Fax Number must be 10 digits"],
      minLength: [10, "Fax number must be 10 digits"],
    },
    address : {
        line1: { type: String, default: null },
        line2: { type: String, default: null },
        city: { type: String, default: null },
        state: { type: String, default: null },
        country: { type: String, default: null },
        postal_code: { type: Number, default: null }
      },
    company_website: { type: String },
    team_size: { type: String },
    total_members: { type: Number },
    teams: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("companies_information", CompanySchema);
