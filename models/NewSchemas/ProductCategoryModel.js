const mongoose = require("mongoose");

const productCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    // required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  // parentCategory:{
  //   type: String,
  // },
  parentCategory:{
    type: mongoose.Schema.Types.ObjectId,
    require: false,
    set: (v) => (v === "" ? null : v),
  },
  CustomPermalink: {
    type: String,
  },
  description: {
    type: String,
  },
  image: {
      type: String, 
      // default:""
    },
  
  imageName: { type: String} ,
  altText: { type: String },
status: {type: String},
Visibility: {type: String},
publishedDate: {type: Date},
activitylog: {type: String}

}, { timestamps: true });

module.exports = mongoose.model("Product_Categories", productCategorySchema);
