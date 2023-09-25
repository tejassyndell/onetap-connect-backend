const express = require("express");
const {
  processPayment,
  sendStripeApiKey,
} = require("../../controllers/paymentController/paymentcontroller");
const router = express.Router();
const { isAuthenticatedUser } = require("../../middleware/auth");

router.route("/payment/process").post(processPayment);


module.exports = router;