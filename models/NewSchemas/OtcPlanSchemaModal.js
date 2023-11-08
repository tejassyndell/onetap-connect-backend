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
  users: String,
  monthlyPrice_perUser: String,
  monthly_fee: String,
  monthly_sku: String,
  yearlyPrice_perUser: String,
  yearly_fee: String,
  yearly_sku: String
});

const Plan = mongoose.model('otc_plans', planSchema);

module.exports = Plan;
