const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");
const jwt = require("jsonwebtoken");
const AdminUsers = require("../models/Otc_AdminModels/Otc_Adminusers.js");

exports.isOtcAdminAuthenticatedUser = catchAsyncErrors(
  async (req, res, next) => {
    const { otctoken } = req.cookies;
    if (!otctoken) {
      return next(
        new ErrorHandler("Please Login to Access this resource", 401)
      );
    }
    const decodedData = jwt.verify(otctoken, process.env.JWT_SECRET);
    req.adminuser = await AdminUsers.findById(decodedData.id);
    next();
  }
);
