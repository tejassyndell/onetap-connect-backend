const catchAsyncErrors = require("../../middleware/catchAsyncErrors");
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const monthlyProductId = process.env.MONTHLY_PLAN_PRODUCT_ID
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
        metadata :{
          company: user.company_name,
        }
      });
      res.status(200).json({ success: true, customer });



    }else{
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
      test_clock: "clock_1Nq8d7SAvu6sJ8LMT72ZdYHd",
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
      metadata :{
        company: user.company_name,
      }
    });
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
  
    const attachedPaymentMethod = await stripe.paymentMethods.attach(paymentToken, {
      customer: customerID,
    });
  console.log(attachedPaymentMethod)
  const price = await stripe.prices.create({
        currency: 'usd', // Specify the currency
        unit_amount: req.body.amount * 100, // The custom price in cents
        product: 'prod_Od7qoG9fmO6B3Q', // Replace with the product ID you created
        recurring : {
        interval : "month",
        interval_count : 1
  },
});


    try {
      const myPayment = await stripe.subscriptions.create({
        description: 'Test description', // Provide an export-related description
        metadata: {
          company: req.body.company_name,
        },
        customer: customerID, // Associate the customer with the PaymentIntent
        default_payment_method: attachedPaymentMethod.id,
        items: [{ price: price.id }],
        collection_method: "charge_automatically",
      });
  
      console.log(myPayment);
      console.log("myPayment");
      const latestInvoice = await stripe.invoices.retrieve(myPayment.latest_invoice);
      const paymentIntent = await stripe.paymentIntents.retrieve(
        latestInvoice.payment_intent
      );
      console.log("paymentIntent")
      console.log(paymentIntent)
      console.log("paymentIntent")
  
      // Save payment ID and user details in your database after successful payment
  
      res.status(200).json({ success: true, client_secret: paymentIntent.client_secret });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  exports.switchToManualRenewal = catchAsyncErrors(async (req, res, next) => {

    try {
      // Update the subscription to use manual payment collection
      await stripe.subscriptions.update("sub_1NqFV7SAvu6sJ8LMNymfCnNZ", {
        collection_method: 'send_invoice',
        days_until_due: 7,
      });
  
      res.status(200).json({ success: true, message: 'Switched to manual renewal. Invoices will be sent for manual payment.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: error.message });
    }
  });