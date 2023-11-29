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
  updateCustomerCreditBalance,
  purchaseaddon,
  fetchTaxrates,
  addonPurchase
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
router.post('/payment/test' , addonPurchase)
router.post('/payment/cancelSubscription' , cancelPlan)
router.post('/payment/get-saved-cards', fetchCards)
router.post('/payment/update-card',isAuthenticatedUser, updateCards)
router.post("/addon-purchase",isAuthenticatedUser , purchaseaddon);
module.exports = router;