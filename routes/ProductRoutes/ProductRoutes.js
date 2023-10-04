const express = require("express");
const router = express.Router();
const { isAuthenticatedUser } = require("../../middleware/auth");

const {
  testAPI,
  getProducts,
  getProductsInfo,
  getCartProducts,
  updateCartProducts
} = require("../../controllers/ProductController/ProductController");

router.get("/product/test", testAPI);
router.get("/products", getProducts);
// router.get("/product/:id", getProductsInfo);
// router.get("/product/:name", getProductsInfo);
router.get("/:name", getProductsInfo);
router.get("/cart", getCartProducts);
router.post("/cart/update", updateCartProducts);

module.exports = router;
