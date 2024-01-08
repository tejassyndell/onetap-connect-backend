const catchAsyncErrors = require("../../middleware/catchAsyncErrors");
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const UserInformation = require("../../models/NewSchemas/users_informationModel.js");
const Order = require('../../models/NewSchemas/orderSchemaModel.js');
const UserModel = require("../../models/NewSchemas/UserModel");
const billingAddressModal = require("../../models/NewSchemas/user_billing_addressModel");
const shippingAddressModal = require("../../models/NewSchemas/user_shipping_addressesModel.js");
const { updateCustomerCreditBalance } = require("../paymentController/paymentcontroller.js");
const endpointSecret = process.env.Stripe_webhook_signing_secret
// functions to update user data in database
// update when users subscription get updated
async function updateSubscriptionData(subscriptionData) {
  try {
    const updatedUser = await UserInformation.findOneAndUpdate(
      { 'subscription_details.subscription_id': subscriptionData.id },
      {
        $set: {
          'subscription_details.endDate': subscriptionData.current_period_end,
          'subscription_details.total_amount': subscriptionData.amount,
        },
      },
      { new: true }
    );
    return updatedUser;
  } catch (error) {
    throw error;
  }
}
async function updateCustomerBalance(subscriptionData) {
  try {
    const balanceTransactions = await stripe.customers.listBalanceTransactions(
      subscriptionData.customer
    );
    if (balanceTransactions.data.length > 0) {
      const updatedCreditbalance = await UserInformation.findOneAndUpdate(
        { 'subscription_details.customer_id': balanceTransactions.data[0].customer },
        {
          $set: {
            'subscription_details.creditBalance': balanceTransactions.data[0].ending_balance / 100,
          },
        },
        { new: true }
      );
    } else {
      return
    }
    return null
  } catch (error) {
    throw error;
  }
}
async function upComingInvoiceUpdate(upComingInvoiceData) {
  try {
    return null
  } catch (error) {
    throw error;
  }
}
exports.webhookHandler = catchAsyncErrors(async (request, response, next) => {
  const sig = request.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
  } catch (err) {
    response.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }
  // Handle the event
  try {
    switch (event.type) {
      case 'customer.subscription.updated':
        await updateSubscriptionData(event.data.object)
        await updateCustomerBalance(event.data.object)
        break;
      case 'customer.subscription.deleted':
        await updateCustomerBalance(event.data.object)
        break;
      case 'customer.subscription.created':
        await updateCustomerBalance(event.data.object)
        break;
      case 'invoice.upcoming':
        await upComingInvoiceUpdate(event.data.object)
      default:
    }
    response.status(200).end();
  } catch (error) {
    response.status(500).send('Error processing webhook event').end();
  }
})  