const express = require("express");
const {
  processPayment,
  sendStripeApiKey,
  createCustomer,
  createSubscription,
  switchToManualRenewal,
  createTax,
  createOrder,
  switchPlan,
  isActive,
  cancelPlan
} = require("../../controllers/paymentController/paymentcontroller");
const router = express.Router();
const { isAuthenticatedUser } = require("../../middleware/auth");

router.post('/payment/process', createSubscription)
router.post('/payment/create-customer', createCustomer)
router.post('/payment/tax', createTax) 
router.post('/payment/subcription', createSubscription)
router.post('/payment/switchToManualRenewal', switchToManualRenewal)
router.post("/create-order", createOrder);
router.post('/payment/change-plan', switchPlan)
router.get('/payment/isactive' ,isAuthenticatedUser, isActive)
router.get('/payment/test' ,isAuthenticatedUser, cancelPlan)


router.post("/create-order", createOrder);

module.exports = router;