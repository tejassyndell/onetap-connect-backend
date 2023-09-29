const express = require("express");
const router = express.Router();
const { isAuthenticatedUser } = require("../../middleware/auth");

const {
  testAPI,
  getProducts,
  getProductsInfo,
} = require("../../controllers/ProductController/ProductController");

router.get("/product/test", testAPI);
router.get("/products", getProducts);
router.get("/product/:id", getProductsInfo);

module.exports = router;
