const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");
const jwt = require("jsonwebtoken");
const User = require("../models/Customers/UserModel");
const Company = require('../models/Customers/CompanyModel');

exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
  const { combinedId, active_account } = req.cookies;

  const decodedUserID = jwt.verify(combinedId, process.env.JWT_SECRET);
  const activeUserId = jwt.verify(active_account, process.env.JWT_SECRET);
  const tokenKey = `token_${decodedUserID.secretUserID}`;
  const tokenValue = req.cookies[tokenKey];

  if (!tokenValue) {
    return next(new ErrorHandler("Please Login to Access this resource", 401));
  }
  if (!activeUserId.userID) {
    return next(new ErrorHandler("Please Login to Access this resource", 401));
  }

  const decodedData = jwt.verify(tokenValue, process.env.JWT_SECRET);

  req.user = await User.findById(activeUserId.userID);
  console.log("user is authenticated")
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