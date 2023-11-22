const catchAsyncErrors = require("../../../middleware/catchAsyncErrors.js");
const ErrorHandler = require("../../../utils/errorHandler.js");
const Coupons = require('../../../models/NewSchemas/OtcCouponModel.js')

exports.newTestAPIS = catchAsyncErrors(async (req, res, next) => {
    
    res.send("test called");
  });

