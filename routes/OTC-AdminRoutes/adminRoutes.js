const express = require("express");
const router = express.Router();
const {
  testAPIS, getClients, Signup, OtcLogin, Otclogout, getOtcAdminProfile,
} = require("../../controllers/OTC-AdminController/Clients/clientsController");
const { isOtcAdminAuthenticatedUser } = require("../../middleware/OtcAdminAuth");
const { productImageUpload } = require("../../middleware/OTC-AdminProductimageUpload");
const { createProduct, createProductCategories, getProductCategories, categorImage } = require("../../controllers/OTC-AdminController/Clients/productController");

router.get("/admin/test", testAPIS);
router.get("/admin/clients", getClients);
router.post("/admin/signup", Signup);
router.post("/admin/login", OtcLogin);
router.post("/admin/logout", Otclogout);
router.get("/admin/loadadmin", isOtcAdminAuthenticatedUser ,getOtcAdminProfile);

router.post("/admin/product",createProduct);
router.post("/admin/productCategory/create" ,createProductCategories);
// router.post("/admin/productCategory/img" ,productImageUpload, categorImage);
// router.post("/admin/productCategory/create", productImageUpload ,createProductCategories);
router.get("/admin/productCategory/fetch", getProductCategories);

module.exports = router;