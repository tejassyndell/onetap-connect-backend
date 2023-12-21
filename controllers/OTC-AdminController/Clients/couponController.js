const catchAsyncErrors = require("../../../middleware/catchAsyncErrors.js");
const ErrorHandler = require("../../../utils/errorHandler.js");
const Coupons = require('../../../models/NewSchemas/OtcCouponModel.js')
const UserCouponAssociation = require('../../../models/NewSchemas/OtcUserCouponAssociation.js')

exports.fecthCoupons = catchAsyncErrors(async (req, res, next) => {
  const { codes } = req.body;
  const currentDate = new Date(); 
  console.log(codes[0])
  if(codes.length <= 0){
    return res.status(200).json({ success: false, status : 404, msg : "No coupon provided"});
  }
  const coupons = await Coupons.find({ code: { $in: codes } });
  console.log(coupons)
  if(coupons.length <= 0){
    return res.status(200).json({ success: false,status : 404, msg : "Invalid coupon code."});
  }
  const activeCoupons = coupons.filter(coupon => coupon.status === 'Published');

if (activeCoupons.length <= 0) {
    return res.status(200).json({ success: false, status : 401, msg: "This coupon is not active" });
}
  const validCoupons = activeCoupons.filter(coupon => coupon.expiryDate > currentDate);

if (validCoupons.length <= 0) {
    return res.status(200).json({ success: false,status : 401, msg: "This coupon is expired" });
}
  return res.status(200).json({ success: true, msg : "coupons" , coupons : validCoupons});
  });


  exports.verifyCouponUsage = catchAsyncErrors(async (req, res, next) => {
    const { userID, usageLimit, code } = req.body;
    try {
        const findUser = await UserCouponAssociation.findOne({ userId: userID, couponCode: code });
        if (findUser && findUser.usageCount >= usageLimit) {
            return res.status(200).json({ success: false, status : 400 , msg: "The user exceeds the limit for this coupon." });
        }
        return res.status(200).json({ success: true, status : 200, msg: "Coupon is valid" });
    } catch (error) {
        return res.status(200).json({ success: false, status : 500, msg: "Error verifying coupon" });
    }
});
