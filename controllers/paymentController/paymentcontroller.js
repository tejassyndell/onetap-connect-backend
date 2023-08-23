const catchAsyncErrors = require("../../middleware/catchAsyncErrors");
const dotenv = require('dotenv');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { v4: uuidv4 } = require('uuid');

dotenv.config()
exports.processPayment = catchAsyncErrors(async (req, res, next) => {

  const myPayment = await stripe.paymentIntents.create({
    amount: req.body.amount * 100,
    currency: "inr",
    metadata: {
      company: "Test",
    },
  });
  
  console.log(myPayment)
  

  res.status(200).json({ success: true, client_secret: myPayment.client_secret });
});

