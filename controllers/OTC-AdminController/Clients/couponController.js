const catchAsyncErrors = require("../../../middleware/catchAsyncErrors.js");
const ErrorHandler = require("../../../utils/errorHandler.js");
const User = require("../../../models/NewSchemas/UserModel.js");
const UserInformation = require("../../../models/NewSchemas/users_informationModel.js");
const Product = require('../../../models/NewSchemas/ProductModel.js');
const ProductCategory = require("../../../models/NewSchemas/ProductCategoryModel.js");
const Coupon = require("../../../models/NewSchemas/OtcCouponSchemaModel.js");

exports.getCoupons = catchAsyncErrors(async (req, res, next) => {
    const Coupons = await Coupon.find()

    if (!Coupons) {
        return next(new ErrorHandler("No Plans Found.....", 404));
    }

    res.status(200).json({
        Coupons,
    });
});