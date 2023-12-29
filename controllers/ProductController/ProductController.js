const catchAsyncErrors = require("../../middleware/catchAsyncErrors.js");
const ErrorHandler = require("../../utils/errorHandler.js");
const Product = require("../../models/NewSchemas/ProductModel.js");
const cart = require("../../models/NewSchemas/cartModel.js");

exports.getProducts = catchAsyncErrors(async (req, res, next) => {
  const products = await Product.find().populate("category", "name");

  if (!products) {
    return next(new ErrorHandler("No Products Found.....", 404));
  }

  res.status(200).json({
    products,
  });
});

exports.getProductsInfo = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const products = await Product.findById(id); // Find the product by id

  if (!products) {
    return next(new ErrorHandler("No Product Found", 404));
  }
  res.status(200).json({
    products,
  });
});

exports.getCartProducts = catchAsyncErrors(async (req, res, next) => {
  const { _id } = req.body.user;
  const userId = _id;
  const userCart = await cart.findOne({ userID: userId });

  if (!userCart) {
    return next(new ErrorHandler("No cart found for the user", 404));
  }

  res.status(200).json({
    Cartproducts: userCart.products,
  });
});

exports.updateCartProducts = catchAsyncErrors(async (req, res, next) => {
  const userId = req.body.user._id;

  try {
    // Check if a cart exists for the user ID
    let userCart = await cart.findOne({ userID: userId });

    // If no cart exists for the user, create a new cart
    if (!userCart) {
      userCart = new cart({
        userID: userId,
        products: [],
      });
      // Iterate through addedProducts array
      for (const addedProduct of req.body.addedProducts) {
        const { product, quantity, variation } = addedProduct;

        // Check if the product with the same variation is already in the cart
        const existingCartItem = userCart.products.find(
          (item) =>
            item.product._id.toString() === product._id.toString() &&
            item.variation === variation
        );

        if (existingCartItem) {
          // If the product with the same variation is already in the cart, update the quantity
          existingCartItem.quantity = quantity;
        } else {
          // If the product with the same variation is not in the cart, add it as a new item
          userCart.products.push({
            product: product,
            quantity: quantity,
            variation: variation,
          });
        }
      }
    } else {
      // Iterate through addedProducts array
      for (const addedProduct of req.body.addedProducts) {
        const { product, quantity, variation } = addedProduct;

        // Check if the product with the same variation is already in the cart
        const existingCartItem = userCart.products.find(
          (item) =>
            item.product._id.toString() === product._id.toString() &&
            item.variation === variation
        );

        if (existingCartItem) {
          // If the product with the same variation is already in the cart, update the quantity
          existingCartItem.quantity = quantity;
        } else {
          // If the product with the same variation is not in the cart, add it as a new item
          userCart.products.push({
            product: product,
            quantity: quantity,
            variation: variation,
          });
        }
      }
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

// delete product from cart
exports.updateCart = catchAsyncErrors(async (req, res, next) => {
  const userId = req.body.user._id;
  try {
    // Check if a cart exists for the user ID
    let userCart = await cart.findOne({ userID: userId });

    // Clear the existing products array
    userCart.products = [];

    // Iterate through addedProducts array and add the new products
    for (const addedProduct of req.body.addedProducts) {
      const { product, quantity, variation } = addedProduct;
      userCart.products.push({
        product: product,
        quantity: quantity,
        variation: variation,
      });
    }

    // Save the updated cart
    await userCart.save();

    res.status(200).json({
      message: "Cart updated successfully",
    });
  } catch (error) {
    console.error(error);
    return next(new ErrorHandler("Failed to update cart", 500));
  }
});

exports.fetchProducts = catchAsyncErrors(async (req, res, next) => {
  const { productIds } = req.body;
  const selectedProducts = await Product.find({ _id: { $in: productIds } });

  res.status(200).json({
    selectedProducts,
  });
});
