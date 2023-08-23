const catchAsyncErrors = require("../../middleware/catchAsyncErrors");
const dotenv = require('dotenv');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { v4: uuidv4 } = require('uuid');

dotenv.config()
exports.processPayment = catchAsyncErrors( async(req ,res, next) => {
  // console.log(req.body)
  // console.log("worked")
  // return await stripe.paymentIntents.create({
  //   amount: amount,
  //   currency: "inr",
  //   metadata: {
  //     company: "Ecommerce",
  //   },
  // });


  try {
    const amount = 1000; // Amount in smallest currency unit 
    const orderId = uuidv4(); // Generate a UUID for the order ID
    const idempotencyKey = uuidv4(); // Generate a UUID for idempotency 
    console.log(orderId,idempotencyKey)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency: 'inr',
      description: 'Payment for Order',
      metadata: {
        order_id: orderId,
      },
    });
    console.log('Payment Intent created:', paymentIntent);
    res.send("worked")
  } catch (error) {
    console.log("kjhgfv")
    console.error('Error creating Payment Intent:', error);
  }
});

