const catchAsyncErrors = require("../../../middleware/catchAsyncErrors.js");
const ErrorHandler = require("../../../utils/errorHandler.js");
const User = require("../../../models/NewSchemas/UserModel.js");
const sendOtcToken = require("../../../utils/adminauthToken.js");
const AdminUsers = require("../../../models/Otc_AdminModels/Otc_Adminusers.js");
const UserInformation = require("../../../models/NewSchemas/users_informationModel.js");
const company = require("../../../models/NewSchemas/Company_informationModel.js");

exports.testAPIS = catchAsyncErrors(async (req, res, next) => {
  res.send("test called");
});

exports.getClients = catchAsyncErrors(async (req, res, next) => {
  // Find user information with a non-empty 'plan'
  const userInformationWithPlan = await UserInformation.find({
    "subscription_details.plan": { $ne: null },
  });

  // Extract user IDs from user information
  const userIdsWithPlan = userInformationWithPlan.map((info) => info.user_id);

  // Find clients based on the extracted user IDs
  const Clients = await User.find({ _id: { $in: userIdsWithPlan } }).populate({
    path: "companyID",
    model: "companies_information",
    select: "industry",
  });

  if (!Clients) {
    return next(new ErrorHandler("No Clients Found.....", 404));
  }

  res.status(200).json({
    Clients,
    userInformationWithPlan,
  });
});

exports.Signup = catchAsyncErrors(async (req, res, next) => {
  try {
    const userData = ({
      firstName,
      lastName,
      email,
      password,
      userRole,
      phoneNumber,
    } = req.body);
    // Save the new admin document to the database
    const user = await AdminUsers.create(userData);
    user.save();
    res.status(201).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error creating admin");
  }
});

exports.OtcLogin = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;
  try {
    // Find a user with the provided email
    const user = await AdminUsers.findOne({ email }).select("+password");

    if (!user) {
        return res.status(401).json({ message: "user not found." });
    }
    console.log(user);

    const isPasswordMatched = await user.comparePassword(password);
    if (!isPasswordMatched) {
      return next(new ErrorHandler("Please enter valid password.", 401));
    }
    
    sendOtcToken(user, 200, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

exports.Otclogout = catchAsyncErrors(async (req, res, next) => {
  res.cookie("otctoken", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged Out",
  });
});

//get profile user
exports.getOtcAdminProfile = catchAsyncErrors(async (req, res, next) => {
  console.log(req);
  const { id } = req.adminuser;

  // checking if user has given password and email both

  const user = await AdminUsers.findById(id);

  if (!user) {
    return next(new ErrorHandler("user not found", 401));
  }

  res.status(200).json({
    success: true,
    user,
  });
});