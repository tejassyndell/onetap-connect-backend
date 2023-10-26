const express = require("express");
const router = express.Router();
const {
  testAPIS, getClients,
} = require("../../controllers/OTC-AdminController/Clients/clientsController");
const { createProduct } = require("../../controllers/OTC-AdminController/Clients/productController");


router.get("/admin/test", testAPIS);
router.get("/admin/clients", getClients);
router.post("/admin/product",createProduct);

module.exports = router;