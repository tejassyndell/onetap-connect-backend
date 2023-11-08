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
  cancelPlan,
  fetchCards,
  updateCards,
  updateCustomerCreditBalance
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
router.post('/payment/updateCustomerBalance' , updateCustomerCreditBalance)
router.post('/payment/cancelSubscription' , cancelPlan)
router.post('/payment/get-saved-cards', fetchCards)
router.post('/payment/update-card',isAuthenticatedUser, updateCards)

module.exports = router;