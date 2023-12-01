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
    // default:""
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
