const express = require("express");
const router = express.Router();
const companyRoutes = require("./companyRoutes/companyRoutes");
const paymentRoutes = require("./paymentRoutes/paymentRoutes");
const SuperAdminRoutes = require("./SuperAdminRoutes/superAdminRoutes");
const OTCAdminRoutes = require("./OTC-AdminRoutes/adminRoutes");
const couponRoutes = require("./OTC-AdminRoutes/couponRoutes");
const productRoutes = require("./ProductRoutes/ProductRoutes.js");
const AccountRoutes = require("./accountSwitch/accountRoutes.js");


// OTC-Admin
router.use("/api/v1", OTCAdminRoutes);
router.use("/api/v1", companyRoutes);
router.use("/api/v1", SuperAdminRoutes);
router.use("/api/v1", paymentRoutes);
router.use("/api/v1", productRoutes);
router.use("/api/v1", couponRoutes);
router.use("/api/v1", AccountRoutes);

module.exports = router;

