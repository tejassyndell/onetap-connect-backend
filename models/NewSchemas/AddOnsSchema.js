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
    status: { type: String },
    image: { type: String },
    imagename: { type: String },
    imagealttaxt: { type: String },
    publishedBy: {
      type: String,
    },
    visibility: {
      type: String,
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
    Addonspaymenttype: {
      paymentType: {
        type: String,
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Adminaddons", Adminaddonsschema);
// Define the sub-schemas for 'subscription' and 'One time payment'
const subscriptionSchema = new mongoose.Schema({
  yearlysku: {
    type: String,
    unique: true,
    sparse: true,
  },
  yearlyprice: { type: String },
  monthlyprice: { type: String },
  monthlysku: {
    type: String,
    unique: true,
    sparse: true,
  },
  isuserbased: { type: Boolean },
  numofuser: { type: String, when: "isuserbased" }, // Add this field conditionally
  yearlyuserprice: { type: String, when: "isuserbased" }, // Add this field conditionally
  monthlyuserprice: { type: String, when: "isuserbased" }, // Add this field conditionally
});

const oneTimePaymentSchema = new mongoose.Schema({
  sku: {
    type: String,
    unique: true,
    sparse: true,
  },
  price: { type: String },
});

Adminaddonsschema.path("Addonspaymenttype.paymentType").validate(function (
  value
) {
  if (value === "subscription") {
    return this.Addonspaymenttype instanceof mongoose.Types.Embedded
      ? this.Addonspaymenttype.constructor === subscriptionSchema
      : false;
  } else if (value === "One time payment") {
    return this.Addonspaymenttype instanceof mongoose.Types.Embedded
      ? this.Addonspaymenttype.constructor === oneTimePaymentSchema
      : false;
  }
  return false;
},
"Invalid Addonspaymenttype schema");
