const catchAsyncErrors = require("../../middleware/catchAsyncErrors");
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const UserInformation = require("../../models/NewSchemas/users_informationModel.js");
const Order = require('../../models/NewSchemas/orderSchemaModel.js'); // Import the Order model
const UserModel = require("../../models/NewSchemas/UserModel");
const ErrorHandler = require("../../utils/errorHandler.js");
const billingAddressModal = require("../../models/NewSchemas/user_billing_addressModel");
const shippingAddressModal = require("../../models/NewSchemas/user_shipping_addressesModel.js");
const nodemailer = require("nodemailer");
const path = require("path");

const productId = process.env.PLAN_PRODUCT_ID
const Product_Team_Yearly = process.env.Team_Yearly
const Product_Team_monthly = process.env.Team_monthly
const Product_Professional_Yearly = process.env.Professional_Yearly
const Product_Professional_monthly = process.env.Professional_monthly
const monthlyProfessionalPriceID = process.env.MONTHLY_PROFESSIONAL_PLAN_PRICE_ID
const monthlyTeamPriceID = process.env.MONTHLY_TEAM_PLAN_PRICE_ID

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
      console.log("called2")
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
        // test_clock: "clock_1O8ITvHsjFNmmZSiSmLG7AMY",
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
  // const paymentintentID  = req.body.id
  const paymentToken = req.body.paymentToken;
  const customerID = req.body.customerID;
  const Address = req.body.billingAddress;
  const totalAddons_value = req.body.totalAddons_value;
  const selectedCard = req.body.selectedCard;
  const newUser = req.body.newUser;
  const primary_card = req.body.primary_card;
  const initialSetupCharge = req.body.initialSetupCharge;
  console.log("..........")
  console.log(primary_card, "/////////////////////////////////////")
  console.log("..........")
  const taxID = req.body.taxId;
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
  console.log(attachedPaymentMethod)
  const price = await stripe.prices.create({
    currency: 'usd',
    unit_amount: req.body.amount * 100,
    product: productID,
    tax_behavior: 'exclusive',
    recurring: {
      interval: type === "monthly" ? "month" : "year",
      interval_count: 1
    },
  });
  if (initialSetupCharge) {

    const invoiceItem = await stripe.invoiceItems.create({
      customer: customerID,
      amount: initialSetupCharge * 100,  // need to pass charge amount
      currency: 'usd',
      description: 'Initial setup fee',
    });
  }


  try {
    let myPayment;
    if (selectedCard) {
      myPayment = await stripe.subscriptions.create({
        description: 'Test description',
        metadata: {
          company: req.body.company_name,
          primary_card: primary_card
        },
        customer: customerID,
        default_payment_method: paymentToken,
        cancel_at_period_end: false,
        automatic_tax: {
          enabled: true
        },
        items: [{ price: price.id }],
        collection_method: "charge_automatically",
      });
    } else {
      myPayment = await stripe.subscriptions.create({
        description: 'Test description',
        metadata: {
          company: req.body.company_name,
          primary_card: primary_card
        },
        customer: customerID,
        default_payment_method: attachedPaymentMethod.id,
        cancel_at_period_end: false,
        items: [{ price: price.id }],
        automatic_tax: {
          enabled: true
        },
        collection_method: "charge_automatically",
      });
    }

    if (newUser === true) {
      await stripe.customers.update(customerID, {
        invoice_settings: {
          // default_payment_method: paymentMethodID,
          default_payment_method: paymentToken,
        },
      });
    }
    ////
    console.log("Address")
    console.log(Address)
    console.log("Address")
    let paymentIntent;
    if (totalAddons_value > 0) {

      const calculation = await stripe.tax.calculations.create({
        currency: 'usd',
        customer_details: {
          address: {
            line1: Address.Bstreet1,
            line2: Address.Bstreet2,
            postal_code: Address.BpostalCode,
            state: Address.Bstate,
            country: Address.Bcountry,
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


      if (selectedCard) {
        paymentIntent = await stripe.paymentIntents.create({
          amount: calculation.amount_total,
          currency: 'usd',
          automatic_payment_methods: { enabled: true, allow_redirects: "never" },
          customer: customerID,
          description: "Addon purchase",
          // payment_method: createOrderData.paymentToken,
          payment_method: paymentToken,
        });
      } else {
        paymentIntent = await stripe.paymentIntents.create({
          amount: calculation.amount_total,
          currency: 'usd',
          automatic_payment_methods: { enabled: true, allow_redirects: "never" },
          customer: customerID,
          description: "Addon purchase",
          payment_method: attachedPaymentMethod.id,
        });
      }
      console.log("paymentIntent")
      console.log(paymentIntent)
      console.log("paymentIntent")

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

      ////


      if (!myPayment || !paymentIntent) {
        throw new Error('Subscription creation failed');
      }
    }

    if (!myPayment) {
      throw new Error('Subscription creation failed');
    }

    const latestInvoice = await stripe.invoices.retrieve(myPayment.latest_invoice);
    if (latestInvoice.payment_inten) {
      const subscriptionPaymentIntetn = await stripe.paymentIntents.retrieve(
        latestInvoice.payment_intent
      );


      // Save payment ID and user details in your database after successful payment
      return res.status(200).json({ success: true, client_secret: subscriptionPaymentIntetn.client_secret, subscriptionID: myPayment.id, status: subscriptionPaymentIntetn.status, endDate: myPayment.current_period_end, addonClient_secret: paymentIntent && paymentIntent.client_secret, addonstatus: paymentIntent && paymentIntent.status });

    }

    return res.status(200).json({ success: true, client_secret: 'switch-plan', subscriptionID: myPayment.id, status: 'active', endDate: myPayment.current_period_end, addonClient_secret: paymentIntent && paymentIntent.client_secret, addonstatus: paymentIntent && paymentIntent.status });

  } catch (error) {
    console.error(error);
    // handle subscription failure
    try {
      const deleteCustomer = customerID && await stripe.customers.del(customerID);
      const deletedInvoiceItem =
        invoiceItem && invoiceItem.id && (await stripe.invoiceItems.del(invoiceItem.id));
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
        'Cleanup perform  ed after failure:',
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
});

exports.switchToManualRenewal = catchAsyncErrors(async (req, res, next) => {
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


exports.cancelPlan = catchAsyncErrors(async (req, res, next) => {
  console.log(req.body)
  try {
    const { subId } = req.body
    if (!subId) {
      return res.status(500).json({ success: false, error: 'No Subscription Id found' });
    }

    const canceledSubscription = await stripe.subscriptions.cancel(subId, {
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


exports.switchPlan = catchAsyncErrors(async (req, res, next) => {
  // const subscription = await stripe.subscriptions.retrieve("sub_1NxkyOHsjFNmmZSijLOO4bk1");
  // const price = await stripe.prices.create({
  //       currency: 'usd',
  //       unit_amount: 1200 * 100,
  //       product: "prod_OkshJOVc9kLQNr",
  //       recurring: {
  //         interval: "year",
  //         interval_count: 1
  //       },
  //     });

  // const items = [{
  //   id: subscription.items.data[0].id,
  //   price: price.id, 
  // }];
  // const invoice = await stripe.invoices.retrieveUpcoming({
  //   subscription: 'sub_1Ny8rmHsjFNmmZSiEt08fWBz',
  //   subscription_items: items,
  //   subscription_proration_date: proration_date,
  // });
  // const invoice22 = await stripe.invoices.retrieve(
  //   invoice.lines.data[0].proration_details.credited_items.invoice
  // );
  // res.status(200).json({ success: true, message: invoice22});

  try {
    const proration_date = Math.floor(Date.now() / 1000);
    const { paymentToken, customerID, subscriptionId, plandata, selectedCard, existingcard } = req.body;
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
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    console.log("called1")

    // Add the new item to the subscription
    let myPayment;
    if (selectedCard) {
      myPayment = await stripe.subscriptions.update(subscriptionId, {
        items: [{
          id: subscription.items.data[0].id,
          price: price.id
        }],
        default_payment_method: paymentToken,
        proration_date: proration_date,
        cancel_at_period_end: false
      });
    } else if (existingcard) {
      myPayment = await stripe.subscriptions.update(subscriptionId, {
        items: [{
          id: subscription.items.data[0].id,
          price: price.id
        }],
        default_payment_method: paymentToken,
        proration_date: proration_date,
        cancel_at_period_end: false
      });
    }
    else {
      myPayment = await stripe.subscriptions.update(subscriptionId, {
        items: [{
          id: subscription.items.data[0].id,
          price: price.id
        }],
        default_payment_method: attachedPaymentMethod.id,
        proration_date: proration_date,
        cancel_at_period_end: false
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
    console.log("myPayment");
    console.log(myPayment);
    console.log("myPayment");
    res.status(200).json({ success: true, client_secret: "switch-plan", subscriptionID: myPayment.id, status: "true", endDate: myPayment.current_period_end });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});



exports.createTax = catchAsyncErrors(async (req, res, next) => {
  const { shippingAddress } = req.body;

  console.log(shippingAddress);

  try {
    const calculation = await stripe.tax.calculations.create({
      currency: 'usd',
      line_items: [
        {
          amount: 0,
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
    res.status(200).json({ success: true, calculation });

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


// Creates an order
exports.createOrder = catchAsyncErrors(async (req, res, next) => {
  try {
    // Get the user ID from the authenticated user or request data
    const userId = req.body.userId;
    const orderData = req.body.createOrderData
    const {
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
    } = req.body;

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
        user: userId === 'Guest' ? null : userId,
        company: userId === 'Guest' ? null : user.companyID, // Link the order to the specific user
        smartAccessories,
        totalAmount,
        tax,
        type,
        transactionId: paymentIntent.id,
        paymentDate,
        shippingAddress,
        billingAddress,
        isGuest: userId === 'Guest' ? true : false,
      });
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
      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        order,
        clientSecret: paymentIntent.client_secret
      });
      await sendpurchaseOrderconfirmationEmail(email, shippingAddress, smartAccessories, order);
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
async function sendpurchaseOrderconfirmationEmail(customeremail, shippingAddress, smartAccessories, order) {
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
    smartAccessories.forEach((product) => {
      productsHTML += `
        <tr>
          <td>&nbsp;&nbsp;&nbsp;${product.productName}</td>
          <td style="text-align: center;">&nbsp;&nbsp;${product.quantity}</td>
          <td></td>
          <td>&nbsp;&nbsp;$ ${product.price}</td>
        </tr>
      `;
      totalAmount += parseFloat(product.price);
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
            <td>&nbsp;&nbsp;$ 0.0</td>
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
      createOrderData
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
    const updatedUserInformation = await UserInformation.findOneAndUpdate(
      { user_id: userId },
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