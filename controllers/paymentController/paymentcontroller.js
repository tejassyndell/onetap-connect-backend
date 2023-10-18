const catchAsyncErrors = require("../../middleware/catchAsyncErrors");
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const UserInformation = require("../../models/NewSchemas/users_informationModel.js");
const Order = require('../../models/NewSchemas/orderSchemaModel.js'); // Import the Order model
const UserModel = require("../../models/NewSchemas/UserModel");

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
      console.log("----------------------------------------------------------")
      console.log(customer)
      console.log("----------------------------------------------------------")
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
        // test_clock: "clock_1Nzxs4HsjFNmmZSi2juG1I0J",
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
      console.log("----------------------------------------------------------")
      console.log(customer)
      console.log("----------------------------------------------------------")
      res.status(200).json({ success: true, customer });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});


exports.processPayment = catchAsyncErrors(async (req, res, next) => {
  console.log(req.body)
  console.log("kjhaasdkjfadkfjksdlafjndklfjnjdkfjnf")
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
    const taxID = req.body.taxId;
    const { type, planName } = req.body.plandata;
    const productID = type === 'monthly'
  ? planName === 'Professional' ? Product_Professional_monthly : Product_Team_monthly
  : planName === 'Professional' ? Product_Professional_Yearly : Product_Team_Yearly;
  
    const attachedPaymentMethod = await stripe.paymentMethods.attach(paymentToken, {
      customer: customerID,
    });
  console.log(attachedPaymentMethod)
  const price = await stripe.prices.create({
        currency: 'usd', 
        unit_amount: req.body.amount * 100, 
        product: productID, 
        tax_behavior: 'exclusive',
        recurring : {
        interval : type === "monthly" ? "month" : "year" ,
        interval_count : 1
  },
});
    try {
      const myPayment = await stripe.subscriptions.create({
        description: 'Test description', 
        metadata: {
          company: req.body.company_name,
        },
        customer: customerID,
        default_payment_method: attachedPaymentMethod.id,
        items: [{ price: price.id }],
        collection_method: "charge_automatically",
      });
  
      console.log(myPayment.id);
      const latestInvoice = await stripe.invoices.retrieve(myPayment.latest_invoice);
      const paymentIntent = await stripe.paymentIntents.retrieve(
        latestInvoice.payment_intent
      );
      console.log(paymentIntent)
  
      // Save payment ID and user details in your database after successful payment
  
      res.status(200).json({ success: true, client_secret: paymentIntent.client_secret, subscriptionID : myPayment.id });
    } catch (error) {
      console.error(error);
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
    try {
      const proration_date = Math.floor(Date.now() / 1000);
      const subscriptionId = 'sub_1O0K0XHsjFNmmZSiWX5nfGVU';
      
      const deleted = await stripe.subscriptions.cancel(subscriptionId,{
        prorate : true
      });

      res.status(200).json({ success: true, message: deleted});
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: error.message });
    }
  });


  exports.switchPlan = catchAsyncErrors(async (req, res, next) => {
      // const subscription = await stripe.subscriptions.retrieve("sub_1NxkyOHsjFNmmZSijLOO4bk1");
      const proration_date = Math.floor(Date.now() / 1000);
      const subscription = await stripe.subscriptions.retrieve('sub_1Ny8rmHsjFNmmZSiEt08fWBz');

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
      const { paymentToken, customerID, subscriptionId, plandata } = req.body;
      const { type, planName } = plandata;
  
      const productID = type === 'monthly'
        ? planName === 'Professional' ? Product_Professional_monthly : Product_Team_monthly
        : planName === 'Professional' ? Product_Professional_Yearly : Product_Team_Yearly;
  
      const attachedPaymentMethod = await stripe.paymentMethods.attach(paymentToken, {
        customer: customerID,
      });
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
      const myPayment =  await stripe.subscriptions.update(subscriptionId, {
        items: [{
          id : subscription.items.data[0].id,
          price: price.id
        }],
        default_payment_method: attachedPaymentMethod.id,
        proration_date: proration_date,
        cancel_at_period_end : false
      });
  
      // // Remove the existing item from the subscription
      // console.log(myPayment);
      // const latestInvoice = await stripe.invoices.retrieve(myPayment.latest_invoice);
      // const paymentIntent = await stripe.paymentIntents.retrieve(
      //   latestInvoice.payment_intent
      // );
  
      // Save payment ID and user details in your database after successful payment
      res.status(200).json({ success: true, client_secret: "paymentIntent.client_secret", subscriptionID: myPayment.id });
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
      if(!req.user._id){
        return next(new ErrorHandler("No user found", 400));
      }
      const  userInformation = await UserInformation.findOne({ user_id: req.user._id });

      if(!userInformation){
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
      res.status(500).json({ success: false, error : error });
    }
  });


// Creates an order
exports.createOrder = catchAsyncErrors(async (req, res, next) => {
  try {
    // Get the user ID from the authenticated user or request data
    const userId = req.body.userId; // Assuming you have a user object in the request with an "id" property
    const orderData = req.body.createOrderData
    console.log(userId, "order by userId");
    const {
      smartAccessories,
      totalAmount,
      tax,
      billingAddress,
      shippingAddress,
    } = req.body;
    const totalAmountInCents = Math.round(totalAmount * 100);
    const type = (smartAccessories ? "smartAccessories" : "")

    // // stripe payment starts
    const attachedPaymentMethod = await stripe.paymentMethods.attach(orderData.paymentToken, {
      customer: orderData.customerID,
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmountInCents,
      currency: 'usd',
      automatic_payment_methods: { enabled: true, allow_redirects: "never" },
      customer: orderData.customerID,
      description: "test description",
      payment_method: attachedPaymentMethod.id,
      receipt_email: "hivete6126@ksyhtc.com",
    });

    const confirmedPaymentIntent = await stripe.paymentIntents.confirm(paymentIntent.id);
    const paymentStatus = confirmedPaymentIntent.status;
    const paymentDate = new Date();
    // res.status(200).json({ success: true, client_secret: paymentIntent.client_secret });

    if (confirmedPaymentIntent.status === 'succeeded') {
      // Payment is successful, create the order in your database

      // Create a new order linked to the specific user
      const order = new Order({
        user: userId, // Link the order to the specific user
        smartAccessories,
        totalAmount,
        tax,
        type,
        transactionId: paymentIntent.id,
        paymentDate,
        paymentStatus,
        shippingAddress,
        billingAddress,
      });
      // Save the order to the database
      await order.save();
      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        order,
      });
    } else {
      // Payment confirmation failed
      res.status(400).json({
        success: false,
        message: 'Payment confirmation failed',
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

exports.fetchCards = catchAsyncErrors(async (req, res, next) => {
  const { customerID } = req.body
  console.log(req.body)
  const paymentMethods = await stripe.paymentMethods.list({
    customer: customerID,
    type: 'card', 
  });
res.send(paymentMethods)
})


