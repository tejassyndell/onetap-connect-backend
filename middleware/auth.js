const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");
const jwt = require("jsonwebtoken");
const User = require("../models/NewSchemas/UserModel");
const Company = require('../models/NewSchemas/Company_informationModel');
exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
  const { combinedId, active_account } = req.cookies;
  const decodedUserID = jwt.verify(combinedId, process.env.JWT_SECRET);
  const activeUserId = jwt.verify(active_account, process.env.JWT_SECRET);
  const tokenKey = `token_${decodedUserID.secretUserID}`;
  const tokenValue = req.cookies[tokenKey];
  const decodedData = jwt.verify(tokenValue, process.env.JWT_SECRET);
  if (!tokenValue) {
    return next(new ErrorHandler("Please Login to Access this resource1", 401));
  }
  if (!activeUserId.userID) {
    return next(new ErrorHandler("Please Login to Access this resource2", 401));
  }
  if (!decodedData.id) {
    return next(new ErrorHandler("Please Login to Access this resource3", 401));
  }
  req.user = await User.findById(activeUserId.userID);
  next();
});
exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          `Role: ${req.user.role} is not allowd to access this resource`,
          403
        )
      );
    }
    next();
  };
};