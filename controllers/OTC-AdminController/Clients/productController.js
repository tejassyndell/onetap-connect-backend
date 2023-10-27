const catchAsyncErrors = require("../../../middleware/catchAsyncErrors.js");
const ErrorHandler = require("../../../utils/errorHandler.js");
const User = require("../../../models/NewSchemas/UserModel.js");
const UserInformation = require("../../../models/NewSchemas/users_informationModel.js");
const Product = require('../../../models/NewSchemas/ProductModel.js');
const ProductCategory = require("../../../models/NewSchemas/ProductCategoryModel.js");


exports.createProduct = catchAsyncErrors(async (req, res, next) => {
    const product = Product(req.body); 
    try {
        await product.save();
        res.status(201).json({ success: true, product });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

exports.createProductCategories = catchAsyncErrors(async (req, res, next) => {
    try {
      const { name, isActive, parentCategory, CustomPermalink, description, image, imageName, altText, status, Visibility, activitylog } = req.body;
  
      const newCategory = new ProductCategory({
        name,
        isActive,
        parentCategory,
        CustomPermalink,
        description,
        image, imageName, altText,
        status,
        Visibility,
        activitylog,
      });
      const createdCategory = await newCategory.save();
      res.status(201).json({ category: createdCategory });
    } catch (error) {
      // Handle error
      next(error);
    }
  });

