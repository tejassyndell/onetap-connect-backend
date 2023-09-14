const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");
const jwt = require("jsonwebtoken");
// const User = require("../models/Customers/UserModel");
const User = require("../models/NewSchemas/UserModel");

const Company = require('../models/Customers/CompanyModel');

exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
  console.log(req.cookies);
  const { token } = req.cookies;


  if (!token) {
    return next(new ErrorHandler("Please Login to Access this resource", 401));
  }

  const decodedData = jwt.verify(token, process.env.JWT_SECRET);


  console.log(decodedData.id)

  req.user = await User.findById(decodedData.id);

  // console.log("User",req.user)s


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