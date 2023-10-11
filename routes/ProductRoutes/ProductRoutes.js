const express = require("express");
const router = express.Router();
const { isAuthenticatedUser, authorizeRoles } = require("../../middleware/auth.js");


const {
  testAPI,
  getProducts,
  getProductsInfo,
  getCartProducts,
  updateCartProducts,
  updateCart,
  fetchProducts
} = require("../../controllers/ProductController/ProductController");

router.get("/product/test", testAPI);
router.get("/products", getProducts);
// router.get("/product/:id", getProductsInfo);
// router.get("/product/:name", getProductsInfo);
router.get("/:id", getProductsInfo);
router.post("/product/cart", getCartProducts);
router.post("/cart/update" ,updateCartProducts);
router.post("/cart/removeproduct" ,updateCart);
router.post("/products/fetch", fetchProducts);

module.exports = router;
