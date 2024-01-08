const mongoose = require("mongoose");
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
  },
  categoryType: { type: String },
  CustomPermalink: {
    type: String,
    default : ''
  },
  description: {
    type: String,
    default : ''
  },
  categoryType: {
    type: String,
  },
  image: {
    type: String,
    default : ''
  },
  imageName: { type: String, default : '' },
  altText: { type: String, default : '' },
  status: {
    type: String,
    default: 'Published', // Set your default status value here
  },
  Visibility: {
    type: String,
    default: 'Public', // Set your default visibility value here
  },
  publishedDate: { type: Date, default : Date.now() },
  activitylog: { type: String, default : '' }
}, { timestamps: true });
module.exports = mongoose.model("otc_categories", categorySchema);
