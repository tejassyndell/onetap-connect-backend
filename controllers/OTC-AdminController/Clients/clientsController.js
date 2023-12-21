const catchAsyncErrors = require("../../../middleware/catchAsyncErrors.js");
const ErrorHandler = require("../../../utils/errorHandler.js");
const User = require("../../../models/NewSchemas/UserModel.js");
const Cards = require("../../../models/NewSchemas/CardModel.js");
const Team = require("../../../models/NewSchemas/Team_SchemaModel.js");
const sendOtcToken = require("../../../utils/adminauthToken.js");
const AdminUsers = require("../../../models/Otc_AdminModels/Otc_Adminusers.js");
const UserInformation = require("../../../models/NewSchemas/users_informationModel.js");
const Company = require("../../../models/NewSchemas/Company_informationModel.js");
const shippingAddress = require("../../../models/NewSchemas/user_shipping_addressesModel.js");
const Adminaddons = require("../../../models/NewSchemas/OtcAddOnsSchema.js");
const Plan = require("../../../models/NewSchemas/OtcPlanSchemaModal.js");
const Coupon = require("../../../models/NewSchemas/OtcCouponModel.js");
const Category = require("../../../models/NewSchemas/OtcCategoryModel.js");
const CompanyShareReferralModel = require("../../../models/Customers/Company_Share_Referral_DataModel.js");
const RedirectLinksModal = require("../../../models/NewSchemas/RedirectLinksModal.js");
const Order = require("../../../models/NewSchemas/orderSchemaModel.js");
const billingAddress = require("../../../models/NewSchemas/user_billing_addressModel.js");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const crypto = require("crypto");
const path = require("path");
const usedCodes = new Set();
const generatePassword = require("../../../utils/passwordGenerator.js");
const parmalinkSlug = require("../../../models/NewSchemas/parmalink_slug.js");
const InvitedTeamMemberModel = require("../../../models/Customers/InvitedTeamMemberModel.js");
const { Types } = require("mongoose");
const user_billing_addressModel = require("../../../models/NewSchemas/user_billing_addressModel.js");
const user_shipping_addressesModel = require("../../../models/NewSchemas/user_shipping_addressesModel.js");
const Company_information = require("../../../models/NewSchemas/Company_informationModel.js");
const Otc_Adminteams = require("../../../models/Otc_AdminModels/Otc_Adminteams.js");
function generateUniqueCode() {
  let code;
  const alphabetic = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const totalPossibleCodes = Math.pow(alphabetic.length, 6);

  if (usedCodes.size >= totalPossibleCodes) {
    if (usedCodes.size >= Math.pow(alphabetic.length, 7)) {
      throw new Error(
        "All possible 7-digit alphabetic codes have been generated."
      );
    }
    const newLength = 7;
    return generateCodeWithLength(newLength);
  }

  return generateCodeWithLength(6);
}
function generateCodeWithLength(length) {
  let code = "";
  const alphabetic = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  do {
    code = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * alphabetic.length);
      code += alphabetic[randomIndex];
    }
  } while (usedCodes.has(code));

  usedCodes.add(code);
  return code;
}

exports.testAPIS = catchAsyncErrors(async (req, res, next) => {
  res.send("test called");
});

exports.getauser = catchAsyncErrors(async (req, res, next) => {
  const { email } = req.params;
  const user = await User.findOne({ email }).populate('companyID');
  res.send(user);
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
    select: "industry company_name",
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
      return res.status(401).json({ message: "User not found." });
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
    return next(new ErrorHandler("User not found.", 401));
  }

  res.status(200).json({
    success: true,
    user,
  });
});

exports.getordersclient = catchAsyncErrors(async (req, res, next) => {
  {
    try {
      const userInformationTeamData = await UserInformation.find({
        "subscription_details.plan": { $ne: null },
      })
        .populate({
          path: "company_ID",
          model: "companies_information",
          // select: "industry company_name",
        })
        .populate({
          path: "user_id",
          model: "user",
          // select: "first_name last_name",
        });
      console.log(userInformationTeamData);
      // // Create a map to track seen company IDs
      // const seenCompanyIDs = new Map();
      // const filteredUserInformationTeamData = [];

      // for (const data of userInformationTeamData) {
      //   const companyID = data.company_ID._id;

      //   // If the company ID is not in the map, add it to the map and add the data to the filtered array
      //   if (!seenCompanyIDs.has(companyID)) {
      //     seenCompanyIDs.set(companyID, true);
      //     filteredUserInformationTeamData.push(data);
      //   }
      // }
      // const ReverseData = filteredUserInformationTeamData.reverse();
      // console.log(filteredUserInformationTeamData);
      const filteredUserInformationTeamData = userInformationTeamData.reduce(
        (accumulator, current) => {
          // Check if company_ID is present and has _id property
          if (current.company_ID && current.company_ID._id) {
            const companyId = current.company_ID._id.toString();
            if (!accumulator.has(companyId)) {
              accumulator.set(companyId, current);
            }
          }
          return accumulator;
        },
        new Map()
      );
      const uniqueUserInformationTeamData = [
        ...filteredUserInformationTeamData.values(),
      ];
      const ReverseData = uniqueUserInformationTeamData.reverse();
      res.status(200).json({
        // userInformationTeamData
        userInformationTeamData: ReverseData,
        userInformation: userInformationTeamData,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "An error occurred" });
    }
  }
});

exports.getallusers = catchAsyncErrors(async (req, res, next) => {
  {
    try {
      const userInformationTeamData = await UserInformation.find()
        .populate({
          path: "company_ID",
          model: "companies_information",
          // select: "industry company_name",
        })
        .populate({
          path: "user_id",
          model: "user",
          // select: "first_name last_name",
        });
      console.log(userInformationTeamData);

      const ReverseData = userInformationTeamData.reverse();
      console.log(userInformationTeamData);

      res.status(200).json({
        // userInformationTeamData
        userInformationTeamData: ReverseData,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "An error occurred" });
    }
  }
});
exports.getUser = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  {
    try {
      const user = await UserInformation.find({ user_id: id })
        .populate({
          path: "company_ID",
          model: "companies_information",
          // select: "industry company_name",
        })
        .populate({
          path: "user_id",
          model: "user",
          // select: "first_name last_name",
        });
      console.log(user);

      const company_id = user[0].company_ID._id;

      const allteams = await Team.find({ companyID: company_id });

      const userTeamData = await User.find({ _id: id }).populate({
        path: "team",
        model: "team",
        // select: "first_name last_name",
      });

      // const ReverseData = userInformationTeamData.reverse();
      // console.log(userInformationTeamData);

      res.status(200).json({
        // userInformationTeamData
        user,
        userTeamData,
        allteams,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "An error occurred" });
    }
  }
});

exports.getallusersofcompany = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  {
    try {
      const userInformationTeamData = await UserInformation.find({
        company_ID: id,
      }).populate({
        path: "user_id",
        model: "user",
        populate: {
          path: "team",
          model: "team", // Adjust the model name for the 'team' model
          select: "team_name",
        },
      });
      const companydata = await Company.findOne({ _id: id })
        .populate({
          path: "primary_billing",
          model: "user", // Adjust the model name as needed
        })
        .populate({
          path: "primary_account",
          model: "user", // Adjust the model name as needed
        })
        .populate({
          path: "primary_manager",
          model: "user", // Adjust the model name as needed
        });
      const allteams = await Team.find({ companyID: id });
      if (!userInformationTeamData) {
        return next(new ErrorHandler("No company details Found", 404));
      }
      res.status(200).json({
        success: true,
        userInformationTeamData,
        companydata,
        allteams,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "An error occurred" });
    }
  }
});

exports.getcompanyuserstatus = catchAsyncErrors(async (req, res, next) => {
  try {
    // Fetch all companies
    const companies = await Company.find();

    const companyStatusCounts = [];

    for (const company of companies) {
      const companyId = company._id;

      // Count active users for the company
      const activeUserCount = await User.countDocuments({
        companyID: companyId,
        status: "active",
      });
      // Count inactive users for the company
      const inactiveUserCount = await User.countDocuments({
        companyID: companyId,
        status: "inactive",
      });
      // Calculate the count of new users created within the last 28 days
      const currentDate = new Date();
      const startOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );

      const newThisMonthCount = await User.countDocuments({
        companyID: companyId,
        createdAt: {
          $gte: startOfMonth,
        },
      });
      companyStatusCounts.push({
        id: companyId,
        ActiveuserCount: activeUserCount,
        deActiveuserCount: inactiveUserCount,
        Newthismonth: newThisMonthCount,
      });
    }

    res.status(200).json({ companies: companyStatusCounts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

exports.updateAddons = catchAsyncErrors(async (req, res, next) => {
  try {
    const { id, updatedData, name } = req.body;
    let CustomPermalink = updatedData.CustomPermalink;

    if (id) {
      const existingAddon = await Adminaddons.findByIdAndUpdate(
        id,
        updatedData,
        { new: true }
      );
      if (!existingAddon) {
        return res.status(404).json({ error: "Addon not found" });
      }
      return res.json(existingAddon);
    } else {
      const isUnique = await isAddonCustomPermalinkUnique(CustomPermalink);
      if (!isUnique) {
        CustomPermalink = await generateAddonUniqueCustomPermalink(
          CustomPermalink
        );
      }

      const newAddon = new Adminaddons({
        ...updatedData,
        CustomPermalink,
        publishedBy: name,
      });
      const savedAddon = await newAddon.save();
      return res.status(201).json(savedAddon);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});
async function isAddonCustomPermalinkUnique(CustomPermalink) {
  const existingCategory = await Adminaddons.findOne({ CustomPermalink });
  return !existingCategory;
}

async function generateAddonUniqueCustomPermalink(basePermalink) {
  let uniquePermalink = basePermalink;
  let counter = 1;
  while (true) {
    const existingCategory = await Adminaddons.findOne({
      CustomPermalink: uniquePermalink,
    });
    if (!existingCategory) {
      return uniquePermalink;
    }
    // Append a counter to the base permalink to make it unique
    uniquePermalink = `${basePermalink}-${counter}`;
    counter++;
  }
}
// exports.getordersclient = catchAsyncErrors(async (req, res, next) => {
//   try {
//     const userInformationData = await UserInformation.find();

//     // Create a map to store unique company_ID values as keys
//     const companyMap = new Map();

//     // Iterate through the userInformationData and store unique company_ID documents in the map
//     userInformationData.forEach(userInformation => {
//       if (!companyMap.has(userInformation.company_ID)) {
//         companyMap.set(userInformation.company_ID, userInformation);
//       }
//     });

//     // Convert the map values (which are unique userInformation documents) to an array
//     const uniqueUserInformation = Array.from(companyMap.values());

//     // Populate companyInformation and user data
//     for (const userInformation of uniqueUserInformation) {
//       await userInformation.populate('company_ID');
//       await userInformation.populate('user_id');
//     }

//     res.status(200).json({
//       userInformationTeamData: uniqueUserInformation
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'An error occurred' });
//   }
// });
exports.getAddons = catchAsyncErrors(async (req, res, next) => {
  const Addons = await Adminaddons.find();

  if (!Addons) {
    return next(new ErrorHandler("No Addons Found.....", 404));
  }

  res.status(200).json({
    Addons,
  });
});

exports.createPlan = catchAsyncErrors(async (req, res, next) => {
  try {
    const { planData, planFormData, id } = req.body;

    const CustomPermalinkSlug = planFormData.CustomPermalink;
    let CustomPermalink = CustomPermalinkSlug;
    // let CustomPermalink = `https://onetapconnect.com/` + CustomPermalinkSlug;

    const {
      InternalPlanName,
      PublicPlanName,
      categoryType,
      description,
      image,
      imageName,
      altText,
      status,
      Visibility,
      activitylog,
      smart_accessories,
      add_ons,
      features,
    } = planFormData;
    const {
      planType,
      users,
      monthlyPrice_perUser,
      monthly_fee,
      monthly_sku,
      yearlyPrice_perUser,
      yearly_fee,
      yearly_sku,
    } = planData;

    if (id) {
      // Editing an existing category

      const existingCategory = await Plan.findById(id);
      if (!existingCategory) {
        return res
          .status(404)
          .json({ success: false, message: "Category not found" });
      }

      // Check if CustomPermalink is not changed or is unique
      if (CustomPermalink !== existingCategory.CustomPermalink) {
        const isUnique = await isPlanCustomPermalinkUnique(CustomPermalink);
        if (!isUnique) {
          CustomPermalink = await plangenerateUniqueCustomPermalink(
            CustomPermalink
          );
        }
      }

      const updatedCategory = await Plan.findByIdAndUpdate(
        id,
        {
          InternalPlanName,
          PublicPlanName,
          categoryType,
          features,
          CustomPermalink,
          description,
          image,
          imageName,
          altText,
          status,
          Visibility,
          activitylog,
          planType,
          users,
          monthlyPrice_perUser,
          monthly_fee,
          monthly_sku,
          yearlyPrice_perUser,
          yearly_fee,
          yearly_sku,
          smart_accessories,
          add_ons,
        },
        { new: true } // Return the updated document
      );
      res.status(200).json({ success: true, category: updatedCategory });
    } else {
      // Creating a new category
      const isUnique = await isPlanCustomPermalinkUnique(CustomPermalink);
      if (!isUnique) {
        CustomPermalink = await plangenerateUniqueCustomPermalink(
          CustomPermalink
        );
      }

      const newplans = new Plan({
        InternalPlanName,
        PublicPlanName,
        features,
        categoryType,
        CustomPermalink,
        description,
        image,
        imageName,
        altText,
        status,
        Visibility,
        activitylog,
        publishedDate: new Date(),
        planType,
        users,
        monthlyPrice_perUser,
        monthly_fee,
        monthly_sku,
        yearlyPrice_perUser,
        yearly_fee,
        yearly_sku,
        smart_accessories,
        add_ons,
      });
      const plans = await newplans.save();
      res.status(201).json({ success: true, plans });
    }
  } catch (error) {
    // Handle error
    next(error);
  }
});

async function isPlanCustomPermalinkUnique(CustomPermalink) {
  const existingCategory = await Plan.findOne({ CustomPermalink });
  return !existingCategory;
}

async function plangenerateUniqueCustomPermalink(basePermalink) {
  let uniquePermalink = basePermalink;
  let counter = 1;
  while (true) {
    const existingCategory = await Plan.findOne({
      CustomPermalink: uniquePermalink,
    });
    if (!existingCategory) {
      return uniquePermalink;
    }
    // Append a counter to the base permalink to make it unique
    uniquePermalink = `${basePermalink}-${counter}`;
    counter++;
  }
}

exports.getPlans = catchAsyncErrors(async (req, res, next) => {
  const Plans = await Plan.find()
    .populate("smart_accessories")
    .populate("add_ons");

  if (!Plans) {
    return next(new ErrorHandler("No Plans Found.....", 404));
  }

  res.status(200).json({
    plans: Plans,
  });
});

exports.createCategories = catchAsyncErrors(async (req, res, next) => {
  try {
    const { productcategoryImage, id } = req.body;
    const CustomPermalinkSlug = productcategoryImage.CustomPermalink;
    let CustomPermalink = CustomPermalinkSlug;
    // let CustomPermalink = `https://onetapconnect.com/` + CustomPermalinkSlug;

    const {
      name,
      isActive,
      categoryType,
      description,
      image,
      imageName,
      altText,
      status,
      Visibility,
      activitylog,
    } = productcategoryImage;

    if (id) {
      // Editing an existing category

      const existingCategory = await Category.findById(id);
      if (!existingCategory) {
        return res
          .status(404)
          .json({ success: false, message: "Category not found" });
      }

      // Check if CustomPermalink is not changed or is unique
      if (CustomPermalink !== existingCategory.CustomPermalink) {
        const isUnique = await isCategoryCustomPermalinkUnique(CustomPermalink);
        if (!isUnique) {
          CustomPermalink = await categorygenerateUniqueCustomPermalink(
            CustomPermalink
          );
        }
      }

      const updatedCategory = await Category.findByIdAndUpdate(
        id,
        {
          name,
          isActive,
          categoryType,
          CustomPermalink,
          description,
          image,
          imageName,
          altText,
          status,
          Visibility,
          activitylog,
        },
        { new: true } // Return the updated document
      );

      res.status(200).json({ success: true, category: updatedCategory });
    } else {
      // Creating a new category
      const isUnique = await isCategoryCustomPermalinkUnique(CustomPermalink);
      if (!isUnique) {
        CustomPermalink = await categorygenerateUniqueCustomPermalink(
          CustomPermalink
        );
      }

      const newCategory = new Category({
        name,
        isActive,
        categoryType,
        CustomPermalink,
        description,
        image,
        imageName,
        altText,
        status,
        Visibility,
        activitylog,
        publishedDate: new Date(),
      });
      const createdCategory = await newCategory.save();
      res.status(201).json({ success: true, category: createdCategory });
    }
  } catch (error) {
    // Handle error
    next(error);
  }
});

async function isCategoryCustomPermalinkUnique(CustomPermalink) {
  const existingCategory = await Category.findOne({ CustomPermalink });
  return !existingCategory;
}

async function categorygenerateUniqueCustomPermalink(basePermalink) {
  let uniquePermalink = basePermalink;
  let counter = 1;
  while (true) {
    const existingCategory = await Category.findOne({
      CustomPermalink: uniquePermalink,
    });
    if (!existingCategory) {
      return uniquePermalink;
    }
    // Append a counter to the base permalink to make it unique
    uniquePermalink = `${basePermalink}-${counter}`;
    counter++;
  }
}

exports.getCategories = catchAsyncErrors(async (req, res, next) => {
  const categories = await Category.find();

  if (!categories) {
    return next(new ErrorHandler("No Categories Found.....", 404));
  }

  res.status(200).json({
    categories,
  });
});

exports.createCoupon = catchAsyncErrors(async (req, res, next) => {
  try {
    const { id, couponData, name } = req.body;
    console.log("hereeeeeeeeeeeeeeeeeeeeeeeeee", couponData);
    let customPermaLink = couponData.customPermaLink;
    console.log("hereeeeeeeeeeeeeeeeeeeeeeeeee", customPermaLink);
    if (id) {
      // If ID is provided, update the existing Coupon
      const existingCoupon = await Coupon.findByIdAndUpdate(id, couponData, {
        new: true,
      });
      if (!existingCoupon) {
        return res.status(404).json({ error: "Coupon not found" });
      }
      return res.json(existingCoupon);
    } else {
      const isUnique = await isCouponCustomPermalinkUnique(customPermaLink);
      if (!isUnique) {
        customPermaLink = await coupongenerateUniqueCustomPermalink(
          customPermaLink
        );
      }

      // If ID is not provided, create a new Coupon
      const newCoupon = new Coupon({ ...couponData, customPermaLink });
      const savedCoupon = await newCoupon.save();
      res.status(201).json({ success: true, coupons: savedCoupon });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

async function isCouponCustomPermalinkUnique(customPermaLink) {
  const existingCoupon = await Coupon.findOne({ customPermaLink });
  return !existingCoupon;
}

// Function to generate a unique customPermalink for coupons
async function coupongenerateUniqueCustomPermalink(basePermalink) {
  let uniquePermalink = basePermalink;
  let counter = 1;
  while (true) {
    const existingCoupon = await Coupon.findOne({
      customPermaLink: uniquePermalink,
    });
    if (!existingCoupon) {
      return uniquePermalink;
    }
    uniquePermalink = `${basePermalink}-${counter}`;
    counter++;
  }
}

exports.getCoupon = catchAsyncErrors(async (req, res, next) => {
  const Coupons = await Coupon.find();
  if (!Coupons) {
    return next(new ErrorHandler("No Coupons Found.....", 404));
  }
  res.status(200).json({
    coupons: Coupons,
  });
});

exports.getOrderssofcompany = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.body;
  console.log(id, req.body, "===============================================");
  {
    try {
      const Orderssofcompany = await Order.find({
        company: id,
      });

      if (!Orderssofcompany) {
        return next(new ErrorHandler("No company details Found", 404));
      }
      res.status(200).json({
        success: true,
        Orderssofcompany,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "An error occurred" });
    }
  }
});

// update user team
exports.updateTeamofuser = catchAsyncErrors(async (req, res, next) => {
  const { users, team } = req.body;
  console.log(req.body);
  // Loop through the array of user IDs
  for (let i = 0; i < users.length; i++) {
    const user = await User.findById(users[i]);

    if (!user) {
      return next(new ErrorHandler(`No user found with ID: ${users[i]}`, 404));
    }

    // Update the user's team based on the corresponding team value
    // user.team = teams[i].value;
    //comment above line because this time we only select one team not multiple
    user.team = team;
    await user.save(); // Save the changes to the user
  }

  res.status(200).json({
    success: true,
  });
});

exports.updateStatusofuser = catchAsyncErrors(async (req, res, next) => {
  const { users, status, selectedUserForRedirect } = req.body;

  // Loop through the array of user IDs
  for (let i = 0; i < users.length; i++) {
    const user = await User.findById(users[i]);

    if (!user) {
      return next(new ErrorHandler(`No user found with ID: ${users[i]}`, 404));
    }

    if (selectedUserForRedirect) {
      const permalinkUpdateResult = await parmalinkSlug.updateMany(
        { user_id: { $in: users } },
        {
          $set: {
            isactive: true,
            redirectUserId: selectedUserForRedirect[0]._id,
          },
        }
      );
    }
    if (status === "active") {
      const permalinkUpdateResult = await parmalinkSlug.updateMany(
        { user_id: { $in: users } },
        {
          $set: {
            isactive: false,
            redirectUserId: null,
          },
        }
      );
    }
    // Update the user's status based on the corresponding status value
    user.status = status;
    await user.save(); // Save the changes to the user
  }

  res.status(200).json({
    success: true,
  });
});

exports.updateStatusofcompany = catchAsyncErrors(async (req, res, next) => {
  const { companies, status } = req.body;

  // Loop through the array of user IDs
  for (let i = 0; i < companies.length; i++) {
    const company = await Company.findById(companies[i]);

    if (!company) {
      return next(
        new ErrorHandler(`No user found with ID: ${companies[i]}`, 404)
      );
    }

    // Update the user's status based on the corresponding status value
    company.status = status;
    await company.save(); // Save the changes to the user
  }

  res.status(200).json({
    success: true,
  });
});

// update company details
exports.updateClientCompanyInformation = catchAsyncErrors(
  async (req, res, next) => {
    const { id } = req.body;
    const { companyDetails } = req.body;
    console.log(id, companyDetails);

    const company = await Company.findById(id);

    if (!company) {
      return next(new ErrorHandler("Company not found", 404));
    }
    company.set(companyDetails);
    await company.save();

    res.status(200).json({
      company,
    });
  }
);

exports.showClientCompanyCardDetails = catchAsyncErrors(
  async (req, res, next) => {
    const { userid } = req.body;

    const cards = await Cards.find({ userID: userid });

    if (!cards) {
      return next(new ErrorHandler("No card details found for this user", 404));
    }

    res.status(201).json({
      success: true,
      cards,
    });
  }
);

exports.otcUpdateUserDetails = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const updatedUserDetails = req.body; // Assuming the updated details are provided in the request body

  try {
    const user = await User.findById(id);

    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    // if (user.companyID.toString() !== req.user.companyID.toString()) {
    //   return next(
    //     new ErrorHandler("You are not authorized to update this user", 401)
    //   );
    // }

    // Update the user details
    user.set(updatedUserDetails);
    await user.save();

    // const userurlslug = user.userurlslug;
    // await parmalinkSlug.updateOne(
    //   { user_id: id },
    //   { $push: { unique_slugs: { $each: [{ value: userurlslug }] } } },
    // );
    // await parmalinkSlug.updateOne(
    //   { user_id: id },
    //   { userurlslug: userurlslug }
    // );

    res.status(200).json({
      success: true,
      message: "User details updated successfully",
      user: user,
    });
  } catch (error) {
    next(error);
  }
});

exports.otc_getcompanies_share_referral_data = catchAsyncErrors(
  async (req, res, next) => {
    const { id } = req.params;
    const user = await UserInformation.find({ user_id: id });
    const company_id = user[0].company_ID._id;
    // const { companyID } = req.user;
    // console.log(companyID);
    const companyShareReferData = await CompanyShareReferralModel.findOne({
      companyID: company_id,
    });
    if (!companyShareReferData) {
      return next(new ErrorHandler("No data Found", 404));
    }

    res.status(200).json({
      success: true,
      companyShareReferData,
    });
  }
);

exports.updateRedirectLink = catchAsyncErrors(async (req, res, next) => {
  try {
    const { userId, companyID, userurlslug } = req.body;

    // Check if the redirect link already exists for the given user
    let redirectLink = await RedirectLinksModal.findOne({ user_id: userId });

    if (!redirectLink) {
      // If it doesn't exist, create a new redirect link
      redirectLink = new RedirectLink({
        user_id: userId,
        companyID: companyID,
        userurlslug: userurlslug,
        user_slugs: [{ value: userurlslug }],
      });

      await redirectLink.save();
    } else {
      // If it already exists, update the user_slugs array
      redirectLink.user_slugs.push({ value: userurlslug });
      redirectLink.userurlslug = userurlslug; // Update userurlslug value
      await redirectLink.save();
    }

    res
      .status(201)
      .json({ message: "Redirect link created/updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

exports.GetSubscriptionDetailsForAdmin = async (req, res, next) => {
  try {
    const subscriptions = await Order.find({ type: "Subscription" }).select({
      first_name: 1,
      last_name: 1,
      status: 1,
      "subscription_details.recurring_amount": 1,
      "subscription_details.plan": 1,
      "subscription_details.renewal_date": 1,
      orderNumber: 1,
    });

    // Do something with the retrieved subscriptions
    res.status(200).json(subscriptions);
  } catch (error) {
    console.error("Error fetching subscription details:", error);
    res.status(500).send("Internal Server Error");
  }
};

exports.getsubscriptiondetails = async (req, res, next) => {
  const { id } = req.body;
  console.log(id, "idd");
  try {
    const subscriptions = await Order.findById(id);
    res.json(subscriptions);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.AdmininviteTeamMember = catchAsyncErrors(async (req, res, next) => {
  const { memberData, companyID, manager_firstname, manager_email } = req.body;
  // const { companyID } = req.user;
  // console.log(manage_superadmin, "*****************************")

  // Check if CSVMemberData is an array and contains data
  if (!Array.isArray(memberData) || memberData.length === 0) {
    return next(new ErrorHandler("No user data provided", 400));
  }

  const transporter = nodemailer.createTransport({
    service: "Gmail",
    port: 587,
    auth: {
      user: process.env.NODMAILER_EMAIL,
      pass: process.env.NODEMAILER_PASS,
    },
  });

  const company = await Company.findById(companyID);

  for (const userData of memberData) {
    const { email, first_name, last_name, team } = userData;

    // Check if email is already in use
    const existingUser = await InvitedTeamMemberModel.findOne({ email });
    const existingUserinusers = await User.findOne({ email });

    if (!email || !first_name || !last_name) {
      if (!email) {
        return next(new ErrorHandler("Please Enter Email", 400));
      }
      if (!first_name) {
        return next(new ErrorHandler("Please Enter First Name", 400));
      }
      if (!last_name) {
        return next(new ErrorHandler("Please Enter Last Name", 400));
      } else {
        return next(new ErrorHandler("Please fill out all details", 400));
      }
    }
    if (email) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailPattern.test(email) === false) {
        return next(new ErrorHandler("Please enter valid email"));
      }
    }
    if (existingUserinusers || existingUser) {
      return next(new ErrorHandler("This email is already in use."));
    }

    let invitationToken = crypto.randomBytes(20).toString("hex");

    const currentDate = new Date();

    // Calculate the expiry date by adding 5 days
    const expiryDate = new Date(currentDate);
    expiryDate.setDate(currentDate.getDate() + 5);

    // Convert the expiry date to ISO string format
    // const expiryDateString = expiryDate.toISOString();
    const rootDirectory = process.cwd();
    const uploadsDirectory = path.join(rootDirectory, "uploads", "Logo.png");

    const message = {
      from: "OneTapConnect:otcdevelopers@gmail.com",
      to: email,
      subject: `${company.company_name} Invited you to join OneTapConnect`,
      html: `
  <!DOCTYPE html>
  <html>
  
  <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="initial-scale=1, width=device-width" />
  </head>
  
  <body style="margin: 0; line-height: normal; font-family: 'Assistant', sans-serif;">
  
      <div style="background-color: #f2f2f2; padding: 20px; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #000; border-radius: 20px 20px 0 0; padding: 20px 15px; text-align: center;">
          <img src="cid:logo">
          </div>
          <div style="background-color: #fff; border-radius: 0 0 20px 20px; padding: 20px; color: #333; font-size: 14px;">
          <!-- <div><img src="https://onetapconnect.com/wp-content/uploads/2023/05/OneTapConnect-logo-2023.png" width="150px"/></div> -->
          <h3>Welcome to OneTapConnect!</h3>
          <p>Hi ${first_name},<br/>
          You’ve been invited by ${company.company_name} to join OneTapConnect. Please click the link below to complete your account setup and start using your new digital business card.</p>
          <!-- <div><button>Accept invitation</button><button>Reject</button></div> -->
          <div style="display: flex; justify-content: space-evenly; gap: 25px; margin-top: 25px;">
            <div style="flex: 1; border-radius: 4px; overflow: hidden; background-color: #e65925; justify-content: center; display: flex; width:30%; margin: 0 12%;">
                <a href="${process.env.FRONTEND_URL}/sign-up/${invitationToken}" style="display: inline-block; width: 83%; padding: 10px 20px; font-weight: 600; color: #fff; text-align: center; text-decoration: none;">Accept invitation</a>
            </div>
            <div style="flex: 1; border: 1px solid #333; border-radius: 4px; overflow: hidden; justify-content: center;display: flex; width:30%;">
                <a href="${process.env.FRONTEND_URL}/email-invitations/${invitationToken}" style="display: inline-block; width: 79%; padding: 10px 20px; font-weight: 600; color: #fff; text-align: center; text-decoration: none; color:black;">Reject</a>
            </div>
        </div> <br/>
        <p>If you have any question about this invitation, please contact your company account manager ${manager_firstname} at ${manager_email}.</p>
          <h3>Technical issue?</h3>
          <p>In case you facing any technical issue, please contact our support team <a href="https://onetapconnect.com/contact-sales/">here</a>.</p>
      </div>
  
  </body>
  
  </html>
`,
      attachments: [
        {
          filename: "Logo.png",
          path: uploadsDirectory,
          cid: "logo",
        },
      ],
    };

    transporter.sendMail(message, (err, info) => {
      if (err) {
        console.log(err);
      } else {
        console.log(info.response);
      }
    });

    await InvitedTeamMemberModel.create({
      email: email,
      first_name: first_name,
      last_name: last_name,
      team: team,
      companyId: companyID,
      invitationToken: invitationToken,
      invitationExpiry: expiryDate,
    });
  }

  res.status(201).json({
    success: true,
    message: "Invitaion Email sent Successfully",
  });
});

exports.AdmininviteTeamMemberByCSV = catchAsyncErrors(
  async (req, res, next) => {
    const { CSVMemberData, id } = req.body;
    // const { companyID, id } = req.user;
    console.log(CSVMemberData);

    // Check if CSVMemberData is an array and contains data
    if (!Array.isArray(CSVMemberData) || CSVMemberData.length === 0) {
      return next(new ErrorHandler("No user data provided", 400));
    }

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      port: 587,
      auth: {
        user: process.env.NODMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASS,
      },
    });

    const company = await Company.findById(id);
    // const userInfo = await User.findById(id);
    async function processCSVData(CSVMemberData) {
      const existingMails = [];

      for (const item of CSVMemberData) {
        try {
          const isEmailAlreadyUsed = await User.exists({ email: item.Email });

          if (isEmailAlreadyUsed) {
            existingMails.push(item);
            item.emailAlreadyUsed = false;
          } else {
            existingMails.push(item);
            item.emailAlreadyUsed = true;
          }
        } catch (error) {
          console.error("Error:", error);
        }
      }

      return { existingMails };
    }
    const { existingMails } = await processCSVData(CSVMemberData);

    for (const userData of existingMails) {
      const {
        "First name": firstName,
        "Last name": lastName,
        Email: email,
        Team: team,
        emailAlreadyUsed,
      } = userData;
      if (emailAlreadyUsed) {
        const password = generatePassword();

        if (!email || !firstName || !lastName || !team) {
          return next(
            new ErrorHandler("Please fill out all user details", 400)
          );
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
          return next(new ErrorHandler("Please enter a valid email", 400));
        }
        const rootDirectory = process.cwd();
        const uploadsDirectory = path.join(
          rootDirectory,
          "uploads",
          "Logo.png"
        );
        const message = {
          from: "OneTapConnect:otcdevelopers@gmail.com",
          to: email,
          subject: `${company.company_name} Invited you to join OneTapConnect`,

          html: `
    <!DOCTYPE html>
    <html>
    
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="initial-scale=1, width=device-width" />
    </head>
    
    <body style="margin: 0; line-height: normal; font-family: 'Assistant', sans-serif;">
    
        <div style="background-color: #f2f2f2; padding: 20px; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #000; border-radius: 20px 20px 0 0; padding: 20px 15px; text-align: center;">
            <img src="cid:logo">
            
            </div>
            <div style="background-color: #fff; border-radius: 0 0 20px 20px; padding: 20px; color: #333; font-size: 14px;">
            <!-- <div><img src="https://onetapconnect.com/wp-content/uploads/2023/05/OneTapConnect-logo-2023.png" width="150px"/></div> -->
           
            <p>Dear ${firstName}<br/><br/>
            We are excited to invite you to join OneTap Connect! As a valued member of our community.<br/><br/>
            To get started, simply click on the link below to Login your account:<br/><br/>
            <a href="${process.env.FRONTEND_URL}/login">Click here to Login</a><br/><br/>
            Your temporary password is: ${password}<br/><br/>
            Please log in using your email address and the temporary password provided. Upon your first login, you will be prompted to change your password to something more secure and memorable.<br/><br/>
            In case you facing any technical issue, please contact our support team <a href="https://onetapconnect.com/contact-sales/">here.</a><br/><br/>
            We look forward to having you as a part of our community and hope you enjoy your experience on OneTap Connect!<br/><br/>
            Best regards,<br/>
            
            ${company.company_name}
        </div>
    
    </body>
    
    </html>
    
    
  `,
          attachments: [
            {
              filename: "Logo.png",
              path: uploadsDirectory,
              cid: "logo",
            },
          ],
        };

        transporter.sendMail(message, (err, info) => {
          if (err) {
            console.log(`Error sending email to ${email}: ${err}`);
          } else {
            console.log(`Email sent to ${email}: ${info.response}`);
          }
        });

        // Check if the team already exists for the company
        let teamRecord = await Team.findOne({
          team_name: team,
          companyID: id,
        });

        if (!teamRecord) {
          // If the team doesn't exist, create a new team
          teamRecord = await Team.create({
            team_name: team,
            companyID: id,
          });
        }

        const teamId = teamRecord.id;
        const generatedCode = generateUniqueCode();
        const generatedcompanyCode = generateUniqueCode();

        const userRecord = await User.create({
          email: email,
          first_name: firstName,
          last_name: lastName,
          team: teamId,
          companyID: id,
          password: password,
          role: "teammember",
          status: "inactive",
          userurlslug: generatedCode,
        });

        const userId = userRecord.id;
        // console.log(userId,"!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
        const userinfocreate = await UserInformation.create({
          user_id: userId,
          company_ID: id,
        });

        const user_parmalink = await parmalinkSlug.create({
          user_id: userId,
          companyID: id,
          unique_slugs: [{ value: generatedCode, timestamp: Date.now() }],
          companyunique_slug: [
            { value: generatedcompanyCode, timestamp: Date.now() },
          ],
          userurlslug: generatedCode,
          companyurlslug: generatedcompanyCode,
        });
        await user_parmalink.save();
        await userinfocreate.save();

        // const userplan = planData.plan;
        // console.log(userplan, "))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))")
        let slug = null;
        // let companyslug = null;
        const username = firstName;
        const userlastname = lastName;
        // const companyName = company_name;
        // console.log(userlastname, username, "---------------------------------------------------")

        const first_Name = username.toLowerCase().replace(/[^a-z0-9-]/g, "");
        const last_Name = userlastname.toLowerCase().replace(/[^a-z0-9-]/g, "");
        slug = `${first_Name}${last_Name}`;
        // console.log(slug, "((((((((((((((((((((((((((((((((((((((((((((((((((((((((")

        if (slug !== null) {
          // Check for duplicates in user_parmalink collection before saving
          const isDuplicate = await parmalinkSlug.exists({
            "unique_slugs.value": slug,
          });
          if (!isDuplicate) {
            // Save the slug
            const uniqueSlug = { value: slug, timestamp: Date.now() };
            await parmalinkSlug.updateOne(
              { user_id: userId },
              { $addToSet: { unique_slugs: uniqueSlug }, userurlslug: slug }
            );
            await User.updateOne({ _id: userId }, { userurlslug: slug });
          }
        }
      }
    }

    res.status(201).json({
      success: true,
      message: "Invitaion Email sent Successfully",
      existingMails: existingMails,
    });
  }
);

exports.inviteTeamMembermanuallybyadmin = catchAsyncErrors(
  async (req, res, next) => {
    const { formData, id } = req.body;

    if (formData == null) {
      return next(new ErrorHandler("No user data provided", 400));
    }

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      port: 587,
      auth: {
        user: process.env.NODMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASS,
      },
    });

    const company = await Company.findById(id);
    // const userInfo = await User.findById(id);
    const rootDirectory = process.cwd();
    const uploadsDirectory = path.join(rootDirectory, "uploads", "Logo.png");

    const password = generatePassword();
    const {
      email,
      firstname,
      lastname,
      contact,
      designation,
      website_url,
      team,
      avatar,
      address,
      user_line1_address_permission,
      user_line2_apartment_permission,
      user_city_permission,
      user_state_permission,
      user_postal_code_permission,
    } = formData;
    // console.log(formData);

    // if (!email || !firstname || !lastname || !contact || !designation || !website_url || !team || !address) {
    //   return next(new ErrorHandler("Please fill out all user details", 400));
    // }
    if (!email || !firstname || !lastname) {
      return next(new ErrorHandler("Please fill out all user details", 400));
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      return next(new ErrorHandler("Please enter a valid email", 400));
    }

    const message = {
      from: "OneTapConnect:otcdevelopers@gmail.com",
      to: email,
      subject: `${company.company_name} Invited you to join OneTapConnect`,

      html: `
    <!DOCTYPE html>
    <html>
    
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="initial-scale=1, width=device-width" />
    </head>
    
    <body style="margin: 0; line-height: normal; font-family: 'Assistant', sans-serif;">
    
        <div style="background-color: #f2f2f2; padding: 20px; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #000; border-radius: 20px 20px 0 0; padding: 20px 15px; text-align: center;">
            <img src="cid:logo">
            
            </div>
            <div style="background-color: #fff; border-radius: 0 0 20px 20px; padding: 20px; color: #333; font-size: 14px;">
            <!-- <div><img src="https://onetapconnect.com/wp-content/uploads/2023/05/OneTapConnect-logo-2023.png" width="150px"/></div> -->
           
            <p>Dear ${firstname}<br/><br/>
            We are excited to invite you to join OneTap Connect! As a valued member of our community.<br/><br/>
            To get started, simply click on the link below to Login your account:<br/><br/>
            <div style="flex: 1; border-radius: 4px; overflow: hidden; background-color: #e65925; justify-content: center; display: flex;">
            <a href="${process.env.FRONTEND_URL}/login"  style="display: inline-block; ; padding: 10px 20px; font-weight: 100; color: #fff; text-align: center; text-decoration: none;">Click here to Login</a> </div><br/><br/>
            Your temporary password is: ${password}<br/><br/>
            Please log in using your email address and the temporary password provided. Upon your first login, you will be prompted to change your password to something more secure and memorable.<br/><br/>
            In case you facing any technical issue, please contact our support team <a href="https://onetapconnect.com/contact-sales/">here.</a><br/><br/>
            We look forward to having you as a part of our community and hope you enjoy your experience on OneTap Connect!<br/><br/>
            Best regards,<br/>
            ${company.company_name}
        </div>
    
    </body>
    
    </html>
    
    
  `,
      attachments: [
        {
          filename: "Logo.png",
          path: uploadsDirectory,
          cid: "logo",
        },
      ],
    };

    transporter.sendMail(message, (err, info) => {
      if (err) {
        console.log(`Error sending email to ${email}: ${err}`);
      } else {
        console.log(`Email sent to ${email}: ${info.response}`);
      }
    });

    const generatedCode = generateUniqueCode();

    const userData = await User.create({
      email: email, // This line is removed to prevent email storage
      first_name: firstname,
      last_name: lastname,
      contact: contact,
      designation: designation,
      team: team,
      website_url: website_url,
      user_line1_address_permission: user_line1_address_permission,
      user_line2_apartment_permission: user_line2_apartment_permission,
      user_city_permission: user_city_permission,
      user_state_permission: user_state_permission,
      user_postal_code_permission: user_postal_code_permission,
      address: {
        country: address.country,
        line1: address.line1,
        line2: address.line2,
        city: address.city,
        state: address.state,
        postal_code: address.postal_code,
      },
      companyID: id,
      password: password,
      userurlslug: generatedCode,
      role: "teammember",
      status: "inactive",
    });
    // console.log("called")
    const userInformationData = {
      user_id: userData._id,
      website_url: website_url,
      company_ID: userData.companyID,
      // Add other fields from formData if needed
    };
    await UserInformation.create(userInformationData);

    // console.log(userData._id)
    const user_parmalink = await parmalinkSlug.create({
      user_id: userData._id,
      companyID: userData.companyID,
      unique_slugs: [{ value: generatedCode, timestamp: Date.now() }],
      userurlslug: generatedCode,
    });
    await user_parmalink.save();

    // const userplan = planData.plan;
    // console.log(userplan,"))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))")
    let slug = null;
    const username = firstname;
    const userlastname = lastname;
    // console.log(userlastname, username, "---------------------------------------------------")
    const firstName = username.toLowerCase().replace(/[^a-z0-9-]/g, "");
    const lastName = userlastname.toLowerCase().replace(/[^a-z0-9-]/g, "");
    slug = `${firstName}${lastName}`;
    // console.log(slug, "((((((((((((((((((((((((((((((((((((((((((((((((((((((((")

    if (slug !== null) {
      // Check for duplicates in user_parmalink collection before saving
      const isDuplicate = await parmalinkSlug.exists({
        "unique_slugs.value": slug,
      });
      if (!isDuplicate) {
        // Save the slug
        const uniqueSlug = { value: slug, timestamp: Date.now() };
        await parmalinkSlug.updateOne(
          { user_id: userData._id },
          { $addToSet: { unique_slugs: uniqueSlug }, userurlslug: slug }
        );
        await User.updateOne({ _id: userData._id }, { userurlslug: slug });
      }
    }
    // User.userurlslug = generatedCode;
    // await User.save();

    res.status(201).json({
      success: true,
      message: "Invitaion Email sent Successfully",
      userID: userData._id,
    });
  }
);

exports.resendemailinvitationbyadmin = catchAsyncErrors(
  async (req, res, next) => {
    const { userid, manager_email, manager_firstname, companyID } = req.body;

    console.log(userid);
    for (const id of userid) {
      const user = await InvitedTeamMemberModel.findById(id);
      if (!user) {
        console.log(`User with ID ${id} not found`);
        continue; // Continue to the next iteration if user is not found
      }

      const transporter = nodemailer.createTransport({
        service: "Gmail",
        port: 587,
        auth: {
          user: process.env.NODMAILER_EMAIL,
          pass: process.env.NODEMAILER_PASS,
        },
      });
      const company = await Company.findById(companyID);
      let invitationToken = crypto.randomBytes(20).toString("hex");
      const rootDirectory = process.cwd();
      const uploadsDirectory = path.join(rootDirectory, "uploads", "Logo.png");

      const currentDate = new Date();

      // Calculate the expiry date by adding 5 days
      const expiryDate = new Date(currentDate);
      expiryDate.setDate(currentDate.getDate() + 5);
      // console.log(expiryDate, "===============================================================================")
      // Update the user object with the new fields
      user.invitationToken = invitationToken;
      user.invitationExpiry = expiryDate;
      user.status = "pending";
      // Save the updated user object
      await user.save();

      const message = {
        from: "OneTapConnect:otcdevelopers@gmail.com",
        to: user.email,
        subject: `${company.company_name} Invited you to join OneTapConnect`,

        html: `
  <!DOCTYPE html>
  <html>
  
  <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="initial-scale=1, width=device-width" />
  </head>
  
  <body style="margin: 0; line-height: normal; font-family: 'Assistant', sans-serif;">
  
      <div style="background-color: #f2f2f2; padding: 20px; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #000; border-radius: 20px 20px 0 0; padding: 20px 15px; text-align: center;">
          <img src="cid:logo">          
          </div>
          <div style="background-color: #fff; border-radius: 0 0 20px 20px; padding: 20px; color: #333; font-size: 14px;">
          <!-- <div><img src="https://onetapconnect.com/wp-content/uploads/2023/05/OneTapConnect-logo-2023.png" width="150px"/></div> -->
          <h3>Welcome to OneTapConnect!</h3>
          <p>Hi ${user.first_name}<br/>
          You’ve been invited by ${company.company_name} to join OneTapConnect. Please click the link below to complete your account setup and start using your new digital business card.</p>
          <!-- <div><button>Accept invitation</button><button>Reject</button></div> -->
          <div style="display: flex; justify-content: space-evenly; gap: 25px; margin-top: 25px;">
            <div style="flex: 1; border-radius: 4px; overflow: hidden; background-color: #e65925; width:30%; margin: 0 12%;">
                <a href="${process.env.FRONTEND_URL}/sign-up/${invitationToken}" style="display: inline-block; width: 83%; padding: 10px 20px; font-weight: 600; color: #fff; text-align: center; text-decoration: none;">Accept invitation</a>
            </div>
            <div style="flex: 1; border: 1px solid #333; border-radius: 4px; overflow: hidden; width:30%;">
            <a href="${process.env.FRONTEND_URL}/email-invitations/${invitationToken}" style="display: inline-block; width: 79%; padding: 10px 20px; font-weight: 600; color: #fff; text-align: center; text-decoration: none; color:black;">Reject</a>
            </div>
        </div>
          <p>If you have any question about this invitation, please contact your company account manager ${manager_firstname} at ${manager_email}.</p>
          <h5>Technical issue?</h5>
          <p>In case you facing any technical issue, please contact our support team <a href="https://onetapconnect.com/contact-sales/">here</a>.</p>
      </div>
  
  </body>
  
  </html>
  
  
  `,
        attachments: [
          {
            filename: "Logo.png",
            path: uploadsDirectory,
            cid: "logo",
          },
        ],
      };

      transporter.sendMail(message, (err, info) => {
        if (err) {
          console.log(err);
        } else {
          console.log(info.response);
        }
      });

      console.log(user);
    }

    res.status(200).json({ message: "Email Sent" });
  }
);
exports.getinvitedUsersbyadmin = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.body;
  console.log(id, "====================", req.body);
  try {
    // Fetch invited users based on companyID
    const invitedusers = await InvitedTeamMemberModel.find({
      companyId: id,
    });

    // console.log(invitedusers, "%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%")

    if (invitedusers.length === 0) {
      return next(new ErrorHandler("No invited users found", 404));
    }

    for (const user of invitedusers) {
      if (user.status === "pending" && user.invitationExpiry < new Date()) {
        // If status is pending and invitation has expired
        const newData = await InvitedTeamMemberModel.findOneAndUpdate(
          { _id: user._id },
          { status: "unresponsive" },
          { new: true }
        );
        // Update the user in the array of invited users
        invitedusers[invitedusers.indexOf(user)] = newData;
      }
    }

    res.status(200).json({
      success: true,
      invitedusers,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

exports.createClient = catchAsyncErrors(async (req, res, next) => {
  const {
    first_name,
    last_name,
    email,
    contact,
    isCompany,
    industry,
    company_name,
    team_size,
  } = req.body;
  try {
    let user;

    const trimedString = company_name.trim().replace(/\s+/g, " ").toLowerCase();

    const company = await Company.find();

    if (company_name !== "") {
      // checking if company already exists
      const companyExists = company.some((item) => {
        const trimmedExistingName = item.company_name
          .trim()
          .replace(/\s+/g, " ")
          .toLowerCase();
        return trimmedExistingName === trimedString;
      });

      if (companyExists) {
        console.log(
          "Company already exists xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
        );
        return next(new ErrorHandler("Company Already Exists.", 400));
      }
    }
    user = await User.create({
      email,
      first_name,
      last_name,
      contact,
      isIndividual: !isCompany,
      isPaidUser: true,
    });
    const generatedCode = generateUniqueCode();
    const generatedcompanyCode = generateUniqueCode();
    if (!user) {
      return next(
        new ErrorHandler("Something went wrong please try again.", 400)
      );
    }
    const newCompany = await Company.create({
      primary_account: user._id,
      primary_manager: user._id,
      primary_billing: user._id,
      company_name,
      industry,
      contact,
      team_size,
      owner_first_name: first_name,
      owner_last_name: last_name,
    });

    user.companyID = newCompany._id;
    user.isVerified = true;
    user.userurlslug = generatedCode;
    user.companyurlslug = generatedcompanyCode;

    await user.save();
    const planData = {
      total_amount: null,
      plan: "Free",
      total_user: [
        {
          baseUser: 1,
          additionalUser: 0,
        },
      ],
      recurring_amount: null,
      taxRate: null,
      customer_id: null,
    };
    const shipping_method = {
      type: "free",
      price: 0,
    };
    const userInfo = await UserInformation.create({
      user_id: user._id,
      company_ID: user.companyID,
      subscription_details: planData,
      // Add any other fields you want to store in userinfo
    });
    userInfo.subscription_details.auto_renewal = true;
    userInfo.shipping_method = shipping_method;

    await userInfo.save();
    const user_parmalink = await parmalinkSlug.create({
      user_id: user._id,
      companyID: newCompany._id,
      unique_slugs: [{ value: generatedCode, timestamp: Date.now() }],
      companyunique_slug: [
        { value: generatedcompanyCode, timestamp: Date.now() },
      ],
      userurlslug: generatedCode,
      companyurlslug: generatedcompanyCode,
    });
    await user_parmalink.save();

    res.status(200).json({
      success: true,
      user,
      userInfo,
      newCompany,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

exports.getActiveUsersOfCompany = catchAsyncErrors(async (req, res, next) => {
  try {
    // Find all companies
    const companies = await Company.find();

    // Loop through each company and find active and inactive user IDs
    const result = await Promise.all(
      companies.map(async (company) => {
        const activeUserIds = (
          await User.find({
            companyID: company._id,
            status: "active",
          }).select("_id")
        ).map((user) => user._id);

        const inactiveUserIds = (
          await User.find({
            companyID: company._id,
            status: { $ne: "active" }, // Users with status other than "active"
          }).select("_id")
        ).map((user) => user._id);

        return {
          company: company._id,
          activeUserIds,
          inactiveUserIds,
        };
      })
    );

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
exports.getAllOrders = catchAsyncErrors(async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate({
        path: "smartAccessories.productId",
        select: "name", // Assuming 'name' is the field in the 'Product' model that contains the product name
      })
      .populate({ path: "user", modal: "user" });

    res.status(200).json({ success: true, allOrders: orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

exports.updateOrders = catchAsyncErrors(async (req, res, next) => {
  const { orderIds, orderData } = req.body;
  try {
    // Loop through the array of order IDs
    for (let i = 0; i < orderIds.length; i++) {
      const orderId = orderIds[i];
      const updatedData = orderData[i];

      const order = await Order.findById(orderId);

      console.log(order);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: `No order found with ID: ${orderId}`,
        });
      }

      // Update the order based on the orderData
      // You might need to adjust this depending on your orderData structure
      Object.assign(order, updatedData);

      await order.save(); // Save the changes to the order
      console.log(order, "order updated data");
      res
        .status(200)
        .json({ success: true, message: "Orders updated successfully", order });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

exports.deleteOrders = catchAsyncErrors(async (req, res, next) => {
  const { orderIds } = req.body;

  try {
    const result = await Order.deleteMany({ _id: { $in: orderIds } });
    if (result.deletedCount > 0) {
      res
        .status(200)
        .json({ success: true, message: "Orders deleted successfully" });
    } else {
      res.status(404).json({
        success: false,
        message: "No orders found for the provided IDs",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

exports.getSingleOrder = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  try {
    // Find orders by user ID
    const order = await Order.findById({ _id: id })
      .populate({
        path: "smartAccessories.productId",
        select: "name", // Assuming 'name' is the field in the 'Product' model that contains the product name
      })
      .populate({
        path: "subscription_details.addones.addonId",
        modal: "otc_addons",
      })
      .populate({
        path: "addaddons.addonId",
        modal: "otc_addons",
      });

    const userdata = await User.findOne({ _id: order.user });
    const userInformation = await UserInformation.findOne({
      user_id: order.user,
    });
    const companydata = await Company.findOne({ _id: order.company });

    // const userdata = { avatar: user?.avatar || '', first_name: user?.first_name || '-', last_name: user?.last_name || '-'}
    // const companydata = { companyName : company.company_name }
    const orderWithUserData = {
      ...order.toObject(),
      userdata,
      companydata,
      userInformation,
    };

    res.status(200).json({ success: true, order: orderWithUserData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

exports.updateOrder = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const updatedOrderData = req.body; // Assuming the updated details are provided in the request body
  try {
    const order = await Order.findByIdAndUpdate(id, updatedOrderData, {
      new: true,
      runValidators: true,
    });

    if (!order) {
      return next(new ErrorHandler("Order not found", 404));
    }

    res.status(200).json({
      success: true,
      message: "Order details updated successfully",
      order: order,
    });
  } catch (error) {
    next(error);
  }
});

exports.getCompanyDetailsforAdmin = catchAsyncErrors(async (req, res, next) => {
  const { companyID } = req.body;
  const company = await Company.findById(companyID)
    .populate("primary_account")
    .populate("primary_manager")
    .populate("primary_billing");
  if (!company) {
    return next(new ErrorHandler("No company details Found", 404));
  }
  res.status(200).json({
    success: true,
    company,
  });
});

exports.checkcompanyurlslugavailiblityAdminside = catchAsyncErrors(
  async (req, res, next) => {
    const { companyurlslug } = req.body;
    const { companyID } = req.body;

    //     console.log(companyurlslug);
    // console.log(req.user.companyID);
    console.log("check is hit");
    console.log(companyurlslug);
    console.log(companyID);

    // Assuming you have access to the current company's ID
    const currentCompanyId = companyID; // Modify this line based on how you store the current company's ID in your application

    // Check for existing URL slugs that are not the current company's
    const existingcompanyurlslug = await Company.findOne({
      _id: { $ne: currentCompanyId }, // Exclude the current company by ID
      companyurlslug,
    });

    if (existingcompanyurlslug) {
      return res
        .status(400)
        .json({ message: "companyurlslug is already taken." });
    }

    // Check case-sensitive duplicates
    const caseSensitivecompanyurlslug = await Company.findOne({
      _id: { $ne: currentCompanyId }, // Exclude the current company by ID
      companyurlslug: new RegExp(`^${companyurlslug}$`, "i"),
    });

    if (caseSensitivecompanyurlslug) {
      return res
        .status(400)
        .json({ message: "companyurlslug is already taken." });
    }

    return res.status(200).json({ message: "companyurlslug is available." });
  }
);

exports.UpdateCompanySlugFromAdmin = catchAsyncErrors(
  async (req, res, next) => {
    try {
      const { companyurlslug, companyID } = req.body;

      // Validate if companyID is provided
      if (!companyID) {
        return res.status(400).json({ error: "Company ID is required" });
      }

      // Update the CompanySlug using findOneAndUpdate
      const updatedCompany = await Company.findOneAndUpdate(
        { _id: companyID }, // Find the company by ID
        { companyurlslug: companyurlslug }, // Update the CompanySlug
        { new: true } // Return the updated document
      );

      // Check if the company was found and updated
      if (!updatedCompany) {
        return res.status(404).json({ error: "Company not found" });
      }

      // Send the updated company data in the response
      res.status(200).json("updated");
    } catch (error) {
      // Handle errors
      next(error);
    }
  }
);

exports.UpdateCompanySettings = catchAsyncErrors(async (req, res, next) => {
  try {
    const { companyID, user_profile_edit_permission } = req.body;
    console.log(companyID, user_profile_edit_permission, "body", req.body);

    // Validate if companyID is provided
    if (!companyID) {
      return res.status(400).json({ error: "Company ID is required" });
    }

    // Update the CompanySlug using findOneAndUpdate
    const updatedCompany = await Company.findOneAndUpdate(
      { _id: companyID }, // Find the company by ID
      { user_profile_edit_permission: user_profile_edit_permission }, // Update the CompanySlug
      { new: true } // Return the updated document
    );

    // Check if the company was found and updated
    if (!updatedCompany) {
      return res.status(404).json({ error: "Company not found" });
    }

    // Send the updated company data in the response
    res.status(200).json("updated url edit permission");
  } catch (error) {
    // Handle errors
    next(error);
  }
});

exports.getsharereferalSettingsAdmin = catchAsyncErrors(
  async (req, res, next) => {
    try {
      const { companyID } = req.body;
      console.log(companyID, "body");

      // Validate if companyID is provided
      if (!companyID) {
        return res.status(400).json({ error: "Company ID is required" });
      }

      // Find the CompanyShareReferralModel by companyId
      const companyShareReferral = await CompanyShareReferralModel.findOne({
        companyID: companyID,
      });

      // Check if the companyShareReferral was found
      if (!companyShareReferral) {
        return res
          .status(404)
          .json({ error: "Company Share Referral settings not found" });
      }

      // Send the data in the response
      res.status(200).json(companyShareReferral);
    } catch (error) {
      // Handle errors
      next(error);
    }
  }
);

exports.UpdateLeadCaptureSettings = catchAsyncErrors(async (req, res, next) => {
  try {
    const { companyID, updateValues } = req.body;
    console.log(updateValues, "bodydyy");

    // Validate if companyID and updateValues are provided
    if (!companyID || !updateValues) {
      return res
        .status(400)
        .json({ error: "Company ID and update values are required" });
    }

    // Find the CompanyShareReferralModel by companyId
    const companyShareReferral = await CompanyShareReferralModel.findOne({
      companyID: companyID,
    });

    // Check if the companyShareReferral was found
    if (!companyShareReferral) {
      return res
        .status(404)
        .json({ error: "Company Share Referral settings not found" });
    }

    companyShareReferral.set(updateValues);
    await companyShareReferral.save();

    // Send the updated data in the response
    res.status(200).json(companyShareReferral);
  } catch (error) {
    // Handle errors
    next(error);
  }
});
exports.getTeamofCompany = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.body;
  console.log(id, "sadadas");

  const team = await Team.find({ companyID: id });
  // console.log(team ,"teamname")
  res.status(200).json({ message: "Users updated successfully", team });
});

exports.updateTeamNamebyAdmin = catchAsyncErrors(async (req, res, next) => {
  const { selectedUsers, team } = req.body;

  // Loop through the array of selected user IDs
  for (const userId of selectedUsers) {
    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ message: `User not found with ID: ${userId}` });
    }

    // Update the user's team with the new team name
    user.team = team;
    await user.save(); // Save the changes to the user
  }

  res.status(200).json({ message: "Users updated successfully" });
});

// Remove Team from Users
exports.removeTeamFromUsersByadmin = catchAsyncErrors(
  async (req, res, next) => {
    const { selectedUsers } = req.body;

    for (const userId of selectedUsers) {
      const user = await User.findById(userId);

      if (!user) {
        return res
          .status(404)
          .json({ message: `User not found with ID: ${userId}` });
      }

      user.team = null; // Remove the team association
      await user.save();
    }

    res.status(200).json({ message: "Team removed from users successfully" });
  }
);

exports.deleteteamofselectedcompany = catchAsyncErrors(
  async (req, res, next) => {
    const { teamId } = req.body; // Assuming you have the team's unique ID available

    // Find and delete the team by its ID
    const deletedTeam = await Team.findByIdAndDelete(teamId);

    if (!deletedTeam) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Find users belonging to the deleted team
    const usersToDelete = await User.find({ team: deletedTeam._id });
    const companyID = usersToDelete?.[0]?.companyID;

    // Remove the team association from the users
    for (const user of usersToDelete) {
      user.team = null; // You can set it to an empty string or null if needed
      await user.save();
    }
    // Find remaining teams of the company
    const remainingTeams = await Team.find({ companyID });

    res
      .status(200)
      .json({ message: "Team deleted successfully", remainingTeams });
  }
);

exports.renameteamofselectedcompany = catchAsyncErrors(
  async (req, res, next) => {
    const { teamId, newTeamName } = req.body; // Assuming you have the team's unique ID and the new team name available

    try {
      // Find the team by its ID
      const team = await Team.findById(teamId);
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }

      // Check if the new team name already exists
      const isExistingTeam = await Team.exists({
        _id: { $ne: teamId }, // Exclude the current team from the check
        name: newTeamName,
      });

      if (isExistingTeam) {
        return res
          .status(400)
          .json({ message: "New team name already exists" });
      }

      // Update the team name
      team.team_name = newTeamName;
      await team.save();

      // Update user's team name
      // const usersToUpdate = await User.find({ team: teamId }); // Find users belonging to the old team
      // for (const user of usersToUpdate) {
      //   user.team = newTeamName;
      //   await user.save();
      // }

      res.status(200).json({ message: "Team renamed successfully", team });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

exports.createNewteamofselectedcompany = catchAsyncErrors(
  async (req, res, next) => {
    console.log("team");
    // console.log(req.user,"wdsafeg")
    // const companyID = req.user.companyID;
    // const userID = req.user._id;
    const { team_name, companyID } = req.body;
    console.log(companyID);
    console.log(team_name);
    const teamData = {
      team_name: team_name,
      companyID: companyID,
    };

    const team = await Team.create(teamData);
    const latestTeamId = team._id;
    // console.log(userID);

    console.log("Updated User Informationhg", team);

    if (!team) {
      return res.status(404).json({ message: "Team not created" });
    }

    // const company = await Company.findOne(companyID).populate("primary_account"); // Replace with proper query
    // const company = await team.findOne() // Replace with proper query

    // if (!company) {
    //   return res.status(404).json({ message: "Company not found" });
    // }

    // if (company.teams?.includes(team_name)) {
    //   return res.status(400).json({ message: "This team already exists" });
    // }

    // company.team?.push(team_name);
    // await company.save();

    res.status(201).json({ message: "Team created successfully", team });
  }
);

exports.getAllShippingAddressofcompany = catchAsyncErrors(
  async (req, res, next) => {
    const { id } = req.body;
    console.log(id, req.body, "alalalal");
    try {
      const shippingAddresses = await shippingAddress.find({ userId: id });

      res.status(200).json({
        success: true,
        shippingAddresses,
      });
    } catch (err) {
      return next(new ErrorHandler("Unable to fetch shipping addresses", 500));
    }
  }
);

exports.removeShippingAddressofcompany = catchAsyncErrors(
  async (req, res, next) => {
    const { id } = req.body;
    const { addressId } = req.params;
    console.log(addressId, id, " address id");

    try {
      const userShippingAddress = await shippingAddress.findOne({ userId: id });
      console.log(userShippingAddress, "userShippingAddress");

      if (!userShippingAddress) {
        return next(new ErrorHandler("User shipping address not found", 404));
      }

      const { shipping_address } = userShippingAddress;
      console.log(shipping_address, "shipping address");
      // Find the index of the shipping address to remove
      const addressIndex = shipping_address.findIndex(
        (address) => address._id == addressId
      );
      console.log(addressIndex, "address indexx");

      if (addressIndex === -1) {
        return next(new ErrorHandler("Shipping address not found", 404));
      }

      // Remove the shipping address from the array
      shipping_address.splice(addressIndex, 1);

      // Save the updated document
      await userShippingAddress.save();

      res.status(200).json({
        success: true,
        message: "Shipping address removed successfully",
      });
    } catch (err) {
      return next(new ErrorHandler("Error removing shipping address", 500));
    }
  }
);

exports.createShippingAddressofcompany = catchAsyncErrors(
  async (req, res, next) => {
    const {
      address_name,
      first_name,
      last_name,
      company_name,
      line1,
      line2,
      city,
      state,
      country,
      postal_code,
      id,
    } = req.body;

    console.log(req.body, "olaolaoala", id);

    const user = await User.findById(id);

    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    const shippingAddressData = {
      address_name,
      first_name,
      last_name,
      company_name,
      line1,
      line2,
      city,
      state,
      country,
      postal_code,
    };

    let shippingAddressFind = await shippingAddress.findOne({
      userId: user._id,
    });

    if (!shippingAddressFind) {
      shippingAddressFind = new shippingAddress({
        userId: user._id,
        shipping_address: [shippingAddressData],
      });
    } else {
      shippingAddressFind.shipping_address.push(shippingAddressData);
    }

    try {
      await shippingAddressFind.save();

      res.status(201).json({
        success: true,
        message: "Shipping address added successfully",
        shippingAddressData,
      });
    } catch (error) {
      return next(new ErrorHandler("Error saving shipping address", 500));
    }
  }
);

exports.editShippingAddressofcompany = catchAsyncErrors(
  async (req, res, next) => {
    // console.log("edit called")
    // alert("alert")
    const { editAddressId } = req.params;
    console.log(editAddressId, "id"); // Get the address ID from the request URL
    const { shippingAddressData, id } = req.body;
    console.log(req.body, "yjos body");

    const completeShippingAddressData = {
      _id: editAddressId,
      ...shippingAddressData,
    };

    try {
      const userShippingAddress = await shippingAddress.findOne({ userId: id });
      // console.log(userShippingAddress, "userShippingAddress")

      if (!userShippingAddress) {
        return next(new ErrorHandler("User shipping address not found", 404));
      }

      const { shipping_address } = userShippingAddress;
      // console.log(shipping_address, "shipping address")

      // Find the index of the shipping address to edit
      const addressIndex = shipping_address.findIndex(
        (address) => address._id == editAddressId
      );
      console.log(addressIndex, "address index");

      if (addressIndex === -1) {
        return next(new ErrorHandler("Shipping address not found", 404));
      }

      // Update the shipping address data
      shipping_address[addressIndex] = completeShippingAddressData;

      console.log(shipping_address, "Shipping");

      // Save the updated document
      await userShippingAddress.save();

      res.status(200).json({
        success: true,
        message: "Shipping address updated successfully",
        updatedShippingAddress: shipping_address[addressIndex],
      });
    } catch (err) {
      return next(new ErrorHandler("Error updating shipping address", 500));
    }
  }
);

exports.updateuserroleofcompanyusers = catchAsyncErrors(
  async (req, res, next) => {
    const { superAdmins, administrators, managers, teammember } = req.body;

    try {
      // Define a function to update roles based on the provided user IDs and role
      const updateUserRoles = async (userIds, userRole) => {
        await User.updateMany({ _id: { $in: userIds } }, { role: userRole });
      };

      // Update user roles for each role category
      await updateUserRoles(
        superAdmins.map((user) => user.id),
        "superadmin"
      );
      await updateUserRoles(
        administrators.map((user) => user.id),
        "administrator"
      );
      await updateUserRoles(
        managers.map((user) => user.id),
        "manager"
      );
      await updateUserRoles(
        teammember.map((user) => user.id),
        "teammember"
      );

      res.status(200).json({
        success: true,
      });
    } catch (error) {
      console.error("Error updating user roles:", error);
      res.status(500).json({
        success: false,
        error: "Error updating user roles",
      });
    }
  }
);

exports.updateuserplanonrolechangeofcompany = catchAsyncErrors(
  async (req, res, next) => {
    const { userID, subscriptionDetails } = req.body;
    try {
      // const updatedUser = await User.findByIdAndUpdate(
      const filter = {
        user_id: { $in: userID },
      };

      const update = {
        $set: { subscription_details: subscriptionDetails },
      };
      // Update user subscription_details based on userIDs array
      const updatedUser = await UserInformation.updateMany(filter, update);
      res.status(200).json({
        success: true,
        data: updatedUser,
      });
    } catch (error) {
      console.error("Error updating subscription details:", error);
      res.status(500).json({
        success: false,
        error: "Error updating subscription details",
      });
    }
  }
);

//fetch billing address
exports.fetchbillingaddressofcompany = catchAsyncErrors(
  async (req, res, next) => {
    const { id } = req.body;

    const billingData = await billingAddress.find({ userId: id });

    if (!billingData || billingData.length === 0) {
      return next(new ErrorHandler("No Billing details found", 404));
    }

    const firstBillingAddress = billingData[0];

    res.status(201).json({
      success: true,
      billingData: firstBillingAddress,
    });
  }
);

exports.getallcompanynames = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.body;
  console.log(id);
  const companies = await Company.find({ _id: { $ne: id } }, "company_name");

  if (!companies) {
    return next(new ErrorHandler("No companies Found", 404));
  }
  res.status(200).json({
    success: true,
    companies, // Return the selected fields
  });
});

exports.updateBillingAddressofcompany = catchAsyncErrors(
  async (req, res, next) => {
    const {
      firstName,
      lastName,
      companyName,
      billing_address,
      superAdminUserid,
      companyID,
    } = req.body;
    const userData = {
      first_name: firstName,
      last_name: lastName,
    };
    console.log(superAdminUserid, userData);

    const BillingAddressData = {
      billing_address: billing_address,
    };

    const updateUser = await User.findOneAndUpdate(
      { _id: superAdminUserid },
      userData
    );
    const updateBilling = await billingAddress.findOneAndUpdate(
      { userId: superAdminUserid },
      BillingAddressData,
      { new: true, upsert: true }
    );

    const updateCompany = await Company.findByIdAndUpdate(companyID, {
      company_name: companyName,
    });

    await updateBilling.save();
    await updateCompany.save();

    res.status(201).json({
      success: true,
      message: "Data Updated Successfully",
      updateCompany,
    });
  }
);

// For fetch all OTC_Adminusers

exports.otcadminusers = catchAsyncErrors(async (req, res, next) => {
  try {
    // Retrieve all admin users from the database
    const allUsers = await AdminUsers.find({}, { password: 0 }).populate({
      path: "team",
      model: "Otc_Adminteams",
      select: "team_name"
    });


    // Respond with the retrieved users
    res.status(200).json(allUsers);
  } catch (error) {
    res.status(500).send("Error fetching admin users");
  }
});

// For ADD new OTC_Adminusers

exports.addAdminUser = catchAsyncErrors(async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      officenumber,
      jobTitles,
      userRole,
      adminuser,
    } = req.body;

    // Generate a password
    const password = generatePassword();
    const rootDirectory = process.cwd();
    const uploadsDirectory = path.join(rootDirectory, "uploads");
    const logoPath = path.join(uploadsDirectory, "Logo.png");

    // Save form data and job titles to the main collection for a new user
    const newFormData = new AdminUsers({
      firstName,
      lastName,
      password,
      email,
      phoneNumber,
      officenumber,
      jobTitles,
      userRole,
    });

    await newFormData.save();

    // Send email with the generated password
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      port: 587,
      auth: {
        user: process.env.NODMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASS,
      },
    });

    const mailmsg = {
      from: "onetapconnect:otcdevelopers@gmail.com",
      to: email,
      subject: "Welcome to Your App - Your New Password",
      html: `
    <!DOCTYPE html>
    <html>
    
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="initial-scale=1, width=device-width" />
    </head>
    
    <body style="margin: 0; line-height: normal; font-family: 'Assistant', sans-serif;">
    
        <div style="background-color: #f2f2f2; padding: 20px; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #000; border-radius: 20px 20px 0 0; padding: 20px 15px; text-align: center;">
            <img src="cid:logo">
            
            </div>
            <div style="background-color: #fff; border-radius: 0 0 20px 20px; padding: 20px; color: #333; font-size: 14px;">
            <!-- <div><img src="https://onetapconnect.com/wp-content/uploads/2023/05/OneTapConnect-logo-2023.png" width="150px"/></div> -->
           
            <p>Dear ${firstName}<br/><br/>
            We are excited to invite you to join OneTap Connect! As a valued member of our community.<br/><br/>
            To get started, simply click on the link below to Login your account:<br/><br/>
            <div style="flex: 1; display: flex; justify-content: center; align-items: center; border-radius: 4px; overflow: hidden; background-color: #e65925; margin: 20px 0;">
            <a href="${process.env.FRONTEND_URL}/admin" style="display: inline-block; padding: 10px 20px; font-weight: 100; color: #fff; text-align: center; text-decoration: none;">Click here to Login</a> </div><br/><br/>
            Your password is: ${password}<br/><br/>
            Please log in using your email address and password provided.<br/><br/>
            In case you facing any technical issue, please contact our support team <a href="https://onetapconnect.com/contact-sales/">here.</a><br/><br/>
            We look forward to having you as a part of our community and hope you enjoy your experience on OneTap Connect!<br/><br/>
            Best regards,<br/>
            ${adminuser.adminfirstName} ${adminuser.adminlastName}<br/><br/>
           <p>OneTapConnect</p>
        </div>
    
    </body>
    
    </html>
    
    
  `,
      attachments: [
        {
          filename: "Logo.png",
          path: logoPath,
          cid: "logo",
        },
      ],
    };

    transporter.sendMail(mailmsg, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        // Handle error, show a message, etc.
      } else {
        console.log("Email sent: " + info.response);
      }
    });

    res.status(200).json(newFormData);
  } catch (error) {
    console.error("Error adding new user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// For UPDATE OTC_Adminusers

exports.updateAdminUser = catchAsyncErrors(async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      officenumber,
      jobTitles,
      userRole,
    } = req.body;
    const userId = req.params.userId;

    // Update user data
    const updatedUser = await AdminUsers.findByIdAndUpdate(
      userId,
      {
        firstName,
        lastName,
        email,
        phoneNumber,
        officenumber,
        jobTitles,
        userRole,
      },
      { new: true } // Return the updated document
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating user data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

exports.getcompanyorders = catchAsyncErrors(async (req, res, next) => {
  const { companyId } = req.body;
  console.log(companyId, "compnay");
  try {
    // Find orders by user ID
    const orders = await Order.find({ company: companyId })
      .populate({
        path: "smartAccessories.productId",
        select: "name", // Assuming 'name' is the field in the 'Product' model that contains the product name
      })
      .populate({
        path: "user",
        modal: "user",
      });
    console.log(orders, "aaaaaaaaaaaa");
    res.status(200).json({ success: true, orders: orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

exports.GetorderByCompanyIDandOrderNumber = catchAsyncErrors(
  async (req, res, next) => {
    const { orderNumber } = req.body;

    try {
      // Find the order by order number
      const order = await Order.findOne({ orderNumber });

      if (order) {
        res.json(order);
      } else {
        res.status(404).json({ error: "Order not found" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

exports.saveclientTags = catchAsyncErrors(async (req, res, next) => {
  const { TagData, compID, removedTag } = req.body;
  console.log(TagData, compID, "zzzzzzzzzzzzzzz");

  try {
    // Find the document with the given compID
    const existingDoc = await Company.findOne({ _id: compID });

    if (!existingDoc) {
      return res.status(400).json({ message: "Company not found" });
    }
    if (removedTag) {
      // Remove the tag from the company
      await Company.updateOne(
        { _id: compID },
        { $pull: { client_Tags: { value: removedTag } } }
      );
    }

    const clientTags = existingDoc.client_Tags;
    const clientTagValues = clientTags.map((tag) => tag.value);
    console.log(clientTagValues);

    // Use filter to get values in TagData not present in clientTagValues
    const uniqueTagData = TagData.filter(
      (tag) => !clientTagValues.includes(tag)
    );
    console.log(uniqueTagData, "Unique tags to add");

    // Convert uniqueTagData to an array of objects with the "value" field
    const tagValues = uniqueTagData.map((value) => ({ value }));

    // Add new unique tags to the company
    await Company.updateOne(
      { _id: compID },
      { $push: { client_Tags: { $each: tagValues } } }
    );

    // Send a response, if needed
    res
      .status(200)
      .json({ success: true, message: "Array updated/created successfully" });
  } catch (error) {
    // Handle errors
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

exports.getclienttags = catchAsyncErrors(async (req, res, next) => {
  const { compID } = req.body;
  try {
    // Find the document with the given compID
    const existingDoc = await Company.findOne({ _id: compID });

    if (!existingDoc) {
      return res.status(400).json({ message: "Company not found" });
    }

    const clientTags = existingDoc.client_Tags;
    const clientTagValues = clientTags.map((tag) => tag.value);
    console.log(clientTagValues);

    // Send a response, if needed
    res.status(200).json({
      success: true,
      clientTagValues,
      message: "Array updated/created successfully",
    });
  } catch (error) {
    // Handle errors
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});
exports.sendOrderInvoice = catchAsyncErrors(async (req, res, next) => {
  console.log("????????????????????????????????????????????????????????");
  console.log(req.body);
  const { invoiceOrderData } = req.body;

  console.log(invoiceOrderData, "invoice order data");
  // const { planData } = req.body
  try {
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      port: 587,
      auth: {
        user: process.env.NODMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASS,
      },
    });
    const rootDirectory = process.cwd();
    const uploadsDirectory = path.join(rootDirectory, "uploads", "Logo.png");

    const mailOptions = {
      from: "OneTapConnect:otcdevelopers@gmail.com", // Replace with your email
      to: invoiceOrderData.email,
      // to: "tarun.syndell@gmail.com",
      subject: "Welcome to OneTapConnect! Your Subscription is Confirmed",
      // text: `Your order with ID ${orderId} has been successfully placed. Thank you for shopping with us!`,
      html: `
      <!DOCTYPE html>
  <html>
  
  <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="initial-scale=1, width=device-width" />
  </head>
  
  <body style="margin: 0; line-height: normal; font-family: 'Assistant', sans-serif;">
  
      <div style="background-color: #f2f2f2; padding: 20px; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #000; border-radius: 20px 20px 0 0; padding: 20px 15px; text-align: center;">
          <img src="cid:logo">
          </div>
          <div style="background-color: #fff; border-radius: 0 0 20px 20px; padding: 20px; color: #333; font-size: 14px;">
          <!-- <div><img src="https://onetapconnect.com/wp-content/uploads/2023/05/OneTapConnect-logo-2023.png" width="150px"/></div> -->
          <h3>Welcome to OneTapConnect!</h3>
          <p>Dear ${invoiceOrderData.name},<br/>
          <p>Thank you for choosing OneTapConnect! We're excited to confirm that your subscription is now active. You are officially part of our community, and we appreciate your trust in us.</p>
          <p>Subscription Details:</p>
          <ul>
            <li><b>Subscription Plan:</b>&nbsp;&nbsp;${
              invoiceOrderData.planType
            }</li>
            <li><b>Duration:</b>&nbsp;&nbsp;${
              invoiceOrderData.billing_cycle
            }</li>
            <li><b>Renewal Date:</b>&nbsp;&nbsp;${new Date(
              invoiceOrderData.renewal_date
            ).toLocaleDateString()}</li>
            <li><b>Amount:</b>&nbsp;&nbsp;$ ${
              invoiceOrderData.total_amount
            }</li>
          </ul>

          <!-- Invoice Table -->
          <table style="width: 100%; margin-top: 20px; border-collapse: collapse;">
            <thead>
                <tr style="background-color: #e65925; color: #fff; text-align: left;">
                    <th style="padding: 10px;">Subscription</th>
                    <!-- <th style="padding: 10px;">Description</th> -->
                    <!-- <th style="padding: 10px;">Unit Price</th> -->
                    <th style="padding: 10px; text-align: center;">Quantity</th>
                    <th></th>
                    <th style="padding: 10px;">Price</th>
                </tr>
            </thead>
            <tbody>
                <!-- Add your invoice items dynamically here -->
                <tr>
                    <td>${invoiceOrderData.planType}-${
        invoiceOrderData.billing_cycle
      }</td>
                    <!-- <td>Description of Your Item</td> -->
                    <!-- <td></td> -->
                    <td style="text-align: center;">&nbsp;&nbsp;1</td>
                    <td></td>
                    <td>&nbsp;&nbsp;$ ${invoiceOrderData.total_amount}</td>
                </tr>
                <tr style="border-bottom: 1px solid #ccc;">
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                </tr>
                <tr>
                    <td></td>
                    <td></td>
                    <td style="text-align: end;">Initial setup fee</td>
                    <td>&nbsp;&nbsp;</td>
                </tr>
                <tr>
                    <td>addonname</td>
                    <td></td>
                    <td></td>
                    <td>&nbsp;&nbsp;price</td>
                </tr>
                <tr style="border-bottom: 1px solid #ccc;">
                    <td>Payment Method:</td>
                    <td style="text-align: center;">&nbsp;&nbsp;method</td>
                </tr>
                <tr style="border-bottom: 1px solid #ccc;">
                    <td></td>
                    <td></td>
                    <td style="text-align: end;"><b>Total:</b></td>
                    <td>&nbsp;&nbsp;$ ${invoiceOrderData.total_amount}</td>
                </tr>
                <!-- Add more rows as needed -->
            </tbody>
        </table><br/>

          <p>Please keep this email for your records.</p>
          <div style="display: flex; justify-content: space-evenly; gap: 25px; ">
        </div> 
          <h3>Technical issue?</h3>
          <p>In case you facing any technical issue, please contact our support team <a href="https://onetapconnect.com/contact-sales/">here</a>.</p>
      </div>
  
  </body>
  
  </html>
`,
      attachments: [
        {
          filename: "Logo.png",
          path: uploadsDirectory,
          cid: "logo",
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    console.log("Order confirmation email sent successfully");
    res.status(200).json({
      invoiceOrderData,
      message: "Order confirmation email sent successfully ",
    });
  } catch (error) {
    console.error("Error sending order confirmation email:", error);
  }
});

exports.addreferer = catchAsyncErrors(async (req, res, next) => {
  const { companyId, referrer } = req.body;
  try {
    // Find the document by ID
    const company = await Company_information.findById(companyId);

    // If the document is found, update the referrer field
    if (company) {
      company.referer = referrer;
      await company.save();

      return res.json({
        success: true,
        message: "Referrer added successfully",
      });
    } else {
      return res
        .status(404)
        .json({ success: false, message: "Company not found" });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
});
exports.getreferer = catchAsyncErrors(async (req, res, next) => {
  const { companyId } = req.body;

  const referer = await Company_information.findOne(
    { _id: companyId },
    "referer"
  );

  if (!referer) {
    return res.status(404).json({
      success: false,
      message: "Referer not found for the given company ID",
    });
  }

  res.status(200).json({ success: true, referer });
});

exports.createAdminTeam = catchAsyncErrors(async (req, res, next) => {
  const { team_name } = req.body;

  try {
    const newTeam = new Otc_Adminteams({ team_name });
    await newTeam.save();
    res.status(201).json({ message: "Admin Team added successfully" });
  } catch (error) {
    console.error("Error adding team:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

exports.getAdminTeam = catchAsyncErrors(async (req, res, next) => {
  try {
    const teams = await Otc_Adminteams.find();
    res.status(200).json({ teams });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});


exports.deleteAdminTeam = catchAsyncErrors(async (req, res, next) => {
  const { teamId } = req.body; 

  // Find and delete the team by its ID
  const deletedTeam = await Otc_Adminteams.findByIdAndDelete(teamId);

  if (!deletedTeam) {
    return res.status(404).json({ message: "Team not found" });
  }

  // Find users belonging to the deleted team
  const usersToDelete = await AdminUsers.find({ team: deletedTeam._id });

  // Remove the team association from the users
  for (const user of usersToDelete) {
    user.team = null; // You can set it to an empty string or null if needed
    await user.save();
  }

  res.status(200).json({ message: "Team deleted successfully" });
});

exports.adminRenameTeam = catchAsyncErrors(async (req, res, next) => {
  const { teamId, newTeamName } = req.body;

  try {
    const result = await Otc_Adminteams.updateOne(
      { _id: teamId },
      { team_name: newTeamName }
    );

    if (result) {
      res.status(200).json({ message: "Team updated successfully" });
    }
  } catch (error) {
    console.error("Error updating team:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

exports.addUserTeam = catchAsyncErrors(async (req, res, next) => {
  const { selectedUsers, team } = req.body;

  // Loop through the array of selected user IDs
  for (const userId of selectedUsers) {
    const user = await AdminUsers.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ message: `User not found with ID: ${userId}` });
    }

    // Update the user's team with the new team name
    user.team = team;
    await user.save(); // Save the changes to the user
  }

  res.status(200).json({ message: "Users updated successfully" });
});

exports.removeUserTeam = catchAsyncErrors(async (req, res, next) => {
  const { selectedUsers } = req.body;

  for (const userId of selectedUsers) {
    const user = await AdminUsers.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ message: `User not found with ID: ${userId}` });
    }

    user.team = null; 
    await user.save();
  }

  res.status(200).json({ message: "Team removed from users successfully" });
});