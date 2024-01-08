const mongoose = require('mongoose');
const planSchema = new mongoose.Schema({
  InternalPlanName: String,
  PublicPlanName: String,
  CustomPermalink: String,
  description: String,
  image: String,
  imageName: String,
  altText: String,
  status: {
    type: String,
    default: 'Published', // Set your default status value here
  },
  Visibility: {
    type: String,
    default: 'Public', // Set your default visibility value here
  },
  activitylog: String,
  planType: String,
  users: {type: Number , default: 1},
  monthlyPrice_perUser: Number,
  monthly_fee: Number,
  monthly_sku: String,
  yearlyPrice_perUser: Number,
  yearly_fee: Number,
  yearly_sku: String,
  publishedDate: Date,
  discoutedPercentage: { type : Number, default: 20} ,
  features:{type : String , default:''} ,
  smart_accessories: [{
    type: mongoose.Schema.Types.ObjectId,
    require: false,
    set: (v) => (v === "" ? null : v),
  }],
  add_ons:[ {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'otc_addons',
    require: false,
    set: (v) => (v === "" ? null : v),
  }]
});
const Plan = mongoose.model('otc_plans', planSchema);
module.exports = Plan;
