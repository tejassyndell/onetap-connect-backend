const Subscription =  require('../../models/SubscriptionModel');
const ErrorHandler = require('../../utils/errorHandler');
const catchAsyncErrors = require('../../middleware/catchAsyncErrors');


//create Subscription --otc-Admin

exports.createSubsriptionPlan = catchAsyncErrors(async(req,res,next)=>{

    const subscription = await Subscription.create(req.body); 


})