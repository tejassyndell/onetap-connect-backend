const mongoose = require("mongoose");

const Adminaddonsschema = new mongoose.Schema(
  {
    internalname: {
      type: String,
      required: true,
    },
    publicname: {
      type: String,
      required: true,
    },
    status: { type: String, default: "Published" },
    image: { type: String, default: "" },
    imagename: { type: String },
    imagealttaxt: { type: String },
    publishedBy: {
      type: String,
    },
    visibility: {
      type: String,
      default: "Public",
    },
    CustomPermalink: {
      type: String,
    },
    activityLog: {
      type: String,
    },
    shortDescription: {
      type: String,
    },
    longdescription: {
      type: String,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "otc_categories", // Assuming you have a "productCategories" collection
    },
    paymentType: {
      type: String,
    },
    Addonspaymentdata: {
      yearlysku: {
        type: String,
        unique: true,
        sparse: true,
      },
      yearlyprice: { type: Number },
      monthlyprice: { type: Number },
      monthlysku: {
        type: String,
        unique: true,
        sparse: true,
      },
      isuserbased: { type: Boolean },
      numofuser: { type: Number, when: "isuserbased" },
      yearlyuserprice: { type: Number, when: "isuserbased" },
      monthlyuserprice: { type: Number, when: "isuserbased" },
      sku: {
        type: String,
        unique: true,
        sparse: true,
      },
      price: { type: Number },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("otc_addons", Adminaddonsschema);
