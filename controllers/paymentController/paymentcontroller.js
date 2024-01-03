const catchAsyncErrors = require("../../middleware/catchAsyncErrors");
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const UserInformation = require("../../models/NewSchemas/users_informationModel.js");
const Order = require('../../models/NewSchemas/orderSchemaModel.js'); // Import the Order model
const UserModel = require("../../models/NewSchemas/UserModel");
const ErrorHandler = require("../../utils/errorHandler.js");
const billingAddressModal = require("../../models/NewSchemas/user_billing_addressModel");
const shippingAddressModal = require("../../models/NewSchemas/user_shipping_addressesModel.js");
const path = require("path");
const nodemailer = require("nodemailer");
const Company_informationModel = require("../../models/NewSchemas/Company_informationModel.js");
const PurchasedSmartAccessoryModal = require("../../models/NewSchemas/SmartAccessoriesModal.js");
const UserCouponAssociation = require("../../models/NewSchemas/OtcUserCouponAssociation.js");
const ProductModel = require("../../models/NewSchemas/ProductModel.js");

const productId = process.env.PLAN_PRODUCT_ID
const Product_Team_Yearly = process.env.Team_Yearly
const Product_Team_monthly = process.env.Team_monthly
const Product_Professional_Yearly = process.env.Professional_Yearly
const Product_Professional_monthly = process.env.Professional_monthly
const monthlyProfessionalPriceID = process.env.MONTHLY_PROFESSIONAL_PLAN_PRICE_ID
const monthlyTeamPriceID = process.env.MONTHLY_TEAM_PLAN_PRICE_ID
const Subscription_Addons = process.env.Subscription_Addons
const Onetime_Addons = process.env.Onetime_Addons

// const { v4: uuidv4 } = require('uuid');

// exports.processPayment = catchAsyncErrors(async (req, res, next) => {
//   const Address = req.body.billingAddress;

//   const myPayment = await stripe.paymentIntents.create({
//     amount: req.body.amount * 100,
//     currency: "usd",
//     description: 'Test description', // Provide an export-related description
//     metadata: {
//       company: req.body.company_name,
//     },
//     shipping: {
//       address: {
//         line1: Address.Bstreet1,
//         line2: Address.Bstreet2,
//         city: Address.Bcity,
//         state: Address.Bstate,
//         postal_code: Address.BpostalCode,
//         country: Address.Bcountry,
//       },
//       name: req.body.name
//     },
//   });

//   console.log(myPayment)
//   // need to save payment id and user details in database after successfull payment

//   res.status(200).json({ success: true, client_secret: myPayment.client_secret });
// });


exports.createCustomer = catchAsyncErrors(async (req, res, next) => {
  const { user } = req.body;
  try {
    const existingCustomer = await stripe.customers.list({
      email: user.email,
      limit: 1,
    });

    console.log(user.email)
    console.log(existingCustomer)

    if (existingCustomer.data.length > 0) {
      const exstingData = existingCustomer.data[0]

      const customer = await stripe.customers.update(exstingData.id, {
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        phone: user.contact,
        address: {
          line1: user.billing_address.line1,
          line2: user.billing_address.line2,
          city: user.billing_address.city,
          state: user.billing_address.state,
          country: user.billing_address.country,
          postal_code: user.billing_address.postal_code,
        },
        shipping: {
          name: `${user.first_name} ${user.last_name}`,
          address: {
            line1: user.shipping_address.line1,
            line2: user.shipping_address.line2,
            city: user.shipping_address.city,
            state: user.shipping_address.state,
            country: user.shipping_address.country,
            postal_code: user.shipping_address.postal_code,
          },
        },
        metadata: {
          company: user.company_name,
        },
        expand: ['tax']
      });
      console.log(customer)
      res.status(200).json({ success: true, customer });
    } else {
      const customer = await stripe.customers.create({
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        phone: user.contact,
        address: {
          line1: user.billing_address.line1,
          line2: user.billing_address.line2,
          city: user.billing_address.city,
          state: user.billing_address.state,
          country: user.billing_address.country,
          postal_code: user.billing_address.postal_code,
        },
        // test_clock: "clock_1OPjF0HsjFNmmZSibAMwHQqh",
        shipping: {
          name: `${user.first_name} ${user.last_name}`,
          address: {
            line1: user.shipping_address.line1,
            line2: user.shipping_address.line2,
            city: user.shipping_address.city,
            state: user.shipping_address.state,
            country: user.shipping_address.country,
            postal_code: user.shipping_address.postal_code,
          },
        },
        metadata: {
          company: user.company_name,
        },
        expand: ['tax']
      });
      console.log(customer)
      if (user._id !== "Guest") {
        fetchCustomerID = await UserModel.findOne({ 'email': user.email })
        console.log("fetchCustomerID")
        console.log(fetchCustomerID)
        console.log("fetchCustomerID")

        const updatedUserInfo = await UserInformation.findOneAndUpdate(
          { user_id: fetchCustomerID._id },
          { $set: { 'subscription_details.customer_id': customer.id } },
          { new: true }
        );
        if (!updatedUserInfo) {
          return next(new ErrorHandler("Internal server Error", 501));
        }
      }
      res.status(200).json({ success: true, customer });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});


exports.processPayment = catchAsyncErrors(async (req, res, next) => {
  console.log(req.body)
  const Address = req.body.billingAddress;

  const myPayment = await stripe.paymentIntents.create({
    amount: req.body.amount * 100,
    currency: "usd",
    description: 'Test description', // Provide an export-related description
    metadata: {
      company: req.body.company_name,
    },
    shipping: {
      address: {
        line1: Address.Bstreet1,
        line2: Address.Bstreet2,
        city: Address.Bcity,
        state: Address.Bstate,
        postal_code: Address.BpostalCode,
        country: Address.Bcountry,
      },
      name: req.body.name
    },
  });

  console.log(myPayment)


  res.status(200).json({ success: true, client_secret: myPayment.client_secret });
});


exports.createSubscription = catchAsyncErrors(async (req, res, next) => {
  const paymentToken = req.body.paymentToken;
  const customerID = req.body.customerID;
  const Address = req.body.billingAddress;
  const totalAddons_value = req.body.totalAddons_value;
  const selectedCard = req.body.selectedCard;
  const newUser = req.body.newUser;
  const primary_card = req.body.primary_card;
  const initialSetupCharge = req.body.initialSetupCharge;
  const isCouponApplied = req.body.isCouponApplied;
  const couponData = req.body.appliedCouponData;
  const addonsData = req.body.addonsData;
  const plandata = req.body.plandata;
  let planCoupon = null;
  let addonsCoupon = [];

  let initialChargeInvoice;
  let productsInvoice;
  let onetimeAddonsInvoice;
  let invoiceItem = {}
  let addonPrices = []
  let coupon = {}
  let myPayment = {}
  try {


    console.log(primary_card)

    // console.log(req.body)
    const { type, planName } = req.body.plandata;
    const productID = type === 'monthly'
      ? planName === 'Professional' ? Product_Professional_monthly : Product_Team_monthly
      : planName === 'Professional' ? Product_Professional_Yearly : Product_Team_Yearly;
    let attachedPaymentMethod;
    if (!selectedCard) {
      attachedPaymentMethod = await stripe.paymentMethods.attach(paymentToken, {
        customer: customerID,
      });
    }

    let oneTimeAddons = [];
    let subscriptionBaseAddons = [];

    if (addonsData) {
      addonsData.forEach(item => {
        if (item.addonType === 'subscription') {
          subscriptionBaseAddons.push(item)
        } else {
          oneTimeAddons.push(item)
        }
      })
    }


    async function createInvoiceItems(items, customerID, itemType, taxcode) {
      try {
        const createdInvoiceItems = [];
        for (const item of items) {
          const invoiceItem = await stripe.invoiceItems.create({
            customer: customerID,
            unit_amount: item.price * 100,
            quantity: itemType === 'product' ? item.quantity : 1,
            currency: 'usd',
            description: `Invoice Item for ${itemType} ${item.addonId}`,
            tax_code: taxcode,
          });
          createdInvoiceItems.push(invoiceItem);
        }
        return createdInvoiceItems;
      } catch (error) {
        console.error(`Error creating ${itemType} invoice items:`, error);
        throw error;
      }
    }
    console.log("called 2")

    if (initialSetupCharge) {
      console.log("called 2")
      initialChargeInvoice = await stripe.invoiceItems.create({
        customer: customerID,
        amount: initialSetupCharge * 100,  // need to pass charge amount
        currency: 'usd',
        description: 'Initial setup fee',
      });
    }
    console.log("2")


    // create invoice item for ontetime purchase addons
    if (oneTimeAddons.length > 0) {
      const validAddons = oneTimeAddons.filter(addon => addon.price > 0)
      onetimeAddonsInvoice = await createInvoiceItems(validAddons, customerID, 'addon')
      if (!onetimeAddonsInvoice) {
        return // need to show error 
      }
      console.log("onetimeAddonsInvoice")
      console.log(onetimeAddonsInvoice)
      console.log("onetimeAddonsInvoice")
    }

    console.log("4")

    // create price for plan
    planPrice = await stripe.prices.create({
      currency: 'usd',
      unit_amount: plandata.price * plandata.usersCount * 100,
      product: productID,
      recurring: {
        interval: plandata.type === 'monthly' ? "month" : "year",
        interval_count: 1
      },
    });
    console.log("5")

    // create coupon for plan // if coupon applied
    if (isCouponApplied) {

      console.log("coupon applied")

      const couponOptions = {
        duration: 'repeating',
        duration_in_months: couponData.xPaymentValue * (plandata.type === 'monthly' ? 1 : 12),
        applies_to: {
          products: [productID],
        },
        currency: 'usd',
        metadata: {
          customer_id: customerID,
          id: plandata.planId,
        },
        percent_off: (couponData.perUserDiscountPrice * plandata.usersCount)
      };
      planCoupon = await stripe.coupons.create(couponOptions);

      console.log("planCoupon")
      console.log(planCoupon)
      console.log("planCoupon")

      // filter discountable addons
      const validAddons = subscriptionBaseAddons.filter(addon => addon.price > 0);
      if (validAddons.length > 0) {
        for (const addon of validAddons) {
          const couponOptions = {
            duration: 'once',
            currency: 'usd',
            metadata: {
              customer_id: customerID,
              id: addon.addonId,
            },
            percent_off: addon.addonDiscountPrice
          };

          const addonCoupon = await stripe.coupons.create(couponOptions);
          addonsCoupon.push(addonCoupon)
        }
      }
    }
    console.log("addonsCoupon")
    console.log(addonsCoupon)
    console.log("addonsCoupon")

    let addonItems = []

    for (const addon of subscriptionBaseAddons) {
      const priceOptions = {
        currency: 'usd',
        unit_amount: addon.price * 100,
        product: Subscription_Addons,
        recurring: {
          interval: plandata.type === 'monthly' ? "month" : "year",
          interval_count: 1
        },
      };


      const createdPrice = await stripe.prices.create(priceOptions);
      addonPrices.push(createdPrice);

      const addonItem = {
        price: createdPrice.id,
        quantity: 1,
        metadata: {
          id: addon.addonId,
          type: 'addon',
        },
      };

      addonItems.push(addonItem);
    }
    console.log("6")
    console.log(subscriptionBaseAddons)
    console.log("6")

    // create coupon for plan if applied

    console.log(addonItems)

    const myPaymentsubscription = await stripe.subscriptionSchedules.create({
      customer: customerID,
      start_date: 'now',
      end_behavior: 'release',
      phases: [
        {
          items: [
            {
              price: planPrice.id,
              quantity: 1,
              metadata: {
                id: plandata.planID,
                type: 'plan',
              },
            },
            addonItems[0]
          ],
          default_payment_method: attachedPaymentMethod.id,
          collection_method: 'charge_automatically',
          billing_cycle_anchor: 'automatic',
          description: 'Dummy combined Subscription Schedule',
          ...(planCoupon && { coupon: planCoupon.id })
        },
      ],
    });

    if (!myPaymentsubscription) {
      throw new Error("subcription creation failed")
    }


    const subscription = await stripe.subscriptions.retrieve(
      myPaymentsubscription.subscription
    );

    const invoice = await stripe.invoices.retrieve(subscription.latest_invoice);

    if (isCouponApplied) {
      const separatedItems = subscription.items.data.reduce(
        (accumulator, currentItem) => {
          if (currentItem.metadata.type === "addon") {
            accumulator.addon.push(currentItem);
          }
          return accumulator;
        },
        { addon: [] }
      );
      console.log("separatedItems")
      console.log("separatedItems")

      function matchCouponsWithItems(coupons, separatedItems) {
        const matchedCoupons = {
          addon: []
        };

        separatedItems.addon.forEach(addonItem => {
          console.log("coupon.metadata")
          console.log(coupon)
          console.log("coupon.metadata")

          coupons.forEach(coupon => {
            const metadataId = addonItem.metadata.id;
            if (coupon.metadata.id === metadataId) {
              matchedCoupons.addon.push({
                id: metadataId,
                itemID: addonItem.id,
                couponID: coupon.id
              });
            }
          });
        });

        separatedItems.addon.forEach(addonItem => {
          coupons.forEach(coupon => {
            const metadataId = addonItem.metadata.id;
            if (coupon.metadata.id === metadataId) {
              matchedCoupons.addon.push({
                id: metadataId,
                itemID: addonItem.id,
                couponID: coupon.id
              });
            }
          });
        });
        return matchedCoupons;
      }


      const matchedCouponsData = matchCouponsWithItems(addonsCoupon, separatedItems)


      function matchItemIDWithLineItems(matchedItems, lineItems) {
        const matchedCodes = {
          addon: []
        };

        matchedItems.addon.forEach(addonItem => {
          lineItems.forEach(lineItem => {
            if (lineItem.subscription_item === addonItem.itemID) {
              matchedCodes.addon.push({
                id: lineItem.id,
                itemID: addonItem.itemID,
                couponID: addonItem.couponID
              });
            }
          });
        });

        matchedItems.addon.forEach(addonItem => {
          lineItems.forEach(lineItem => {
            if (lineItem.subscription_item === addonItem.itemID) {
              matchedCodes.addon.push({
                id: lineItem.id,
                itemID: addonItem.itemID,
                couponID: addonItem.couponID
              });
            }
          });
        });

        return matchedCodes;
      }

      const matchedCodes = matchItemIDWithLineItems(matchedCouponsData, invoice.lines.data);


      // Function to apply discounts to respective invoice items
      async function applyDiscounts(matchedCodes) {
        for (const key in matchedCodes) {
          for (const item of matchedCodes[key]) {
            try {
              const applyDiscount = await stripe.invoiceItems.update(item.id, {
                discounts: [
                  {
                    coupon: item.couponID,
                  },
                ],
              });
              console.log(`Discount applied for item ${item.id}`);
              // You can add additional handling or logging here
            } catch (error) {
              console.error(`Error applying discount for item ${item.id}:`, error);
              // Handle errors if necessary
            }
          }
        }
      }

      applyDiscounts(matchedCodes);
    } else {
      // res.send(myPaymentsubscription)
    }

    const finalizeInvoice = await stripe.invoices.finalizeInvoice(subscription.latest_invoice);

    console.log(invoice)
    if (finalizeInvoice.payment_intent) {
      const subscriptionPaymentIntetn = await stripe.paymentIntents.retrieve(
        finalizeInvoice.payment_intent
      );
      // Save payment ID and user details in your database after successful payment
      return res.status(200).json({ success: true, client_secret: subscriptionPaymentIntetn.client_secret, subscriptionID: subscription.id, subscriptionScheduleID: myPaymentsubscription.id, status: subscriptionPaymentIntetn.status, endDate: subscription.current_period_end, subscriptionDetails: subscription.items.data });
    }
    return res.status(200).json({ success: true, client_secret: "subscription-change", subscriptionID: subscription.id, status: subscription.status, endDate: subscription.current_period_end, subscriptionScheduleID: myPaymentsubscription.id, subscriptionDetails: subscription.items.data });


  } catch (error) {
    console.error(error);
    // handle subscription failure
    try {

      // function to delete invoice items
      async function deleteInvoiceItems(items) {
        try {
          const deletedItems = [];
          for (const item of items) {
            await stripe.invoiceItems.del(item.id);
          }
          return deletedItems;
        } catch (error) {
          console.error('Error deleting invoice items:', error);
          throw error;
        }
      }
      async function deactivatePrices(priceIDs) {
        try {
          for (const priceID of priceIDs) {
            const price = await stripe.prices.update(priceID, {
              active: false
            });
          }
        } catch (error) {
          console.error('Error deactivating prices:', error);
          throw error;
        }
      }

      const deleteCustomer = customerID && await stripe.customers.del(customerID);
      const deletedInvoiceItem =
        initialChargeInvoice && initialChargeInvoice.id && (await stripe.invoiceItems.del(invoiceItem.id));
      await deleteInvoiceItems(productsInvoice)
      await deleteInvoiceItems(onetimeAddonsInvoice)
      await deactivatePrices([planPrice])
      await deactivatePrices(addonPrices)
      const detachPT =
        attachedPaymentMethod &&
        attachedPaymentMethod.id &&
        (await stripe.paymentMethods.detach(attachedPaymentMethod.id));
      const deletePrice = price && await stripe.prices.update(
        price.id,
        {
          active: false
        }
      );

      console.error(
        'Cleanup performed after failure:',
        deleteCustomer,
        deletedInvoiceItem,
        detachPT,
        deletePrice
      );
    } catch (cleanupError) {
      res.status(500).json({ success: false, error: cleanupError.message });
      console.error('Error during cleanup:', cleanupError);
    }
    res.status(500).json({ success: false, error: error.message });
  }
}
);

exports.switchToManualRenewal = catchAsyncErrors(async (req, res, next) => {
  const { subscription_id, userId, type } = req.body.userData

  try {
    if (type === 'cancel') {
      // await stripe.subscriptions.update(subscription_id, {
      //   collection_method: 'send_invoice',
      //   days_until_due: 7,
      // });
      await stripe.subscriptionSchedules.update(
        subscription_id,
        {
          default_settings: {
            collection_method: 'send_invoice',
            invoice_settings: {
              days_until_due: 7
            }
          },
        }
      );
      const updatedUserInfo = await UserInformation.findOneAndUpdate(
        { user_id: userId },
        { $set: { 'subscription_details.auto_renewal': false } },
        { new: true }
      );
      console.log('Updated user information:', updatedUserInfo);
      res.status(200).json({ success: true, message: 'Switched to manual renewal. Invoices will be sent for manual payment.' });
    }
    else if (type === 'enable') {
      // await stripe.subscriptions.update(subscription_id, {
      //   collection_method: 'charge_automatically',
      // });
      await stripe.subscriptionSchedules.update(
        subscription_id,
        {
          default_settings: {
            collection_method: 'charge_automatically',
          },
        }
      );
      const updatedUserInfo = await UserInformation.findOneAndUpdate(
        { user_id: userId },
        { $set: { 'subscription_details.auto_renewal': true } },
        { new: true }
      );
      console.log('Updated user information:', updatedUserInfo);
      res.status(200).json({ success: true, message: 'Switched to automatic renewal.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});


exports.cancelPlan = catchAsyncErrors(async (req, res, next) => {
  console.log(req.body)
  try {
    const { subId } = req.body
    if (!subId) {
      return res.status(500).json({ success: false, error: 'No Subscription Id found' });
    }

    const canceledSubscription = await stripe.subscriptionSchedules.cancel(subId, {
      invoice_now: true,
      prorate: true
    });
    console.log(canceledSubscription);
    console.log('canceledSubscription');

    if (!canceledSubscription) {
      return res.status(500).json({ success: false, error: 'Error while canceling subscription' });
    }

    const updatedUserInfo = await UserInformation.findOneAndUpdate(
      { 'subscription_details.customer_id': canceledSubscription.customer },
      {
        $set: {
          'subscription_details.subscription_id': null,
          'subscription_details.addones': [],
          'subscription_details.total_amount': null,
          'subscription_details.billing_cycle': null,
          'subscription_details.endDate': null,
          'subscription_details.plan': 'Free',
          'subscription_details.total_user': [{ 'baseUser': 1, 'additionalUser': 0 }],
          'subscription_details.recurring_amount': null,
          'subscription_details.renewal_date': null,
          'subscription_details.auto_renewal': null,
          'subscription_details.taxRate': null,
        }
      },
      { new: true }
    );
    if (!updatedUserInfo) {
      return res.status(500).json({ success: false, error: 'Error while canceling subscription' });
    }

    console.log(updatedUserInfo)
    console.log("updatedUserInfo")

    res.status(200).json({ success: true, delete: "Subscription Canceled successfully" });
    // res.status(200).json({ success: true, message: canceledSubscription });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});
//for account deactivate plan cancel
exports.cancelPlandeactivateaccount = catchAsyncErrors(async (req, res, next) => {
  console.log(req.body)
  try {
    const { subId, currentPlan } = req.body
    if (!subId) {
      return res.status(500).json({ success: false, error: 'No Subscription Id found' });
    }

    const canceledSubscription = await stripe.subscriptionSchedules.cancel(subId, {
      invoice_now: true,
      prorate: true
    });
    console.log(canceledSubscription);
    console.log('canceledSubscription');

    if (!canceledSubscription) {
      return res.status(500).json({ success: false, error: 'Error while canceling subscription' });
    }

    const updatedUserInfo = await UserInformation.findOneAndUpdate(
      { 'subscription_details.customer_id': canceledSubscription.customer },
      {
        $set: {
          'subscription_details.subscription_id': null,
          'subscription_details.addones': [],
          'subscription_details.total_amount': null,
          'subscription_details.billing_cycle': null,
          'subscription_details.endDate': null,
          'subscription_details.plan': currentPlan,
          'subscription_details.total_user': [{ 'baseUser': 1, 'additionalUser': 0 }],
          'subscription_details.recurring_amount': null,
          'subscription_details.renewal_date': null,
          'subscription_details.auto_renewal': null,
          'subscription_details.taxRate': null,
        }
      },
      { new: true }
    );
    if (!updatedUserInfo) {
      return res.status(500).json({ success: false, error: 'Error while canceling subscription' });
    }

    console.log(updatedUserInfo)
    console.log("updatedUserInfo")

    res.status(200).json({ success: true, delete: "Subscription Canceled successfully" });
    // res.status(200).json({ success: true, message: canceledSubscription });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});


exports.switchPlan = catchAsyncErrors(async (req, res, next) => {
  try {
    const proration_date = Math.floor(Date.now() / 1000);
    const { paymentToken, customerID, subscriptionId, subscriptionScheduleID, sub_shed_itemId, plandata, selectedCard, existingcard } = req.body;
    const { type, planName } = plandata;

    const productID = type === 'monthly'
      ? planName === 'Professional' ? Product_Professional_monthly : Product_Team_monthly
      : planName === 'Professional' ? Product_Professional_Yearly : Product_Team_Yearly;
    let attachedPaymentMethod;
    if (!selectedCard && existingcard === false) {
      attachedPaymentMethod = await stripe.paymentMethods.attach(paymentToken, {
        customer: customerID,
      });
    }

    console.log(productID)
    const price = await stripe.prices.create({
      currency: 'usd',
      unit_amount: req.body.amount * 100,
      product: productID,
      recurring: {
        interval: type === "monthly" ? "month" : "year",
        interval_count: 1
      },
    });
    console.log(price)

    console.log("called0")
    let subscription = await stripe.subscriptions.retrieve(subscriptionId);

    console.log(subscription.items.data)
    let matchedPlan;
    let remainingPurchase = [];
    subscription.items.data.forEach(item => {
      if (item.id === sub_shed_itemId) {
        matchedPlan = item
      } else {
        remainingPurchase.push({ price: item.plan.id })
      }
    })

    console.log(matchedPlan)
    console.log(remainingPurchase)
    console.log("called1")
    const subscriptionSchedule = await stripe.subscriptionSchedules.retrieve(
      subscriptionScheduleID
    );
    console.log("subscriptionSchedule")
    console.log(subscriptionSchedule.phases[0])
    console.log("subscriptionSchedule")
    const latestPhaseIndex = subscriptionSchedule.phases.length - 1
    console.log(subscriptionSchedule.phases.length)
    console.log("subscriptionSchedule")

    // Add the new item to the subscription
    let myPayment;
    if (selectedCard) {
      console.log("1")
      myPayment = await stripe.subscriptionSchedules.update(subscriptionScheduleID, {
        end_behavior: "release",
        phases: [
          {
            items: [
              {
                price: matchedPlan.plan.id,
                metadata: {
                  id: plandata.planID,
                  type: 'plan',
                },
              }
            ],
            start_date: subscriptionSchedule.phases[latestPhaseIndex].start_date,
            end_date: 'now',
          },
          {
            items: [{
              price: price.id,
              metadata: {
                id: plandata.planID,
                type: 'plan',
              },
            },
              // remainingPurchase[0]
            ],
            start_date: 'now',
            default_payment_method: paymentToken,
          },
        ],
        proration_behavior: "create_prorations",
      });
    } else if (existingcard) {
      console.log("2")
      myPayment = await stripe.subscriptionSchedules.update(subscriptionScheduleID, {
        end_behavior: "release",
        phases: [
          {
            items: [
              {
                price: matchedPlan.plan.id,
                metadata: {
                  id: plandata.planID,
                  type: 'plan',
                },
              }
            ],
            start_date: subscriptionSchedule.phases[latestPhaseIndex].start_date,
            end_date: 'now',
          },
          {
            items: [{
              price: price.id,
              metadata: {
                id: plandata.planID,
                type: 'plan',
              },
            },
              // remainingPurchase[0]
            ],
            start_date: 'now',
            default_payment_method: paymentToken,
          },
        ],
        proration_behavior: "create_prorations",
      });
    }
    else {
      console.log("3")
      myPayment = await stripe.subscriptionSchedules.update(subscriptionScheduleID, {
        end_behavior: "release",
        phases: [
          {
            items: [
              {
                price: matchedPlan.plan.id,
                metadata: {
                  id: plandata.planID,
                  type: 'plan',
                },
              }
            ],
            start_date: subscriptionSchedule.phases[latestPhaseIndex].start_date,
            end_date: 'now',
            // end_date : parseInt(currentDate) + 1000,
          },
          {
            items: [{
              price: price.id,
              metadata: {
                id: plandata.planID,
                type: 'plan',
              },
            },
              // remainingPurchase[0]
            ],
            start_date: 'now',
            default_payment_method: attachedPaymentMethod.id,
          },
        ],
        proration_behavior: "create_prorations",
      });
    }
    console.log("myPayment");
    console.log(myPayment);
    console.log("myPayment");
    // fetch updated subscription
    subscription = await stripe.subscriptions.retrieve(myPayment.subscription);
    // res.status(200).json({ success: true, client_secret: "switch-plan", subscriptionID: myPayment.id, status: "true", endDate: myPayment.phases[1].end_date});
    console.log({ success: true, client_secret: "switch-plan", subscriptionID: subscription.id, status: myPayment.status, endDate: subscription.current_period_end, subscriptionScheduleID: myPayment.id, subscriptionDetails: subscription.items.data })
    return res.status(200).json({ success: true, client_secret: "switch-plan", subscriptionID: subscription.id, status: myPayment.status, endDate: subscription.current_period_end, subscriptionScheduleID: myPayment.id, subscriptionDetails: subscription.items.data });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});


exports.createTax = catchAsyncErrors(async (req, res, next) => {
  const TAX_CODE = 'txcd_99999999';
  const { shippingAddress } = req.body;

  console.log(shippingAddress);

  try {
    const calculation = await stripe.tax.calculations.create({
      currency: 'usd',
      line_items: [
        {
          amount: 0,
          tax_code: TAX_CODE,
          reference: 'L1',
        },
      ],
      customer_details: {
        address: {
          line1: shippingAddress.Sstreet1,
          city: shippingAddress.Scity,
          state: shippingAddress.Sstate,
          postal_code: shippingAddress.SpostalCode,
          country: shippingAddress.Scountry,
        },
        address_source: 'shipping',
      },

      expand: ['line_items.data.tax_breakdown'],
    });
    // res.status(200).json({ success: true, calculation });
    res.status(200).json({ success: true, calculation, taxCode: TAX_CODE });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

exports.isActive = catchAsyncErrors(async (req, res, next) => {
  try {
    if (!req.user._id) {
      return next(new ErrorHandler("No user found", 400));
    }
    const userInformation = await UserInformation.findOne({ user_id: req.user._id });

    if (!userInformation) {
      return next(new ErrorHandler("No user data found", 400));
    }
    const subscription = await stripe.subscriptions.retrieve(userInformation.subscription_details.subscription_id);
    if (!subscription) {
      return next(new ErrorHandler("Subscription not found", 400));
    }
    if (subscription.status === 'active') {
      res.status(200).json({ success: true, msg: "Subscription is Active" });
    } else {
      res.status(500).json({ success: false, msg: "Subscription is InActive" });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error });
  }
});

// Creates an order from admin 
exports.createOrderWithoutPayment = catchAsyncErrors(async (req, res, next) => {
  try {
    // Get the user ID from the authenticated user or request data
    const userId = req.body.userId;
    const orderId = req.body.orderId;
    const {
      email,
      last_name,
      first_name,
      // tax,
      billingAddress,
      shippingAddress,
      orderData,
      totalAmount,
      referrer,
      referrerName,
      dealOwner,
      customerIp,
      orderedBy,
      discount,
      couponData
    } = req.body;


    // Save Addresses
    let user;
    if (userId !== "Guest") {
      user = await UserModel.findById(userId);
      if (!user) {
        return next(new ErrorHandler("User not found", 404));
      }
      // Update user fields
      user.referrerName = referrerName;
      user.dealOwner = dealOwner;
      user.referrer = referrer;
      user.customerIp = customerIp;

      // Save user updates
      await user.save();

      let billingAddressFind = await billingAddressModal.findOne({ userId: user._id });
      if (!billingAddressFind) {
        billingAddressFind = new billingAddressModal({
          userId: user._id,
          billing_address: billingAddress,
        });
      } else {
        billingAddressFind.billing_address = billingAddress;
      }

      let shippingAddressFind = await shippingAddressModal.findOne({ userId: user._id });

      if (!shippingAddressFind) {
        shippingAddressFind = new shippingAddressModal({
          userId: user._id,
          shipping_address: shippingAddress,
        });
      }

      await billingAddressFind.save();
      await shippingAddressFind.save();
    }

    // Check if orderId is provided
    if (orderId) {
      // Update existing order using findByIdAndUpdate
      const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        {
          email,
          last_name,
          first_name,
          billingAddress,
          shippingAddress,
          orderData,
          totalAmount,
          referrer,
          referrerName,
          dealOwner,
          customerIp,
          orderedBy,
          discount,
        },
        { new: true, runValidators: true }
      );

      if (!updatedOrder) {
        return next(new ErrorHandler("Order not found", 404));
      }

      res.status(200).json({
        success: true,
        message: 'Order updated successfully',
        order: updatedOrder,
      });
    } else {

      // Create a new order linked to the specific user
      const order = new Order({
        user: userId === 'Guest' ? null : userId,
        company: userId === 'Guest' ? null : user.companyID, // Link the order to the specific user
        email,
        last_name,
        first_name,
        subscription_details: orderData.subscription_details,
        smartAccessories: orderData.smartAccessories,
        addaddons: orderData.addaddons,
        shipping_method: orderData.shipping_method,
        totalAmount,
        // tax,
        type: 'combined',
        shippingAddress,
        billingAddress,
        orderNotes: orderData.orderNotes,
        isGuest: userId === 'Guest' ? true : false,
        paymentStatus: 'pending',
        discount,
      });

      if (couponData !== null && Object.keys(couponData).length !== 0) {
        order.isCouponUsed = true;
        order.coupons = {
          code: couponData.appliedCouponCode,
          value: couponData.discountValue
        };
        const logCoupons = await UserCouponAssociation.findOneAndUpdate(
          { userId: userId, couponCode: couponData.appliedCouponCode },
          { $setOnInsert: { userId: userId }, $inc: { usageCount: 1 } },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        )
        console.log(logCoupons);
      }
      // Save the order to the database
      const newOrder = await order.save();
      console.log(newOrder, "newOrder")
      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        order,
      });
    }


  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error });
  }
});

// Creates an order and send invoice
exports.createOrderWithoutPaymentAndSendInvoice = catchAsyncErrors(async (req, res, next) => {
  try {
    // Get the user ID from the authenticated user or request data
    let orderNumber;
    const userId = req.body.userId;
    const orderId = req.body.orderId;
    const {
      email,
      last_name,
      first_name,
      // tax,
      billingAddress,
      shippingAddress,
      orderData,
      totalAmount,
      referrer,
      referrerName,
      dealOwner,
      customerIp,
      orderedBy,
      discount
    } = req.body;


    // Save Addresses
    let user;
    if (userId !== "Guest") {
      user = await UserModel.findById(userId);
      if (!user) {
        return next(new ErrorHandler("User not found", 404));
      }
      // Update user fields
      user.referrerName = referrerName;
      user.dealOwner = dealOwner;
      user.referrer = referrer;
      user.customerIp = customerIp;

      // Save user updates
      await user.save();

      let billingAddressFind = await billingAddressModal.findOne({ userId: user._id });
      if (!billingAddressFind) {
        billingAddressFind = new billingAddressModal({
          userId: user._id,
          billing_address: billingAddress,
        });
      } else {
        billingAddressFind.billing_address = billingAddress;
      }

      let shippingAddressFind = await shippingAddressModal.findOne({ userId: user._id });

      if (!shippingAddressFind) {
        shippingAddressFind = new shippingAddressModal({
          userId: user._id,
          shipping_address: shippingAddress,
        });
      }

      await billingAddressFind.save();
      await shippingAddressFind.save();
    }

    // Check if orderId is provided
    if (orderId) {
      // Update existing order using findByIdAndUpdate
      const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        {
          email,
          last_name,
          first_name,
          billingAddress,
          shippingAddress,
          orderData,
          totalAmount,
          referrer,
          referrerName,
          dealOwner,
          customerIp,
          orderedBy,
          discount,
        },
        { new: true, runValidators: true }
      );

      if (!updatedOrder) {
        return next(new ErrorHandler("Order not found", 404));
      }

      res.status(200).json({
        success: true,
        message: 'Order updated successfully',
        order: updatedOrder,
      });
      orderNumber = updatedOrder.orderNumber;
      orderidtoredirect = updatedOrder._id
    } else {

      // Create a new order linked to the specific user
      const order = new Order({
        user: userId === 'Guest' ? null : userId,
        company: userId === 'Guest' ? null : user.companyID, // Link the order to the specific user
        email,
        last_name,
        first_name,
        subscription_details: orderData.subscription_details,
        smartAccessories: orderData.smartAccessories,
        addaddons: orderData.addaddons,
        shipping_method: orderData.shipping_method,
        totalAmount,
        // tax,
        type: 'combined',
        shippingAddress,
        billingAddress,
        orderNotes: orderData.orderNotes,
        isGuest: userId === 'Guest' ? true : false,
        paymentStatus: 'pending',
        discount,
      });

      // Save the order to the database
      const newOrder = await order.save();
      console.log(newOrder, "newOrder")
      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        order,
      });
      orderNumber = newOrder.orderNumber;
      orderidtoredirect = newOrder._id;
    }


    const transporter = nodemailer.createTransport({
      service: "Gmail",
      port: 587,
      auth: {
        user: process.env.NODMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASS,
      },
    });
    const rootDirectory = process.cwd();
    const uploadsDirectory = path.join(rootDirectory, "uploads", "Logo.png");

    const message = {
      from: "OneTapConnect:otcdevelopers@gmail.com",
      to: email,
      subject: `Welcome to OneTapConnect! Your Subscription is Pending`,
      html: `
  <!DOCTYPE html>
  <html>
  
  <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="initial-scale=1, width=device-width" />
  </head>
  
  <body style="margin: 0; line-height: normal; font-family: 'Assistant', sans-serif;">
  
      <div style="background-color: #f2f2f2; padding: 20px; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #000; border-radius: 20px 20px 0 0; padding: 20px 15px; text-align: center;">
          <img src="cid:logo">
          </div>
          <div style="background-color: #fff; border-radius: 0 0 20px 20px; padding: 20px; color: #333; font-size: 14px;">
          <!-- <div><img src="https://onetapconnect.com/wp-content/uploads/2023/05/OneTapConnect-logo-2023.png" width="150px"/></div> -->
          <h4><center>Invoice ${orderNumber}</center></h4>
          </br>
          <p>Hi ${first_name} ${last_name},<br/>
          An invoice has been create for you by  ${orderedBy}.</p>
          <!-- <div><button>Accept invitation</button><button>Reject</button></div> -->
          <div style="display: flex; justify-content: space-evenly; gap: 25px; margin-top: 25px;">
            <div style="flex: 1; border-radius: 4px; overflow: hidden; background-color: #e65925; justify-content: center; display: flex; width:30%; margin: 0 12%;">
                <a href="${process.env.FRONTEND_URL}/ordersummary/${orderidtoredirect}" style="display: inline-block; width: 83%; padding: 10px 20px; font-weight: 600; color: #fff; text-align: center; text-decoration: none;">View invoice</a>
            </div>
            
        </div> <br/>
        <p>Your privacy in important to us. By placing the order, you agree to<a href="https://app.1tapconnect.com/terms-of-use"> our terms of service,</a><a href="https://app.1tapconnect.com/privacy-policy"> privacy policy</a> and <a href="https://app.1tapconnect.com/refund-policy">refund policy.</a> </p>
        <br/>
        <h5><center>Technical issue?</center></h5>
          <p>In case you facing any technical issue, please contact our support team <a href="https://onetapconnect.com/contact-sales/">here</a>.</p>
      </div>
  
  </body>
  
  </html>
`,
      attachments: [
        {
          filename: "Logo.png",
          path: uploadsDirectory,
          cid: "logo",
        },
      ],
    };

    transporter.sendMail(message, (err, info) => {
      if (err) {
        console.log(err);
      } else {
        console.log(info.response);
      }
    });


  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error });
  }
});

// Creates an order
exports.createOrder = catchAsyncErrors(async (req, res, next) => {
  console.log("called")
  try {
    // Get the user ID from the authenticated user or request data
    const userId = req.body.userId;
    const orderData = req.body.createOrderData
    const {
      userData,
      shipping_method,
      cardDetails,
      smartAccessories,
      totalAmount,
      tax,
      billingAddress,
      shippingAddress,
      selectedCard,
      existingcard,
      saveAddress,
      selectedEditAddress,
      email,
      sumTotalWeights,
      totalShipping,
      serviceCode,
    } = req.body;
    console.log(userId, "user id guest or not....")
    console.log(totalShipping, "totalShipping------------------------------------------")
    console.log(shipping_method, "shipping_method------------------------------------------")
    if (userId !== 'Guest') {
      let userInformation = await UserInformation.findOne({ user_id: userId });
      userInformation.subscription_details.customer_id = orderData.customerID
      const userInformationData = await userInformation.save();
    }
    if (userId === "Guest") {
      isGuest = true;
    }

    const totalAmountInCents = Math.round(totalAmount * 100);
    const type = (smartAccessories ? "smartAccessories" : "")

    // // stripe payment starts
    // const attachedPaymentMethod = await stripe.paymentMethods.attach(orderData.paymentToken, {
    //   customer: orderData.customerID,
    // });

    //     let payment_method
    // //     if(selectedCard){
    // // // payment_method = 
    // //     }else{

    // //     }
    // create tax
    const calculation = await stripe.tax.calculations.create({
      currency: 'usd',
      customer_details: {
        address: {
          line1: shippingAddress.line1,
          line2: shippingAddress.line,
          postal_code: shippingAddress.postal_code,
          state: shippingAddress.state,
          country: shippingAddress.country,
        },
        address_source: 'shipping',
      },
      line_items: [
        {
          amount: totalAmount * 100,
          reference: 'smart accessories',
        },
      ],
    });

    let attachedPaymentMethod;
    if (!selectedCard && existingcard === false) {
      attachedPaymentMethod = await stripe.paymentMethods.attach(orderData.paymentToken, {
        customer: orderData.customerID,
      });
    }
    let paymentIntent;
    if (!selectedCard && existingcard === false) {
      paymentIntent = await stripe.paymentIntents.create({
        amount: calculation.amount_total,
        currency: 'usd',
        automatic_payment_methods: { enabled: true, allow_redirects: "never" },
        customer: orderData.customerID,
        description: "test description",
        // payment_method: orderData.paymentToken,
        payment_method: attachedPaymentMethod.id, // when new card is used
        receipt_email: orderData.email,
      });
    } else {
      paymentIntent = await stripe.paymentIntents.create({
        amount: calculation.amount_total,
        currency: 'usd',
        automatic_payment_methods: { enabled: true, allow_redirects: "never" },
        customer: orderData.customerID,
        description: "test description",
        payment_method: orderData.paymentToken,
        // payment_method: attachedPaymentMethod.id, // when new card is used
        receipt_email: orderData.email,
      });
    }
    console.log("paymentIntent")
    console.log(paymentIntent)
    console.log("paymentIntent")

    // const transaction = await stripe.tax.transactions.createFromCalculation({
    //   calculation: calculation.id,
    //   reference: 'myOrder_123',
    // });
    // console.log("transaction")
    // console.log(transaction)
    // console.log("transaction")

    // const paymentIntentUpdate = await stripe.paymentIntents.update(
    //   paymentIntent.id,
    //   {
    //     metadata: {
    //       tax_transaction: transaction.id,
    //     },
    //   }
    // );
    // console.log("paymentIntentUpdate")
    // console.log(paymentIntentUpdate)
    // console.log("paymentIntentUpdate")
    let user;
    if (userId !== "Guest") {
      user = await UserModel.findById(userId);
      if (!user) {
        return next(new ErrorHandler("User not found", 404));
      }

      let billingAddressFind = await billingAddressModal.findOne({ userId: user._id });
      if (!billingAddressFind) {
        billingAddressFind = new billingAddressModal({
          userId: user._id,
          billing_address: billingAddress,
        });
      } else {
        billingAddressFind.billing_address = billingAddress;
      }

      let shippingAddressFind = await shippingAddressModal.findOne({ userId: user._id });

      if (!shippingAddressFind) {
        shippingAddressFind = new shippingAddressModal({
          userId: user._id,
          shipping_address: [],
        });
      }
      // if(saveAddress) {
      //   shippingAddressFind.shipping_address.push(shippingData);
      // }
      if (saveAddress) {
        if (selectedEditAddress) {
          const index = shippingAddressFind.shipping_address.findIndex(
            (address) => address._id.toString() === selectedEditAddress._id.toString()
          );
          if (index !== -1) {
            // Replace the existing address with the updated address
            shippingAddressFind.shipping_address[index] = shippingAddress;
          }
        } else {
          // Add a new address
          shippingAddressFind.shipping_address.push(shippingAddress);
        }
      }

      await billingAddressFind.save();
      await shippingAddressFind.save();
    }


    const paymentDate = new Date();
    // res.status(200).json({ success: true, client_secret: paymentIntent.client_secret });

    if (paymentIntent) {
      // Payment is successful, create the order in your database

      // Create a new order linked to the specific user
      const order = new Order({
        paymentStatus: "paid",
        user: userId === 'Guest' ? null : userId,
        company: userId === 'Guest' ? null : user.companyID,
        first_name: userId === 'Guest' ? userData.first_name : user.first_name,
        last_name: userId === 'Guest' ? userData.last_name : user.last_name,
        email: userId === 'Guest' ? userData.email : user.email,
        contact: userId === 'Guest' ? userData.contact : user.contact, // Link the order to the specific user
        smartAccessories,
        totalAmount,
        tax,
        type,
        transactionId: paymentIntent.id,
        paymentDate,
        shippingAddress,
        billingAddress,
        sumTotalWeights: sumTotalWeights,
        totalShipping: totalShipping,
        serviceCode: serviceCode,
        isGuest: userId === 'Guest' ? true : false,
        userShippingOrderNote: userData?.userShippingOrderNote === undefined ? '' : userData?.userShippingOrderNote,
        referredby: userData?.referredby === undefined ? '' : userData?.referredby,
        referredName: userData.referredName,
        card_details: {
          // nameOnCard: cardDetails.cardName,
          cardNumber: cardDetails.cardNumber,
          cardExpiryMonth: cardDetails.cardExpiryMonth,
          cardExpiryYear: cardDetails.cardExpiryYear,
          brand: cardDetails.brand,
        },
      });
      // Save the order to the database
      const orderData = await order.save();



      // const purchasedSmartAccessory = new PurchasedSmartAccessoryModal({
      //   company: userId === 'Guest' ? null : user.companyID,
      //   // user : userId === 'Guest' ? null : userId,
      //   productId: smartAccessories.productId,
      //   variationId: smartAccessories.variationId  ,
      //   productName: smartAccessories.productName ,
      //   subtotal :  smartAccessories.subtotal   ,
      //   quantity: smartAccessories.quantity ,
      //   price:   smartAccessories.price ,
      //   status:  smartAccessories.status  ,
      //   uniqueId:  smartAccessories.uniqueId  ,
      // })
      // const purchased_smartAccessoryData = await purchasedSmartAccessory.save();
      // console.log(purchased_smartAccessoryData, "purchased_smartAccessoryData............")

      // const company = await Company_informationModel.findById({ _id :orderData.company})

      // company.smartAccessories.push(...smartAccessories);

      // const companyData = company.save();
      console.log("orderData")
      console.log(orderData)
      console.log("orderData")
      const transaction = await stripe.tax.transactions.createFromCalculation({
        calculation: calculation.id,
        reference: orderData._id.toString(),
      });
      console.log("transaction")
      console.log(transaction)
      console.log("transaction")

      const paymentIntentUpdate = await stripe.paymentIntents.update(
        paymentIntent.id,
        {
          metadata: {
            tax_transaction: transaction.id,
          },
        }
      );
      console.log("paymentIntentUpdate")
      console.log(paymentIntentUpdate)
      console.log("paymentIntentUpdate")
      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        order,
        clientSecret: paymentIntent.client_secret
      });
      await sendpurchaseOrderconfirmationEmail(userId === 'Guest' ? userData.email : user.email, shippingAddress, smartAccessories, order, shipping_method);
    } else {
      // Payment confirmation failed
      res.status(400).json({
        success: false,
        message: 'Payment confirmation failed',
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error });
  }
});


async function sendpurchaseOrderconfirmationEmail(customeremail, shippingAddress, smartAccessories, order, shipping_method, totalShipping) {
  try {
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      port: 587,
      auth: {
        user: process.env.NODMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASS,
      },
    });
    let productsHTML = '';
    let totalAmount = 0;
    console.log(smartAccessories, "smartAccessories")
    console.log(smartAccessories, "smartAccessories")
    const allProducts = await ProductModel.find();
    console.log("allProducts ---------------------------------------------------------------------------------", allProducts)
    // smartAccessories.forEach((smartAccessory) => {
    //   console.log(smartAccessory, "smartAccessory");

    //   const matchingProduct = allProducts.find(product => product._id === smartAccessory.productId);

    //   if (matchingProduct) {
    //     // If variationId is provided, find matching variation
    //     const matchingVariation = matchingProduct.variations?.find(variation => variation._id === smartAccessory.variationId);

    //     // Use the matching variation if found, otherwise, use the main product details
    //     const selectedProduct = matchingVariation || matchingProduct;

    //     productsHTML += `
    //       <tr>
    //         <td>&nbsp;&nbsp;&nbsp;${selectedProduct.Type || selectedProduct.name}</td>
    //         <td style="text-align: center;">&nbsp;&nbsp;${smartAccessory.quantity}</td>
    //         <td></td>
    //         <td>&nbsp;&nbsp;$ ${selectedProduct.price}</td>
    //       </tr>
    //     `;
    //     totalAmount += parseFloat(selectedProduct.price);
    //   }
    // });
    smartAccessories?.forEach((smartAccessory) => {
      const matchingProduct = allProducts.find(product => product._id.toString() === smartAccessory.productId.toString());
      const matchingVariation = matchingProduct?.variations?.find(variation => variation._id.toString() === smartAccessory.variationId.toString());
      const selectedProduct = matchingVariation || matchingProduct;

      // console.log(matchingProduct, "matchingProduct")
      // console.log(matchingVariation, "matchingVariation")
      // console.log(selectedProduct, "selectedProduct")
      console.log("selectedProduct")
      console.log("selectedProduct")
      productsHTML += `
        <tr>
          <td>&nbsp;&nbsp;&nbsp;${matchingVariation ? selectedProduct?.Type : selectedProduct?.name}</td>
          <td style="text-align: center;">&nbsp;&nbsp;${smartAccessory.quantity}</td>
          <td></td>
          <td>&nbsp;&nbsp;$ ${smartAccessory.price}</td>
        </tr>
      `;
      totalAmount += parseFloat(smartAccessory.price);
    });

    const rootDirectory = process.cwd();
    const uploadsDirectory = path.join(rootDirectory, "uploads", "Logo.png");

    const mailOptions = {
      from: "OneTapConnect:otcdevelopers@gmail.com", // Replace with your email
      to: customeremail,
      // to: "tarun.syndell@gmail.com",
      subject: 'OneTapConnect! Order Confirmation',
      // text: `Your order with ID ${orderId} has been successfully placed. Thank you for shopping with us!`,
      html: `
      <!DOCTYPE html>
<html>

<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="initial-scale=1, width=device-width" />
</head>

<body style="margin: 0; line-height: normal; font-family: 'Assistant', sans-serif;">

  <div style="background-color: #f2f2f2; padding: 20px; max-width: 600px; margin: 0 auto;">
    <div style="background-color: #000; border-radius: 20px 20px 0 0; padding: 20px 15px; text-align: center;">
      <img src="cid:logo">
    </div>
    <div style="background-color: #fff; border-radius: 0 0 20px 20px; padding: 20px; color: #333; font-size: 14px;">
      <!-- <div><img src="https://onetapconnect.com/wp-content/uploads/2023/05/OneTapConnect-logo-2023.png" width="150px"/></div> -->
      <h3>Thanks for your order!</h3>
      <p>Dear ${shippingAddress.first_name},<br />
      <p>We are delighted that you have found something you like!</p>
      <p>Below, you will find a summary of your order details:</p>

      <table style="width: 100%;">
  <tr>
    <td style="width: 50%; vertical-align: top;">
      <p>
        Delivery address:<br />
        ${shippingAddress.line1}<br />
        ${shippingAddress.line2}<br />
        ${shippingAddress.city}<br />
        ${shippingAddress.state}<br />
        ${shippingAddress.country}<br />
        ${shippingAddress.postal_code}<br />
      </p>
    </td>
    <td style="width: 50%; vertical-align: top;">
      <p>
        Order Number: <b>${order.orderNumber}</b><br />
        Date: ${new Date(order.createdAt).toLocaleDateString()}
      </p>
    </td>
  </tr>
</table>

      <!-- Invoice Table -->
      <table style="width: 100%; margin-top: 20px; border-collapse: collapse;">
        <thead>
          <tr style="background-color: #e65925; color: #fff; text-align: left;">
            <th style="padding: 10px;">Products</th>
            <!-- <th style="padding: 10px;">Description</th> -->
            <!-- <th style="padding: 10px;">Unit Price</th> -->
            <th style="padding: 10px;text-align: center;">Quantity</th>
            <th></th>
            <th style="padding: 10px;">Price</th>
          </tr>
        </thead>
        <tbody>
          <!-- Add your invoice items dynamically here -->
          ${productsHTML}
          <tr style="border-bottom: 1px solid #ccc;">
            <td></td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
          <tr style="border-bottom: 1px solid #ccc;">
            <td></td>
            <td></td>
            <td style="text-align: end;"><b>Sub-Total:</b></td>
            <td>&nbsp;&nbsp;$ ${totalAmount.toFixed(2)}</td>
          </tr>
          <tr style="border-bottom: 1px solid #ccc;">
            <td></td>
            <td></td>
            <td style="text-align: end;"><b>Shipping:</b></td>
            <td>&nbsp;&nbsp;${shipping_method?.price}</td>
          </tr>
          <tr style="border-bottom: 1px solid #ccc;">
            <td></td>
            <td></td>
            <td style="text-align: end;"><b>Total:</b></td>
            <td>&nbsp;&nbsp;$ ${order.totalAmount}</td>
          </tr>
        </tbody>
      </table>
      <p>Payment method: Credit / Debit Card</p>
      <p>Please keep this email for your records.</p>
      <div style="display: flex; justify-content: space-evenly; gap: 25px; ">
      </div>
      <h3>Technical issue?</h3>
      <p>In case you facing any technical issue, please contact our support team <a href="https://onetapconnect.com/contact-sales/">here</a>.</p>
    </div>

</body>

</html>
`,
      attachments: [
        {
          filename: "Logo.png",
          path: uploadsDirectory,
          cid: "logo",
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    console.log('Order confirmation email sent successfully');
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
  }
}

exports.fetchCards = catchAsyncErrors(async (req, res, next) => {
  const { customerID } = req.body
  console.log(req.body)
  let paymentMethods = await stripe.paymentMethods.list({
    customer: customerID,
    type: 'card',
  });

  const customer = await stripe.customers.retrieve(customerID);

  const defaultPaymentMethodID = customer.invoice_settings.default_payment_method;

  let primaryPaymentMethod = null;
  paymentMethods.data.forEach((paymentMethod) => {
    paymentMethod.isPrimary = paymentMethod.id === defaultPaymentMethodID;
  });
  console.log(paymentMethods)

  // res.send(primaryPaymentMethod)
  res.send(paymentMethods)
})


exports.updateCards = catchAsyncErrors(async (req, res, next) => {
  const { paymentData } = req.body;
  // const isPrimary = req.body.isPrimary 
  const { type } = paymentData;
  if (type === 'create') {
    const { customerID, paymentID, cardId, isPrimary } = paymentData;
    let attachedPaymentMethod;

    attachedPaymentMethod = await stripe.paymentMethods.attach(paymentID, {
      customer: customerID,
    });
    if (isPrimary) {
      await stripe.customers.update(customerID, {
        invoice_settings: {
          default_payment_method: paymentID,
        },
      });
    }
    if (cardId) {
      await stripe.customers.update(customerID, {
        invoice_settings: {
          default_payment_method: cardId.id,
        },
      });
    }

    res.status(200).json({
      success: true,
      paymentData: attachedPaymentMethod,
    });
  } else if (type === 'delete') {
    const { paymentID } = paymentData;
    const deletePaymentMethod = await stripe.paymentMethods.detach(paymentID);
    res.status(200).json({
      success: true,
      message: "Payment Method Deleted successfully",
    });
  } else if (type === 'createNewCustomer') {
    const { paymentID, isPrimary } = paymentData;
    const user = req.user;
    const customer = await stripe.customers.create({
      name: `${user.first_name} ${user.last_name}`,
      email: user.email,
      phone: user.contact,
      address: {
        line1: user.address.line1,
        line2: user.address.line2,
        city: user.address.city,
        state: user.address.state,
        country: user.address.country,
        postal_code: user.address.postal_code,
      },
      expand: ['tax']
    });
    if (!customer) {
      return res.status(501).json({
        success: false,
        message: "Internal Server Error",
      });
    }
    const updatedUserInfo = await UserInformation.findOneAndUpdate(
      { user_id: user._id },
      { $set: { 'subscription_details.customer_id': customer.id } },
      { new: true }
    );
    if (!updatedUserInfo) {
      return res.status(501).json({
        success: false,
        message: "Internal Server Error",
      });
    }

    const attachedPaymentMethod = await stripe.paymentMethods.attach(paymentID, {
      customer: customer.id,
    });
    const setPrimary = await stripe.customers.update(customer.id, {
      invoice_settings: {
        default_payment_method: paymentID,
      },
    });
    if (!attachedPaymentMethod || !setPrimary) {
      return res.status(501).json({
        success: false,
        message: "Internal Server Error",
      });
    }
    res.status(200).json({
      success: true,
      paymentData: attachedPaymentMethod,
    });
  } else {
    res.status(501).json({
      success: false,
      message: "Internal Server Error",
    });
  }
})


exports.fetchTaxrates = catchAsyncErrors(async (req, res, next) => {
  const registrations = await stripe.tax.registrations.list({
    status: 'all',
  });
  res.send(registrations)
})
exports.updateCustomerCreditBalance = catchAsyncErrors(async (req, res, next) => {
  const { cusId } = req.body;

  const balanceTransactions = await stripe.customers.listBalanceTransactions(
    cusId
  );
  res.send({ data: balanceTransactions.data[0].ending_balance / 100 })
})


exports.purchaseaddon = catchAsyncErrors(async (req, res, next) => {
  try {
    const userId = req.body.userId;
    const companyID = req.user.companyID;
    const {
      totalAmount,
      tax,
      billingAddress,
      shippingAddress,
      addaddons,
      selectedCard,
      existingcard,
      saveAddress,
      selectedEditAddress,
      shipping_method,
      first_name,
      email,
      contact,
      last_name,
      createOrderData,
      couponData
    } = req.body;
    const type = (addaddons ? "AddonPurchase" : "")
    const paymentDate = new Date();

    // payment 
    let attachedPaymentMethod;
    if (!selectedCard && existingcard === false) {
      attachedPaymentMethod = await stripe.paymentMethods.attach(createOrderData.paymentToken, {
        customer: createOrderData.customerID,
      });
    }

    const calculation = await stripe.tax.calculations.create({
      currency: 'usd',
      customer_details: {
        address: {
          line1: shippingAddress.line1,
          line2: shippingAddress.line,
          postal_code: shippingAddress.postal_code,
          state: shippingAddress.state,
          country: shippingAddress.country,
        },
        address_source: 'shipping',
      },
      line_items: [
        {
          amount: totalAmount * 100,
          reference: 'smart accessories',
        },
      ],
    });

    let paymentIntent;
    if (!selectedCard && existingcard === false) {
      paymentIntent = await stripe.paymentIntents.create({
        amount: calculation.amount_total,
        currency: 'usd',
        automatic_payment_methods: { enabled: true, allow_redirects: "never" },
        customer: createOrderData.customerID,
        description: "test description",
        // payment_method: createOrderData.paymentToken,
        payment_method: attachedPaymentMethod.id, // when new card is used
        receipt_email: email,
      });
    } else {
      paymentIntent = await stripe.paymentIntents.create({
        amount: calculation.amount_total,
        currency: 'usd',
        automatic_payment_methods: { enabled: true, allow_redirects: "never" },
        customer: createOrderData.customerID,
        description: "test description",
        payment_method: createOrderData.paymentToken,
        // payment_method: attachedPaymentMethod.id, // when new card is used
        receipt_email: email,
      });
    }

    console.log("paymentIntent")
    console.log(paymentIntent)
    console.log("paymentIntent")



    const order = new Order({
      paymentStatus: "paid",
      user: userId,
      company: companyID,
      shippingAddress,
      billingAddress,
      totalAmount,
      tax,
      first_name,
      email,
      contact,
      last_name,
      type,
      addaddons,
      paymentDate,
      shipping_method,
      transactionId: paymentIntent.id
    });

    if (couponData !== null && Object.keys(couponData).length !== 0) {
      order.isCouponUsed = true;
      order.coupons = {
        code: couponData.appliedCouponCode,
        value: couponData.discountValue
      };
      const logCoupons = await UserCouponAssociation.findOneAndUpdate(
        { userId: userId, couponCode: couponData.appliedCouponCode },
        { $setOnInsert: { userId: userId }, $inc: { usageCount: 1 } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      )
      console.log(logCoupons);
    }
    // Ensure totalAmount is treated as a number
    // const numericTotalAmount = parseFloat(totalAmount);

    // Save the order to the database
    const orderData = await order.save();

    console.log("orderData")
    console.log(orderData)
    console.log("orderData")
    const transaction = await stripe.tax.transactions.createFromCalculation({
      calculation: calculation.id,
      reference: orderData._id.toString(),
    });
    console.log("transaction")
    console.log(transaction)
    console.log("transaction")

    const paymentIntentUpdate = await stripe.paymentIntents.update(
      paymentIntent.id,
      {
        metadata: {
          tax_transaction: transaction.id,
        },
      }
    );
    console.log("paymentIntentUpdate")
    console.log(paymentIntentUpdate)
    console.log("paymentIntentUpdate")

    // Update UserInformation document
    // Update UserInformation document
    console.log(addaddons)
    const updatedUserInformation = await UserInformation.updateMany(
      { company_ID: companyID, 'subscription_details.plan': { $ne: null } },
      {
        $push: {
          'subscription_details.addones': { $each: addaddons.map((addon) => addon) }
        },
        $inc: { 'subscription_details.total_amount': totalAmount }
      },
      { new: true } // Return the updated document
    );


    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order,
      userInformation: updatedUserInformation,
      clientSecret: paymentIntent.client_secret
    });
  }

  catch (error) {
    console.error(error);
    res.status(500).json({ message: error });
  }
})


exports.addonPurchase = catchAsyncErrors(async (req, res, next) => {
  try {
    // const paymentintentID  = req.body.id
    const paymentToken = req.body.paymentToken;
    const customerID = req.body.customerID;
    const Address = req.body.billingAddress;
    const selectedCard = req.body.selectedCard;
    const newUser = req.body.newUser;
    const primary_card = req.body.primary_card;
    const totalAddons_value = req.body.totalAddons_value;
    console.log("..........")
    console.log(primary_card, "/////////////////////////////////////")
    console.log("..........")

    let attachedPaymentMethod;
    if (!selectedCard) {
      attachedPaymentMethod = await stripe.paymentMethods.attach(paymentToken, {
        customer: customerID,
      });
    }
    console.log(attachedPaymentMethod)


    const calculation = await stripe.tax.calculations.create({
      currency: 'usd',
      customer_details: {
        address: {
          line1: Address.line1,
          line2: Address.line,
          postal_code: Address.postal_code,
          state: Address.state,
          country: Address.country,
        },
        address_source: 'shipping',
      },
      line_items: [
        {
          amount: totalAddons_value * 100,
          reference: 'addonref',
        },
      ],
    });


    let paymentIntent;
    if (!selectedCard && existingcard === false) {
      paymentIntent = await stripe.paymentIntents.create({
        amount: calculation.amount_total,
        currency: 'usd',
        automatic_payment_methods: { enabled: true, allow_redirects: "never" },
        customer: createOrderData.customerID,
        description: "test description",
        // payment_method: createOrderData.paymentToken,
        payment_method: attachedPaymentMethod.id, // when new card is used
      });
    } else {
      paymentIntent = await stripe.paymentIntents.create({
        amount: calculation.amount_total,
        currency: 'usd',
        automatic_payment_methods: { enabled: true, allow_redirects: "never" },
        customer: createOrderData.customerID,
        description: "Addon purchase",
        payment_method: paymentToken,
        // payment_method: attachedPaymentMethod.id, // when new card is used
      });
    }

    if (!paymentIntent) {
      throw new Error('addon purchase creation failed');
    }
    const transaction = await stripe.tax.transactions.createFromCalculation({
      calculation: calculation.id,
      reference: paymentIntent.id,
    });

    const paymentIntentUpdate = await stripe.paymentIntents.update(
      paymentIntent.id,
      {
        metadata: {
          tax_transaction: transaction.id,
        },
      }
    );

    return res.status(200).json({ success: true, client_secret: paymentIntent.client_secret });

  } catch (error) {
    console.error(error);
    // handle subscription failure
    try {
      const detachPT =
        attachedPaymentMethod &&
        attachedPaymentMethod.id &&
        (await stripe.paymentMethods.detach(attachedPaymentMethod.id));

      console.error(
        'Cleanup performed after failure:',
        detachPT,
      );
    } catch (cleanupError) {
      console.error('Error during cleanup:', cleanupError);
    }
    res.status(500).json({ success: false, error: error.message });
  }
});
// ////

// exports.createDummt = catchAsyncErrors(async (req, res, next) => {


// })
// ////

exports.purchaseusers = catchAsyncErrors(async (req, res, next) => {
  try {
    const userId = req.body.userId;
    const companyID = req.user.companyID;
    const {
      totalAmount,
      tax,
      billingAddress,
      shippingAddress,
      addusers,
      selectedCard,
      existingcard,
      saveAddress,
      selectedEditAddress,
      shipping_method,
      first_name,
      email,
      contact,
      last_name,
      createOrderData,
      plandata,
      customerID,
      subscriptionId,
      paymentToken,
      ammount
    } = req.body;
    const ordertype = (addusers ? "UserPurchase" : "")
    const paymentDate = new Date();
    console.log("1")

    const { type, planName } = plandata;
    const productID = type === 'monthly'
      ? planName === 'Professional' ? Product_Professional_monthly : Product_Team_monthly
      : planName === 'Professional' ? Product_Professional_Yearly : Product_Team_Yearly;
    let attachedPaymentMethod;
    console.log("2")
    if (!selectedCard && existingcard === false) {
      attachedPaymentMethod = await stripe.paymentMethods.attach(paymentToken, {
        customer: customerID,
      });
    }
    console.log("3")

    console.log(ammount, totalAmount)
    const price = await stripe.prices.create({
      currency: 'usd',
      unit_amount: (ammount + totalAmount) * 100,
      product: productID,
      recurring: {
        interval: type === "monthly" ? "month" : "year",
        interval_count: 1
      },
    });
    console.log("4")
    console.log(price)

    console.log("called0")
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    console.log("called1")
    let myPayment;
    if (selectedCard) {
      myPayment = await stripe.subscriptions.update(subscriptionId, {
        items: [{
          id: subscription.items.data[0].id,
          price: price.id
        }]
      });
    } else if (existingcard) {
      myPayment = await stripe.subscriptions.update(subscriptionId, {
        items: [{
          id: subscription.items.data[0].id,
          price: price.id
        }]
      });
    }
    else {
      myPayment = await stripe.subscriptions.update(subscriptionId, {
        items: [{
          id: subscription.items.data[0].id,
          price: price.id
        }]
      });


      console.log("myPayment");
      console.log(myPayment);
      console.log("myPayment");
      // const latestInvoice = await stripe.invoices.retrieve(myPayment.latest_invoice);
      // const paymentIntent = await stripe.paymentIntents.retrieve(
      //   latestInvoice.payment_intent
      // );




      // // Remove the existing item from the subscription
      // console.log(myPayment);
      // const latestInvoice = await stripe.invoices.retrieve(myPayment.latest_invoice);
      // const paymentIntent = await stripe.paymentIntents.retrieve(
      //   latestInvoice.payment_intent
      // );

      // Save payment ID and user details in your database after successful payment
    }

    const order = new Order({
      user: userId,
      company: companyID,
      shippingAddress,
      billingAddress,
      totalAmount,
      tax,
      first_name,
      email,
      contact,
      last_name,
      type: ordertype,
      addusers: { ...addusers },
      paymentDate,
      shipping_method,
    });



    // Save the order to the database
    const orderData = await order.save();

    console.log("orderData")
    console.log(orderData)
    console.log("orderData")




    // Update UserInformation document
    // Update UserInformation document
    console.log(addusers)
    const updatedUserInformation = await UserInformation.updateMany(
      { company_ID: companyID, 'subscription_details.plan': { $ne: null } },
      {
        $inc: {
          'subscription_details.total_user.0.additionalUser': addusers.addusercount,
          'subscription_details.total_amount': totalAmount
        }
      },
      { new: true } // Return the updated document
    );


    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order,
      userInformation: updatedUserInformation,
    });
  }

  catch (error) {
    console.error(error);
    res.status(500).json({ message: error });
  }
})


// ---------------------------------OTC ADMIN PANEL API ---------------------------------------------------------------------

exports.fetchCardsforOtcAdminPanel = catchAsyncErrors(async (req, res, next) => {
  const { customerID } = req.body
  console.log(req.body)
  let paymentMethods = await stripe.paymentMethods.list({
    customer: customerID,
    type: 'card',
  });

  const customer = await stripe.customers.retrieve(customerID);

  const defaultPaymentMethodID = customer.invoice_settings.default_payment_method;

  let primaryPaymentMethod = null;
  paymentMethods.data.forEach((paymentMethod) => {
    paymentMethod.isPrimary = paymentMethod.id === defaultPaymentMethodID;
  });
  console.log(paymentMethods)

  // res.send(primaryPaymentMethod)
  res.send(paymentMethods)
})

exports.updateCardsforOtcAdminPanel = catchAsyncErrors(async (req, res, next) => {
  const { paymentData, superAdminUserid } = req.body;
  // const isPrimary = req.body.isPrimary 
  const { type } = paymentData;
  if (type === 'create') {
    const { customerID, paymentID, cardId, isPrimary } = paymentData;
    let attachedPaymentMethod;

    attachedPaymentMethod = await stripe.paymentMethods.attach(paymentID, {
      customer: customerID,
    });
    if (isPrimary) {
      await stripe.customers.update(customerID, {
        invoice_settings: {
          default_payment_method: paymentID,
        },
      });
    }
    if (cardId) {
      await stripe.customers.update(customerID, {
        invoice_settings: {
          default_payment_method: cardId.id,
        },
      });
    }

    res.status(200).json({
      success: true,
      paymentData: attachedPaymentMethod,
    });
  } else if (type === 'delete') {
    const { paymentID } = paymentData;
    const deletePaymentMethod = await stripe.paymentMethods.detach(paymentID);
    res.status(200).json({
      success: true,
      message: "Payment Method Deleted successfully",
    });
  } else if (type === 'createNewCustomer') {
    const { paymentID, isPrimary } = paymentData;
    const user = superAdminUserid;
    const customer = await stripe.customers.create({
      name: `${user.first_name} ${user.last_name}`,
      email: user.email,
      phone: user.contact,
      address: {
        line1: user.address.line1,
        line2: user.address.line2,
        city: user.address.city,
        state: user.address.state,
        country: user.address.country,
        postal_code: user.address.postal_code,
      },
      expand: ['tax']
    });
    if (!customer) {
      return res.status(501).json({
        success: false,
        message: "Internal Server Error",
      });
    }
    const updatedUserInfo = await UserInformation.findOneAndUpdate(
      { user_id: user._id },
      { $set: { 'subscription_details.customer_id': customer.id } },
      { new: true }
    );
    if (!updatedUserInfo) {
      return res.status(501).json({
        success: false,
        message: "Internal Server Error",
      });
    }

    const attachedPaymentMethod = await stripe.paymentMethods.attach(paymentID, {
      customer: customer.id,
    });
    const setPrimary = await stripe.customers.update(customer.id, {
      invoice_settings: {
        default_payment_method: paymentID,
      },
    });
    if (!attachedPaymentMethod || !setPrimary) {
      return res.status(501).json({
        success: false,
        message: "Internal Server Error",
      });
    }
    res.status(200).json({
      success: true,
      paymentData: attachedPaymentMethod,
    });
  } else {
    res.status(501).json({
      success: false,
      message: "Internal Server Error",
    });
  }
})

exports.switchToManualRenewalforOtcAdminPanel = catchAsyncErrors(async (req, res, next) => {
  const { subscription_id, userId, type } = req.body.userData

  try {
    if (type === 'cancel') {
      await stripe.subscriptions.update(subscription_id, {
        collection_method: 'send_invoice',
        days_until_due: 7,
      });
      const updatedUserInfo = await UserInformation.findOneAndUpdate(
        { user_id: userId },
        { $set: { 'subscription_details.auto_renewal': false } },
        { new: true }
      );
      console.log('Updated user information:', updatedUserInfo);
      res.status(200).json({ success: true, message: 'Switched to manual renewal. Invoices will be sent for manual payment.' });
    }
    else if (type === 'enable') {
      await stripe.subscriptions.update(subscription_id, {
        collection_method: 'charge_automatically',
      });
      const updatedUserInfo = await UserInformation.findOneAndUpdate(
        { user_id: userId },
        { $set: { 'subscription_details.auto_renewal': true } },
        { new: true }
      );
      console.log('Updated user information:', updatedUserInfo);
      res.status(200).json({ success: true, message: 'Switched to automatic renewal.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});


exports.manualRenewSubscription = catchAsyncErrors(async (req, res, next) => {
  try {
    const { subscriptionId, customerID, paymentToken, plandata } = req.body;

    const { type, planName } = plandata;

    // Retrieve the current subscription
    const currentSubscription = await stripe.subscriptions.retrieve(subscriptionId);
    console.log(currentSubscription)

    // Check if the subscription is eligible for renewal
    if (currentSubscription.status === 'active' && !currentSubscription.cancel_at_period_end) {

      // Determine the product ID based on the plan and type (monthly/yearly)
      const productID = planName === 'Professional' ? Product_Professional_monthly : Product_Team_monthly;

      // Create a new price for the subscription
      const newPrice = await stripe.prices.create({
        currency: 'usd',
        unit_amount: req.body.amount * 100, // Adjust the amount based on your needs
        product: productID,
        tax_behavior: 'exclusive',
        recurring: {
          interval: type === 'monthly' ? 'month' : 'year',
          interval_count: 1,
        },
      });

      // Create a new subscription with the new price
      const renewedSubscription = await stripe.subscriptions.create({
        customer: customerID,
        default_payment_method: paymentToken,
        items: [{ price: newPrice.id }],
        collection_method: 'charge_automatically',
        cancel_at_period_end: false,
        automatic_tax: {
          enabled: true,
        },
      });

      // Update your database or perform any necessary business logic here

      // Return success response
      return res.status(200).json({
        success: true,
        message: 'Subscription manually renewed successfully.',
        renewedSubscriptionID: renewedSubscription.id,
      });
    } else {
      // Subscription is not eligible for renewal
      return res.status(400).json({ success: false, error: 'Subscription is not eligible for renewal.' });
    }
  } catch (error) {
    console.error(error);

    // Handle any errors and send an appropriate response
    res.status(500).json({ success: false, error: error.message });
  }
});

exports.createAdminPlanOrder = catchAsyncErrors(async (req, res, next) => {
  const { addOns, amount, billingAddress, customerID, name, paymentToken, plandata, smartAccessories, userID } = req.body
  let initialChargeInvoice;
  let productsInvoice;
  let onetimeAddonsInvoice;
  let subscriptionPriceIds;
  let addonPrices = []
  let planPrice = []
  let isCouponApplied = false;
  let attachedPaymentMethod;
  attachedPaymentMethod = await stripe.paymentMethods.attach(paymentToken, {
    customer: customerID,
  });
  try {



    let oneTimeAddons = [];
    let subscriptionBaseAddons = [];
    if (addOns) {
      addOns.forEach(item => {
        if (item.type === 'subscription') {
          subscriptionBaseAddons.push(item)
        } else {
          oneTimeAddons.push(item)
        }
      })
      console.log(subscriptionBaseAddons)
    }

    // function to create invoice items
    async function createInvoiceItems(items, customerID, itemType, taxcode) {
      try {
        const createdInvoiceItems = [];
        for (const item of items) {
          const invoiceItem = await stripe.invoiceItems.create({
            customer: customerID,
            unit_amount: item.price * 100,
            quantity: itemType === 'product' ? item.quantity : 1,
            currency: 'usd',
            description: `Invoice Item for ${itemType} ${item.id}`,
            tax_code: taxcode,
          });
          createdInvoiceItems.push(invoiceItem);
        }
        return createdInvoiceItems;
      } catch (error) {
        console.error(`Error creating ${itemType} invoice items:`, error);
        throw error;
      }
    }

    // create invoice item for initial setup charge
    if (plandata.InitialSetupFee) {
      initialChargeInvoice = await stripe.invoiceItems.create({
        customer: customerID,
        amount: plandata.InitialSetupFee * 100,  // need to pass charge amount
        currency: 'usd',
        description: 'Initial setup fee',
      });
    }

    // create invoice item for products
    if (smartAccessories.length > 0) {
      productsInvoice = await createInvoiceItems(smartAccessories, customerID, "product", "txcd_99999999")
      if (!productsInvoice) {
        return  // show error
      }
    }

    // create invoice item for ontetime purchase addons
    if (oneTimeAddons.length > 0) {
      onetimeAddonsInvoice = await createInvoiceItems(oneTimeAddons, customerID, 'addon')
      if (!productsInvoice) {
        return // need to show error 
      }
      console.log("onetimeAddonsInvoice")
      console.log(onetimeAddonsInvoice)
      console.log("onetimeAddonsInvoice")
    }

    // create subscription schedule for plan
    //create price for plan
    planPrice = await stripe.prices.create({
      currency: 'usd',
      unit_amount: plandata.recurring_amount * 100,
      product: "prod_OksgjkrpVgwSUG",
      tax_behavior: 'exclusive',
      recurring: {
        interval: plandata.billing_cycle === 'monthly' ? "month" : "year",
        interval_count: 1
      },
    });
    // const addonPrice = await stripe.prices.create({
    //   currency: 'usd', 
    //   unit_amount: 50 * 100, 
    //   product: "prod_PDRmQDn9Pft8Ex", 
    //   tax_behavior: 'exclusive',
    //   recurring : {
    //   interval :"month",
    //   interval_count : 1
    // },
    // });
    let addonItems = []

    for (const addon of subscriptionBaseAddons) {
      const priceOptions = {
        currency: 'usd',
        unit_amount: addon.price * 100,
        product: 'prod_PDRmQDn9Pft8Ex',
        recurring: {
          interval: 'month',
          interval_count: 1
        },
      };

      const createdPrice = await stripe.prices.create(priceOptions);
      addonPrices.push(createdPrice);

      const addonItem = {
        price: createdPrice.id,
        quantity: 1,
        metadata: {
          id: addon.addonId,
          type: 'addon',
        },
      };

      addonItems.push(addonItem);
    }

    console.log(addonPrices)

    // const couponOptions = {
    //   duration: 'repeating',
    //   duration_in_months: 3,
    //   applies_to: {
    //     products: ["prod_OksgjkrpVgwSUG"],
    //   },
    //   currency: 'usd',
    //   metadata: {
    //     customer_id: customerID,
    //     id : plandata.planID,
    //   },
    //   percent_off : 20
    // };
    // const couponOptions2 = {
    //   duration: 'once',
    //   applies_to: {
    //     products: ["prod_PDRmQDn9Pft8Ex"],
    //   },
    //   amount_off : 50, // price here
    //   currency: 'usd',
    //   metadata: {
    //     customer_id: customerID,
    //     id : subscriptionBaseAddons[0].addonId,
    //   },
    // };


    // coupon = await stripe.coupons.create(couponOptions);
    // coupon2 = await stripe.coupons.create(couponOptions2);
    // console.log("coupon")
    // console.log(coupon)
    // console.log(coupon2)
    // console.log("coupon2")

    const myPaymentsubscription = await stripe.subscriptionSchedules.create({
      customer: customerID,
      start_date: 'now',
      end_behavior: 'release',
      phases: [
        {
          items: [
            {
              price: planPrice.id,
              quantity: 1,
              metadata: {
                id: plandata.planID,
                type: 'plan',
              },
            },
            addonItems[0]
          ],
          collection_method: 'charge_automatically',
          billing_cycle_anchor: 'automatic',
          description: 'Dummy combined Subscription Schedule',
          // coupon : coupon.id
        },
      ],
      start_date: 'now',
      end_behavior: 'release',
    });

    if (!myPaymentsubscription) {
      throw new Error("subcription creation failed")
    }


    const subscription = await stripe.subscriptions.retrieve(
      myPaymentsubscription.subscription
    );
    // console.log("myPaymentsubscription")
    // console.log(subscription.items)
    // console.log("myPaymentsubscription")
    const invoice = await stripe.invoices.retrieve(subscription.latest_invoice);


    if (isCouponApplied) {

      const separatedItems = subscription.items.data.reduce(
        (accumulator, currentItem) => {
          if (currentItem.metadata.type === "addon") {
            accumulator.addon.push(currentItem);
          }
          return accumulator;
        },
        { addon: [] }
      );

      // console.log("separatedItems")
      // console.log(separatedItems)
      // console.log("separatedItems")


      function matchCouponsWithItems(coupons, separatedItems) {
        const matchedCoupons = {
          addon: []
        };

        separatedItems.plan.forEach(planItem => {
          coupons.forEach(coupon => {
            const metadataId = planItem.metadata.id;
            if (coupon.metadata.id === metadataId) {
              matchedCoupons.plan.push({
                id: metadataId,
                itemID: planItem.id,
                couponID: coupon.id
              });
            }
          });
        });

        separatedItems.addon.forEach(addonItem => {
          coupons.forEach(coupon => {
            const metadataId = addonItem.metadata.id;
            if (coupon.metadata.id === metadataId) {
              matchedCoupons.addon.push({
                id: metadataId,
                itemID: addonItem.id,
                couponID: coupon.id
              });
            }
          });
        });

        return matchedCoupons;
      }

      const matchedCouponsData = matchCouponsWithItems([coupon2], separatedItems)


      function matchItemIDWithLineItems(matchedItems, lineItems) {
        const matchedCodes = {
          addon: []
        };

        matchedItems.plan.forEach(planItem => {
          lineItems.forEach(lineItem => {
            if (lineItem.subscription_item === planItem.itemID) {
              matchedCodes.plan.push({
                id: lineItem.id,
                itemID: planItem.itemID,
                couponID: planItem.couponID
              });
            }
          });
        });

        matchedItems.addon.forEach(addonItem => {
          lineItems.forEach(lineItem => {
            if (lineItem.subscription_item === addonItem.itemID) {
              matchedCodes.addon.push({
                id: lineItem.id,
                itemID: addonItem.itemID,
                couponID: addonItem.couponID
              });
            }
          });
        });

        return matchedCodes;
      }

      const matchedCodes = matchItemIDWithLineItems(matchedCouponsData, invoice.lines.data);


      // Function to apply discounts to respective invoice items
      async function applyDiscounts(matchedCodes) {
        for (const key in matchedCodes) {
          for (const item of matchedCodes[key]) {
            try {
              const applyDiscount = await stripe.invoiceItems.update(item.id, {
                discounts: [
                  {
                    coupon: item.couponID,
                  },
                ],
              });
              console.log(`Discount applied for item ${item.id}`);
              // You can add additional handling or logging here
            } catch (error) {
              console.error(`Error applying discount for item ${item.id}:`, error);
              // Handle errors if necessary
            }
          }
        }
      }

      applyDiscounts(matchedCodes);
    }

    const finalizeInvoice = await stripe.invoices.finalizeInvoice(subscription.latest_invoice);

    console.log(invoice)
    if (invoice.payment_intent) {
      const subscriptionPaymentIntetn = await stripe.paymentIntents.retrieve(
        invoice.payment_intent
      );
      // Save payment ID and user details in your database after successful payment
      return res.status(200).json({ success: true, client_secret: subscriptionPaymentIntetn.client_secret, subscriptionID: subscription.id, status: subscriptionPaymentIntetn.status, endDate: subscription.current_period_end, subscription: subscription });
    } else {
      return res.status(200).json({ success: true, client_secret: "subscription-change", subscriptionID: subscription.id, endDate: subscription.current_period_end, subscription: subscription });
    }

  } catch (error) {
    console.error(error);
    // handle subscription failure
    try {

      // function to delete invoice items
      async function deleteInvoiceItems(items) {
        try {
          const deletedItems = [];
          for (const item of items) {
            await stripe.invoiceItems.del(item.id);
          }
          return deletedItems;
        } catch (error) {
          console.error('Error deleting invoice items:', error);
          throw error;
        }
      }
      async function deactivatePrices(priceIDs) {
        try {
          for (const priceID of priceIDs) {
            const price = await stripe.prices.update(priceID, {
              active: false
            });
          }
        } catch (error) {
          console.error('Error deactivating prices:', error);
          throw error;
        }
      }

      const deleteCustomer = customerID && await stripe.customers.del(customerID);
      const deletedInvoiceItem =
        initialChargeInvoice && initialChargeInvoice.id && (await stripe.invoiceItems.del(invoiceItem.id));
      await deleteInvoiceItems(productsInvoice)
      await deleteInvoiceItems(onetimeAddonsInvoice)
      await deactivatePrices([planPrice])
      await deactivatePrices(addonPrices)
      const detachPT =
        attachedPaymentMethod &&
        attachedPaymentMethod.id &&
        (await stripe.paymentMethods.detach(attachedPaymentMethod.id));
      const deletePrice = price && await stripe.prices.update(
        price.id,
        {
          active: false
        }
      );

      console.error(
        'Cleanup performed after failure:',
        deleteCustomer,
        deletedInvoiceItem,
        detachPT,
        deletePrice
      );
    } catch (cleanupError) {
      console.error('Error during cleanup:', cleanupError);
    }
    res.status(500).json({ success: false, error: error.message });
  }
})

// function to create prices for plans 


//----------------------------
exports.createAdminAddonOrder = catchAsyncErrors(async (req, res, next) => {
  try {
    console.log(req.body)
  } catch (error) {

  }

})

exports.createAdminSmartAccOrder = catchAsyncErrors(async (req, res, next) => {
  try {
    console.log(req.body)
  } catch (error) {

  }


})



exports.canceledSubscription = catchAsyncErrors(async (req, res, next) => {
  console.log(req.body)
  try {
    const { subId, currentPlan, userid, companyid } = req.body
    if (!subId) {
      return res.status(500).json({ success: false, error: 'No Subscription Id found' });
    }

    const updatedUser = await UserModel.updateOne(
      { _id: userid },
      {
        $set: { Account_status: 'is_Deactivated' },

      },
      { new: true }
    );
    const companyUsers = await UserModel.updateMany(
      {
        companyID: companyid,
        role: { $in: ["administrator", "teammember", "manager"] },
        status: { $in: ['active'] }
      },
      {
        $set: { status: 'Deactivate', Account_status: 'is_Deactivated' },
      },
    );

    console.log("?????????????????????????????????????????-?????-")
    console.log(companyUsers, "company user data")
    console.log("?????????????????????????????????????????-?????-")

    const canceledSubscription = await stripe.subscriptionSchedules.cancel(subId, {
      invoice_now: true,
      prorate: true
    });
    console.log(canceledSubscription);
    console.log('canceledSubscription');

    if (!canceledSubscription) {
      return res.status(500).json({ success: false, error: 'Error while canceling subscription' });
    }

    const updatedUserInfo = await UserInformation.findOneAndUpdate(
      { 'subscription_details.customer_id': canceledSubscription.customer },
      {
        $set: {
          'subscription_details.subscription_id': null,
          'subscription_details.addones': [],
          'subscription_details.total_amount': null,
          'subscription_details.billing_cycle': null,
          'subscription_details.endDate': null,
          'subscription_details.plan': currentPlan,
          'subscription_details.total_user': [{ 'baseUser': 1, 'additionalUser': 0 }],
          'subscription_details.recurring_amount': null,
          'subscription_details.renewal_date': null,
          'subscription_details.auto_renewal': null,
          'subscription_details.taxRate': null,
        }
      },
      { new: true }

    );
    if (!updatedUserInfo) {
      return res.status(500).json({ success: false, error: 'Error while canceling subscription' });
    }


    console.log(updatedUserInfo)
    console.log("updatedUserInfo")

    res.status(200).json({ success: true, delete: "Subscription Canceled successfully", companyUsers, updatedUser });
    // res.status(200).json({ success: true, message: canceledSubscription });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});