const catchAsyncErrors = require("../../middleware/catchAsyncErrors");
const stripe = require("stripe")("sk_test_51NRARzSAvu6sJ8LMLvdPw2mTAjjegBo6RUCuj3ZAjI47e7LA2xZykjvEdfFxIoZkOC7K36jaZG9nAm5QpOL9ARwq00djjNdI0r");
const dotenv = require('dotenv');

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
  

  res
    .status(200)
    .json({ success: true, client_secret: myPayment.client_secret });
});

