const catchAsyncErrors = require("../../../middleware/catchAsyncErrors.js");
const ErrorHandler = require("../../../utils/errorHandler.js");
const User = require("../../../models/NewSchemas/UserModel.js");
const UserInformation = require("../../../models/NewSchemas/users_informationModel.js");
const company = require("../../../models/NewSchemas/Company_informationModel.js");

exports.testAPIS = catchAsyncErrors(async (req, res, next) => {
    res.send("test called");
});


exports.getClients = catchAsyncErrors(async (req, res, next) => {
    // Find user information with a non-empty 'plan'
    const userInformationWithPlan = await UserInformation.find({ 'subscription_details.plan': { $ne: null } });

    // Extract user IDs from user information
    const userIdsWithPlan = userInformationWithPlan.map(info => info.user_id);

    // Find clients based on the extracted user IDs
    const Clients = await User.find({ _id: { $in: userIdsWithPlan } }).populate({
        path: 'companyID',
        model: 'companies_information',
        select: 'industry'
    });

    if (!Clients) {
        return next(new ErrorHandler("No Clients Found.....", 404));
    }

    res.status(200).json({
        Clients,
        userInformationWithPlan
    });
});
