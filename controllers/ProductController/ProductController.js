const catchAsyncErrors = require("../../middleware/catchAsyncErrors.js");
const ErrorHandler = require("../../utils/errorHandler.js");
const Product = require("../../models/NewSchemas/ProductModel.js");
const ProductCategory = require("../../models/NewSchemas/ProductCategoryModel.js");
const cart = require("../../models/NewSchemas/cartModel.js");

exports.testAPI = catchAsyncErrors(async (req, res, next) => {
  // res.send("called");
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
        const { product, quantity } = addedProduct;

        // Check if the product is already in the cart
        const existingCartItemIndex = userCart.products.findIndex(
          (item) => item.product._id.toString() === product._id.toString()
        );

        if (existingCartItemIndex !== -1) {
          // If the product is already in the cart, update the quantity
          userCart.products[existingCartItemIndex].quantity = quantity;
        } else {
          // If the product is not in the cart, add it as a new item
          userCart.products.push({
            product: product,
            quantity: quantity,
          });
        }
      }
    } else {
      // Iterate through addedProducts array
      for (const addedProduct of req.body.addedProducts) {
        const { product, quantity } = addedProduct;

        // Check if the product is already in the cart
        const existingCartItemIndex = userCart.products.findIndex(
          (item) => item.product._id.toString() === product._id.toString()
        );

        if (existingCartItemIndex !== -1) {
          // If the product is already in the cart, update the quantity
          userCart.products[existingCartItemIndex].quantity = quantity;
        } else {
          // If the product is not in the cart, add it as a new item
          userCart.products.push({
            product: product,
            quantity: quantity,
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
    console.error(error);
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
      const { product, quantity } = addedProduct;
      userCart.products.push({
        product: product,
        quantity: quantity,
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


// exports.updateCart = catchAsyncErrors(async (req, res, next) => {
//   const userId = req.body.user._id;
//   try {
//     // Check if a cart exists for the user ID
//     let userCart = await cart.findOne({ userID: userId });

//     // Get the array of added products from the request
//     const addedProducts = req.body.addedProducts;

//     // Filter out products from Cartproducts that are not in addedProducts
//     userCart.products = userCart.products.filter((cartProduct) => {
//       const foundProduct = addedProducts.find(
//         (addedProduct) => addedProduct.product._id === cartProduct.product._id
//       );
//       return foundProduct;
//     });

//     // Save the updated cart
//     await userCart.save();

//     res.status(200).json({
//       message: "Cart updated successfully",
//     });
//   } catch (error) {
//     console.error(error);
//     return next(new ErrorHandler("Failed to update cart", 500));
//   }
// });

exports.fetchProducts = catchAsyncErrors(async (req, res, next) => {
  const { productIds } = req.body;

  const selectedProducts =  await Product.find({_id:{$in:productIds}})

  res.status(200).json({
    selectedProducts,
  });
});