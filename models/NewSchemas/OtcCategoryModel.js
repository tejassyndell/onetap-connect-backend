const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    // required: true,
  },
  categoryType: { type: String },
  // isActive: {
  //   type: Boolean,
  //   default: true,
  // },
  // parentCategory:{
  //   type: String,
  // },
  // parentCategory:{
  //   type: mongoose.Schema.Types.ObjectId,
  //   require: false,
  //   set: (v) => (v === "" ? null : v),
  // },
  CustomPermalink: {
    type: String,
  },
  description: {
    type: String,
  },
  categoryType: {
    type: String,
  },
  image: {
    type: String,
    // default:""
  },

  imageName: { type: String },
  altText: { type: String },
  status: {
    type: String,
    default: 'Published', // Set your default status value here
  },
  Visibility: {
    type: String,
    default: 'Public', // Set your default visibility value here
  },
  publishedDate: { type: Date },
  activitylog: { type: String }

}, { timestamps: true });

module.exports = mongoose.model("otc_categories", categorySchema);
