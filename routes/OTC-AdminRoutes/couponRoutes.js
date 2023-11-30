const express = require("express");
const router = express.Router();

const { fecthCoupons, verifyCouponUsage } = require('../../controllers/OTC-AdminController/Clients/couponController')


router.post("/admin/coupons/get", fecthCoupons);
router.post("/admin/coupons/checkusage", verifyCouponUsage);



module.exports = router;


