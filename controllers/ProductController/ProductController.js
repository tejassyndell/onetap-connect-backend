const catchAsyncErrors = require("../../middleware/catchAsyncErrors.js");
const ErrorHandler = require("../../utils/errorHandler.js");
const Product = require("../../models/NewSchemas/ProductModel.js");
const ProductCategory = require("../../models/NewSchemas/ProductCategoryModel.js");
const cart = require("../../models/NewSchemas/cartModel.js");

exports.testAPI = catchAsyncErrors(async (req, res, next) => {
  res.send("called monika");
});

exports.getProducts = catchAsyncErrors(async (req, res, next) => {
  const products = await Product.find();

  if (!products) {
    return next(new ErrorHandler("No Products Found.....", 404));
  }

  res.status(200).json({
    products,
  });
});

exports.getProductsInfo = catchAsyncErrors(async (req, res, next) => {
  const { name } = req.params; // Get the name parameter from the URL
  const productName = name.replace(/-/g, ' '); // Replace hyphens with spaces

  const products = await Product.findOne({ name: productName }); // Find the product by name

  if (!products) {
    return next(new ErrorHandler("No Product Found", 404));
  }
  res.status(200).json({
    products,
  });
});

exports.getCartProducts = catchAsyncErrors(async (req, res, next) => {
  const Cartproducts = await cart.find();
  if (!Cartproducts) {
    return next(new ErrorHandler("No cart Found", 404));
  }
  res.status(200).json({
    Cartproducts,
  });
});

exports.updateCartProducts = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.user; // Assuming you want to associate the cart with the user ID

  // Extract data from the request body (assuming you're sending data in the request body)
  const { productId, quantity } = req.body;

  try {
    // Check if a cart exists for the user ID
    let userCart = await cart.findOne({ userID: id });

    // If no cart exists for the user, create a new cart
    if (!userCart) {
      userCart = new cart({
        userID: id,
        products: [],
      });
    }

    // Check if the product is already in the cart
    const existingCartItemIndex = userCart.products.findIndex((item) => item.product._id == productId);

    if (existingCartItemIndex !== -1) {
      // If the product is already in the cart, update the quantity
      userCart.products[existingCartItemIndex].quantity += quantity;
    } else {
      // If the product is not in the cart, add it as a new item
      userCart.products.push({
        product: productId, // You can store the product ID here
        quantity: quantity,
      });
    }

    // Save the updated cart
    await userCart.save();

    res.status(200).json({
      message: "Cart updated successfully",
    });
  } catch (error) {
    return next(new ErrorHandler("Failed to update cart", 500));
  }
});


