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
    status: { type: String , default:'Published'},
    image: { type: String , default:""},
    imagename: { type: String },
    imagealttaxt: { type: String },
    publishedBy: {
      type: String,
    },
    visibility: {
      type: String,
      default:'Public'
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
    paymentType: {
      type: String,
    },
    Addonspaymentdata: {
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
      numofuser: { type: String, when: "isuserbased" },
      yearlyuserprice: { type: String, when: "isuserbased" },
      monthlyuserprice: { type: String, when: "isuserbased" },
      sku: {
        type: String,
        unique: true,
        sparse: true,
      },
      price: { type: String },
    },
    
  },
  { timestamps: true }
);


// // Define the sub-schemas for 'subscription' and 'One time payment'
// const subscriptionSchema = new mongoose.Schema({
//   yearlysku: {
//     type: String,
//     unique: true,
//     sparse: true,
//   },
//   yearlyprice: { type: String },
//   monthlyprice: { type: String },
//   monthlysku: {
//     type: String,
//     unique: true,
//     sparse: true,
//   },
//   isuserbased: { type: Boolean },
//   numofuser: { type: String, when: "isuserbased" }, // Add this field conditionally
//   yearlyuserprice: { type: String, when: "isuserbased" }, // Add this field conditionally
//   monthlyuserprice: { type: String, when: "isuserbased" }, // Add this field conditionally
// });

// const oneTimePaymentSchema = new mongoose.Schema({
//   sku: {
//     type: String,
//     unique: true,
//     sparse: true,
//   },
//   price: { type: String },
// });

// Adminaddonsschema.methods.getAddonspaymentdata = function() {
//   if (this.paymentType === "subscription") {
//     console.log("first===============================================================")
//     return this.Addonspaymentdata = subscriptionSchema;
//   } else if (this.paymentType === "onetimepayment") {
//     return this.Addonspaymentdata = oneTimePaymentSchema;
//   }
//   // Handle other cases or errors as needed
// };



module.exports = mongoose.model("Adminaddons", Adminaddonsschema);
