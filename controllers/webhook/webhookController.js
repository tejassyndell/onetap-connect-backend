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
       
        // const updatedUser = UserInformation.subscription_details.subscription_id 
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
      console.log("called2")
       console.log(subscriptionData)
       console.log('called3')
       const balanceTransactions = await stripe.customers.listBalanceTransactions(
        subscriptionData.customer
      );

      const updatedCreditbalance = await UserInformation.findOneAndUpdate(
        { 'subscription_details.customer_id': balanceTransactions.data[0].customer },
        {
          $set: {
            'subscription_details.creditBalance': balanceTransactions.data[0].ending_balance / 100,
          },
        },
        { new: true } 
      );
     return updatedCreditbalance
    } catch (error) {
        throw error;
    }
  }

exports.webhookHandler = catchAsyncErrors(async (request, response, next) => {
    const sig = request.headers['stripe-signature'];
  
    let event;
    
    try {
      event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
      console.log(event.type)
    } catch (err) {
      console.log(err.message)
      response.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }
  console.log(event.type)
    // Handle the event
    switch (event.type) {
      case 'customer.subscription.updated':
        const customerSubscriptionUpdated = event.data.object;
        const data = updateSubscriptionData(customerSubscriptionUpdated)
        const customerData = updateCustomerBalance(customerSubscriptionUpdated)
        break;
      case 'customer.subscription.deleted':
        const deletedSubData = event.data.object;
        const updatedData = updateCustomerBalance(deletedSubData)
        break;
      case ' customer.subscription.created':
        const createdSubData = event.data.object;
        const createdData = updateCustomerBalance(createdSubData)
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  
    // Return a 200 response to acknowledge receipt of the event
    response.status(200);
  })