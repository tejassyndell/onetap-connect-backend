const catchAsyncErrors = require("../../middleware/catchAsyncErrors");
const stripe = require("stripe")("sk_test_51NRARzSAvu6sJ8LMLvdPw2mTAjjegBo6RUCuj3ZAjI47e7LA2xZykjvEdfFxIoZkOC7K36jaZG9nAm5QpOL9ARwq00djjNdI0r");
const dotenv = require('dotenv');

dotenv.config()
exports.processPayment = catchAsyncErrors( async(amount) => {
  console.log(req.body)
  return await stripe.paymentIntents.create({
    amount: amount,
    currency: "inr",
    metadata: {
      company: "Ecommerce",
    },
  });

  
});

