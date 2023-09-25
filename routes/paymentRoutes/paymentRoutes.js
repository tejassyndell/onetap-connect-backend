const express = require("express");

const {
  processPayment,
  sendStripeApiKey,
  testAPI
} = require("../../controllers/paymentController/paymentcontroller");
const router = express.Router();
const { isAuthenticatedUser } = require("../../middleware/auth");

router.route("/payment/process").post(processPayment);
router.get("/payment/testapi", testAPI);



module.exports = router;