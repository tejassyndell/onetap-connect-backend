const PlanPackage =  require('../../models/Admin/PlanPackageModel');
const AddOn = require('../../models/Admin/AddOnsModel')
const ErrorHandler = require('../../utils/errorHandler');
const catchAsyncErrors = require('../../middleware/catchAsyncErrors');
const OtcAddons = require('../../models/NewSchemas/OtcAddOnsSchema')

//create Subscription --otc-Admin

exports.createSubsriptionPlan = catchAsyncErrors(async(req,res,next)=>{

    const plan = await PlanPackage.create(req.body); 

    if(!plan){
        return next(new ErrorHandler("Error in craeting plan",500))
    }

    res.status(201).json(plan);


})


// get all plans
exports.getAllPlans = catchAsyncErrors(async(req,res,next)=>{

    const plans = await PlanPackage.find(); 

    if(!plans){
        return next(new ErrorHandler("Error in craeting plan",404))
    }

    res.status(201).json({plans});


})


//get single plan details
exports.getAllSinglePlan = catchAsyncErrors(async(req,res,next)=>{

    const {id} = req.params;
    
    const plan = await PlanPackage.findById(id);


    if(!plan){
        return next(new ErrorHandler("Error in craeting plan",404))
    }

    res.status(201).json({plan});

})

// create addones 
exports.createAddOne = catchAsyncErrors(async(req,res,next)=>{

    const addon = await AddOn.create(req.body); 

    if(!addon){
        return next(new ErrorHandler("Error in craeting plan",500))
    }

    res.status(201).json({addon});


})


//get all addons
exports.getAllAddOns = catchAsyncErrors(async(req,res,next)=>{

    const addOns = await OtcAddons.find(); 

    if(!addOns){
        return next(new ErrorHandler("Error in craeting plan",404))
    }

    res.status(201).json({addOns});


})
// //get all addons
// exports.getAllAddOns = catchAsyncErrors(async(req,res,next)=>{

//     const addOns = await AddOn.find(); 

//     if(!addOns){
//         return next(new ErrorHandler("Error in craeting plan",404))
//     }

//     res.status(201).json({addOns});


// })

