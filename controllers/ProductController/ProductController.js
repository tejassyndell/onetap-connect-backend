const catchAsyncErrors = require("../../middleware/catchAsyncErrors.js");
const ErrorHandler = require("../../utils/errorHandler.js");
const Product = require("../../models/NewSchemas/ProductModel.js");
const ProductCategory = require("../../models/NewSchemas/ProductCategoryModel.js");

exports.testAPI = catchAsyncErrors(async (req, res, next) => {
  res.send("called monika");
});

exports.getProducts = catchAsyncErrors(async (req, res, next) => {
  const products = await Product.find();

  if (!products) {
    return next(new ErrorHandler("No Products Found", 404));
  }

  res.status(200).json({
    products,
  });
});

exports.getProductsInfo = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    console.log(req.params)
    const products = await Product.findById(id);
  
    if (!products) {
      return next(new ErrorHandler("No Product Found", 404));
    }
  
    res.status(200).json({
      products,
    });
  });