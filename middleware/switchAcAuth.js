const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");
const jwt = require("jsonwebtoken");
const User = require("../models/NewSchemas/UserModel.js");

const extractDigits = (number) => {
  const numberString = number.toString();
  const firstTwoDigits = numberString.slice(0, 2);
  const middleTwoDigits = numberString.slice(
    Math.max(0, numberString.length - 3),
    -1
  );
  const lastTwoDigits = numberString.slice(-2);
  return `${firstTwoDigits}${middleTwoDigits}${lastTwoDigits}`;
};

exports.isAccountAuthenticated = catchAsyncErrors(async (req, res, next) => {
  const ID = req.body.userID;
  const switchingAcID = extractDigits(ID);

  const tokenKey = `token_${switchingAcID}`;
  const tokenValue = req.cookies[tokenKey];

  if (!tokenValue) {
    return next(new ErrorHandler("You Have No Access To This Account", 401));
  }

  const decodedData = jwt.verify(tokenValue, process.env.JWT_SECRET);

  req.user = await User.findById(decodedData.userID);
  next();
});
