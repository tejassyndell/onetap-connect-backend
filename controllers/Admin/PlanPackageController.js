const ErrorHandler = require("../../utils/errorHandler");
const catchAsyncErrors = require("../../middleware/catchAsyncErrors");
const OtcAddons = require("../../models/NewSchemas/OtcAddOnsSchema");
const Plan = require("../../models/NewSchemas/OtcPlanSchemaModal");

// get all plans
exports.getAllPlans = catchAsyncErrors(async (req, res, next) => {
  const plans = await Plan.find({ status: "Published", Visibility: "Public" })
    .populate("smart_accessories")
    .populate("add_ons");

  if (!plans || plans.length === 0) {
    return next(
      new ErrorHandler("No plans found with the specified criteria", 404)
    );
  }

  res.status(200).json({ plans });
});

//get single plan details
exports.getAllSinglePlan = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  const plan = await Plan.findById(id)
    .populate("smart_accessories")
    .populate("add_ons");

  if (!plan) {
    return next(new ErrorHandler("Error in craeting plan", 404));
  }

  res.status(201).json({ plan });
});

//get all addons
exports.getAllAddOns = catchAsyncErrors(async (req, res, next) => {
  const addOns = await OtcAddons.find();

  if (!addOns) {
    return next(new ErrorHandler("Error in craeting plan", 404));
  }

  res.status(201).json({ addOns });
});

