const catchAsyncErrors = require("../../../middleware/catchAsyncErrors.js");
const ErrorHandler = require("../../../utils/errorHandler.js");
const User = require("../../../models/NewSchemas/UserModel.js");
const Cards = require("../../../models/NewSchemas/CardModel.js");
const Team = require("../../../models/NewSchemas/Team_SchemaModel.js");
const sendOtcToken = require("../../../utils/adminauthToken.js");
const AdminUsers = require("../../../models/Otc_AdminModels/Otc_Adminusers.js");
const UserInformation = require("../../../models/NewSchemas/users_informationModel.js");
const Company = require("../../../models/NewSchemas/Company_informationModel.js");
const Adminaddons = require("../../../models/NewSchemas/OtcAddOnsSchema.js")
const Plan = require("../../../models/NewSchemas/OtcPlanSchemaModal.js");
const Coupon = require("../../../models/NewSchemas/OtcCouponModel.js");
const Category = require("../../../models/NewSchemas/OtcCategoryModel.js");
const CompanyShareReferralModel = require("../../../models/Customers/Company_Share_Referral_DataModel.js");
const RedirectLinksModal = require("../../../models/NewSchemas/RedirectLinksModal.js");
const Order = require("../../../models/NewSchemas/orderSchemaModel.js");
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
      // Create a map to track seen company IDs
      const seenCompanyIDs = new Map();
      const filteredUserInformationTeamData = [];

      for (const data of userInformationTeamData) {
        const companyID = data.company_ID._id;

        // If the company ID is not in the map, add it to the map and add the data to the filtered array
        if (!seenCompanyIDs.has(companyID)) {
          seenCompanyIDs.set(companyID, true);
          filteredUserInformationTeamData.push(data);
        }
      }
      const ReverseData = filteredUserInformationTeamData.reverse();
      console.log(filteredUserInformationTeamData);

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

      const company_id = user[0].company_ID._id

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
        user, userTeamData, allteams
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
          select: "team_name"
        },
      });
      const companydata = await Company.findOne({ _id: id }).populate({
        path: "primary_billing",
        model: "user", // Adjust the model name as needed
        select: "first_name last_name avatar role designation",
      });
      const allteams = await Team.find({ companyID: id });
      if (!userInformationTeamData) {
        return next(new ErrorHandler("No company details Found", 404));
      }
      res.status(200).json({
        success: true,
        userInformationTeamData,
        companydata,
        allteams
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
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

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
      const existingAddon = await Adminaddons.findByIdAndUpdate(id, updatedData, { new: true });
      if (!existingAddon) {
        return res.status(404).json({ error: 'Addon not found' });
      }
      return res.json(existingAddon);
    } else {
      const isUnique = await isAddonCustomPermalinkUnique(CustomPermalink);
      if (!isUnique) {
        CustomPermalink = await generateAddonUniqueCustomPermalink(CustomPermalink);
      }

      const newAddon = new Adminaddons({ ...updatedData, CustomPermalink, publishedBy: name });
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
    const existingCategory = await Adminaddons.findOne({ CustomPermalink: uniquePermalink });
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
  const Addons = await Adminaddons.find()

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

    const { InternalPlanName, PublicPlanName, categoryType, description, image, imageName, altText, status, Visibility, activitylog, smart_accessories, add_ons } = planFormData;
    const { planType, users, monthlyPrice_perUser, monthly_fee, monthly_sku, yearlyPrice_perUser, yearly_fee, yearly_sku } = planData

    if (id) {
      // Editing an existing category

      const existingCategory = await Plan.findById(id);
      if (!existingCategory) {
        return res.status(404).json({ success: false, message: 'Category not found' });
      }

      // Check if CustomPermalink is not changed or is unique
      if (CustomPermalink !== existingCategory.CustomPermalink) {
        const isUnique = await isPlanCustomPermalinkUnique(CustomPermalink);
        if (!isUnique) {
          CustomPermalink = await plangenerateUniqueCustomPermalink(CustomPermalink);
        }
      }

      const updatedCategory = await Plan.findByIdAndUpdate(
        id,
        { InternalPlanName, PublicPlanName, categoryType, CustomPermalink, description, image, imageName, altText, status, Visibility, activitylog, planType, users, monthlyPrice_perUser, monthly_fee, monthly_sku, yearlyPrice_perUser, yearly_fee, yearly_sku, smart_accessories, add_ons },
        { new: true } // Return the updated document
      );
      res.status(200).json({ success: true, category: updatedCategory });
    } else {
      // Creating a new category
      const isUnique = await isPlanCustomPermalinkUnique(CustomPermalink);
      if (!isUnique) {
        CustomPermalink = await plangenerateUniqueCustomPermalink(CustomPermalink);
      }

      const newplans = new Plan({
        InternalPlanName, PublicPlanName, categoryType, CustomPermalink, description, image, imageName, altText, status, Visibility, activitylog, publishedDate: new Date(), planType, users, monthlyPrice_perUser, monthly_fee, monthly_sku, yearlyPrice_perUser, yearly_fee, yearly_sku, smart_accessories, add_ons
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
    const existingCategory = await Plan.findOne({ CustomPermalink: uniquePermalink });
    if (!existingCategory) {
      return uniquePermalink;
    }
    // Append a counter to the base permalink to make it unique
    uniquePermalink = `${basePermalink}-${counter}`;
    counter++;
  }
}

exports.getPlans = catchAsyncErrors(async (req, res, next) => {
  const Plans = await Plan.find().populate('smart_accessories').populate('add_ons');

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

    const { name, isActive, categoryType, description, image, imageName, altText, status, Visibility, activitylog } = productcategoryImage;

    if (id) {
      // Editing an existing category

      const existingCategory = await Category.findById(id);
      if (!existingCategory) {
        return res.status(404).json({ success: false, message: 'Category not found' });
      }

      // Check if CustomPermalink is not changed or is unique
      if (CustomPermalink !== existingCategory.CustomPermalink) {
        const isUnique = await isCategoryCustomPermalinkUnique(CustomPermalink);
        if (!isUnique) {
          CustomPermalink = await categorygenerateUniqueCustomPermalink(CustomPermalink);
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
        CustomPermalink = await categorygenerateUniqueCustomPermalink(CustomPermalink);
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
        publishedDate: new Date()
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
    const existingCategory = await Category.findOne({ CustomPermalink: uniquePermalink });
    if (!existingCategory) {
      return uniquePermalink;
    }
    // Append a counter to the base permalink to make it unique
    uniquePermalink = `${basePermalink}-${counter}`;
    counter++;
  }
}

exports.getCategories = catchAsyncErrors(async (req, res, next) => {
  const categories = await Category.find()

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
    console.log("hereeeeeeeeeeeeeeeeeeeeeeeeee", couponData)
    let customPermaLink = couponData.customPermaLink;
    console.log("hereeeeeeeeeeeeeeeeeeeeeeeeee", customPermaLink)
    if (id) {
      // If ID is provided, update the existing Coupon
      const existingCoupon = await Coupon.findByIdAndUpdate(id, couponData, { new: true });
      if (!existingCoupon) {
        return res.status(404).json({ error: 'Coupon not found' });
      }
      return res.json(existingCoupon);
    } else {
      const isUnique = await isCouponCustomPermalinkUnique(customPermaLink);
      if (!isUnique) {
        customPermaLink = await coupongenerateUniqueCustomPermalink(customPermaLink);
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
})

async function isCouponCustomPermalinkUnique(customPermaLink) {
  const existingCoupon = await Coupon.findOne({ customPermaLink });
  return !existingCoupon;
}

// Function to generate a unique customPermalink for coupons
async function coupongenerateUniqueCustomPermalink(basePermalink) {
  let uniquePermalink = basePermalink;
  let counter = 1;
  while (true) {
    const existingCoupon = await Coupon.findOne({ customPermaLink: uniquePermalink });
    if (!existingCoupon) {
      return uniquePermalink;
    }
    uniquePermalink = `${basePermalink}-${counter}`;
    counter++;
  }
}

exports.getCoupon = catchAsyncErrors(async (req, res, next) => {
  const Coupons = await Coupon.find()
  if (!Coupons) {
    return next(new ErrorHandler("No Coupons Found.....", 404));
  }
  res.status(200).json({
    coupons: Coupons,
  });
});

exports.getOrderssofcompany = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.body;
  console.log(id, req.body, "===============================================")
  {
    try {
      const Orderssofcompany = await Order.find({
        company: id,
      })

      if (!Orderssofcompany) {
        return next(new ErrorHandler("No company details Found", 404));
      }
      res.status(200).json({
        success: true,
        Orderssofcompany
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
  console.log(req.body)
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
  const { users, status } = req.body;

  // Loop through the array of user IDs
  for (let i = 0; i < users.length; i++) {
    const user = await User.findById(users[i]);

    if (!user) {
      return next(new ErrorHandler(`No user found with ID: ${users[i]}`, 404));
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
      return next(new ErrorHandler(`No user found with ID: ${companies[i]}`, 404));
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
exports.updateClientCompanyInformation = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.body;
  const { companyDetails } = req.body;
  console.log(id, companyDetails)

  const company = await Company.findById(id);

  if (!company) {
    return next(new ErrorHandler("Company not found", 404));
  }
  company.set(companyDetails);
  await company.save();

  res.status(200).json({
    company,
  });
});

exports.showClientCompanyCardDetails = catchAsyncErrors(async (req, res, next) => {
  const { userid } = req.body;

  const cards = await Cards.find({ userID: userid });

  if (!cards) {
    return next(new ErrorHandler("No card details found for this user", 404));
  }

  res.status(201).json({
    success: true,
    cards,
  });
});

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
    const user = await UserInformation.find({ user_id: id })
    const company_id = user[0].company_ID._id
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

    res.status(201).json({ message: "Redirect link created/updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }

}
);
