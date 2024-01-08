const ErrorHandler = require("../../utils/errorHandler.js");
const catchAsyncErrors = require("../../middleware/catchAsyncErrors.js");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const { ObjectId } = require('mongodb');
const User = require('../../models/NewSchemas/UserModel.js');
dotenv.config();
exports.getActiveAccounts = catchAsyncErrors(async (req, res, next) => {
  try {
    const { values } = req.body;
    const { active_account } = req.cookies;
    const decodedIds = values.map(token => jwt.verify(token, process.env.JWT_SECRET).userID);
    const userPromises = decodedIds.map(id => User.findById(id).select('first_name last_name email avatar'));
    const usersData = await Promise.all(userPromises);
    const currentUserId = jwt.verify(active_account, process.env.JWT_SECRET).userID;
    const currentUserIdObj = new ObjectId(currentUserId);
    const enhancedUsersData = usersData.map(user => {
      if (user._id.equals(currentUserIdObj)) {
        return { ...user.toObject(), isCurrentUser: true };
      }
      return user.toObject();
    });
    res.status(200).json({
      success: true,
      userData: enhancedUsersData
    });
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
});
exports.switchAccounts = catchAsyncErrors(async (req, res, next) => {
  try {
    const { userID } = req.body;
    const userIDpayLoad = {
      userID,
    };
    // Options for cookies
    const cookieOptions = {
      expires: new Date(
        Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
    };
    const currentUserID = jwt.sign(userIDpayLoad, process.env.JWT_SECRET);
    res.status(200)
      .cookie('active_account', currentUserID, cookieOptions)
      .json({
        success: true,
      });
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
});
