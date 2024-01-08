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
  addonPurchase,
  fetchCardsforOtcAdminPanel,
  updateCardsforOtcAdminPanel,
  switchToManualRenewalforOtcAdminPanel,
  createOrderWithoutPayment,
  purchaseusers,
  createOrderWithoutPaymentAndSendInvoice,
  manualRenewSubscription,
  cancelPlandeactivateaccount,
  createAdminPlanOrder,
  createAdminAddonOrder,
  createAdminSmartAccOrder,
  canceledSubscription,
} = require("../../controllers/paymentController/paymentcontroller");
const router = express.Router();
const { isAuthenticatedUser } = require("../../middleware/auth");
router.post('/payment/process', createSubscription)
router.post('/payment/create-customer', createCustomer)
router.post('/payment/tax', createTax)
router.post('/payment/switchToManualRenewal', switchToManualRenewal)
router.post("/create-order", createOrder);
router.post('/payment/change-plan', switchPlan)
router.get('/payment/isactive', isAuthenticatedUser, isActive)
router.post('/payment/test', addonPurchase)
router.post('/payment/cancelSubscription', cancelPlan)
router.post('/payment/cancel-Subscription', canceledSubscription)
router.post('/payment/cancelSubscription/deactivateaccount', cancelPlandeactivateaccount)
router.post('/payment/get-saved-cards', fetchCards)
router.post('/payment/update-card', isAuthenticatedUser, updateCards)
router.post("/addon-purchase", isAuthenticatedUser, purchaseaddon);
router.post("/user-purchase", isAuthenticatedUser, purchaseusers);
router.post("/payment/manual-renew-subscription", manualRenewSubscription);
// ---------OTC ADMIN PANEL------------
router.post('/admin/payment/get-saved-cards', fetchCardsforOtcAdminPanel)
router.post('/admin/payment/update-card', updateCardsforOtcAdminPanel)
router.post('/admin/create-order-without-Payment', createOrderWithoutPayment)
router.post('/admin/create-order-and-send-invoice', createOrderWithoutPaymentAndSendInvoice)
router.post('/admin/payment/switchToManualRenewal', switchToManualRenewalforOtcAdminPanel)
router.post('/admin/payment/plan-purchase', createAdminPlanOrder) // route to purchase plan
router.post('/admin/payment/addon-purchase', createAdminAddonOrder) // route to purchase addon
router.post('/admin/payment/smart-accessories-purchase', createAdminSmartAccOrder) // route to smart accessories
module.exports = router;