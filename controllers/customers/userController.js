const sendToken = require("../../utils/authToken.js");
const bcrypt = require("bcryptjs");
const sendMail = require("../../utils/sendMali.js");
const ErrorHandler = require("../../utils/errorHandler.js");
const catchAsyncErrors = require("../../middleware/catchAsyncErrors.js");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const crypto = require("crypto");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
// const User = require("../../models/Customers/UserModel.js");
const User = require("../../models/NewSchemas/UserModel.js");
// const UserInformation = require("../../models/NewSchemas/users_informationModel.js");
// const Company = require("../../models/Customers/CompanyModel.js");
const Company = require("../../models/NewSchemas/Company_informationModel.js");
const { processPayment } = require("../paymentController/paymentcontroller.js");
const Team = require("../../models/NewSchemas/Team_SchemaModel.js");
const multer = require("multer");
const path = require("path");
const sharp = require("sharp");
const fs = require("fs");
const InvitedTeamMemberModel = require("../../models/Customers/InvitedTeamMemberModel.js");
const CompanyShareReferralModel = require("../../models/Customers/Company_Share_Referral_DataModel");
// const Cards = require("../../models/Customers/CardsModel.js");
const Cards = require("../../models/NewSchemas/CardModel.js");
const generatePassword = require("../../utils/passwordGenerator.js");
const billingAddress = require("../../models/NewSchemas/user_billing_addressModel.js");
// const billingAddress = require("../../models/Customers/BillingAddressModal.js")
const shippingAddress = require("../../models/NewSchemas/user_shipping_addressesModel.js");
// const shippingAddress = require("../../models/Customers/ShippingAddressModal.js")
// const logo = require('../../uploads/logo/logo_black.svg')
const TeamDetails = require("../../models/NewSchemas/Team_SchemaModel.js");
const Team_SchemaModel = require("../../models/NewSchemas/Team_SchemaModel.js");
const UserInformation = require("../../models/NewSchemas/users_informationModel.js");
const GuestCustomer = require("../../models/NewSchemas/GuestCustomer.js");
const Order = require('../../models/NewSchemas/orderSchemaModel.js');
const parmalinkSlug = require('../../models/NewSchemas/parmalink_slug.js');
const ShareCardEmail = require('../../models/NewSchemas/ShareCardEmail.js');
const UserCouponAssociation = require('../../models/NewSchemas/OtcUserCouponAssociation.js')

const { getMaxListeners } = require("events");
// const AddOnsSchemaModel = require("../../models/NewSchemas/AddOnsSchemaModel.js");
const Adminaddonsschema = require("../../models/NewSchemas/OtcAddOnsSchema.js");
const { Types } = require("mongoose");
const SmartAccessoriesModal = require("../../models/NewSchemas/SmartAccessoriesModal.js");
dotenv.config();
const usedCodes = new Set();

//--sign up step - 1 ----
exports.signUP1 = catchAsyncErrors(async (req, res, next) => {
  const { email } = req.body;
  console.log(email);

  const user = await User.findOne({ email: email }).lean(); // Use .lean() to get a plain object
  // console.log(user);

  if (user) {
    console.log(user.email);
    return next(new ErrorHandler("The email is already in use.", 409));
  } else {
    console.log("else part");
  }

  const token = jwt.sign({ email: email }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
  const date = new Date();
  console.log(date);
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587, // Use 465 for SSL
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.NODMAILER_EMAIL,
      pass: process.env.NODEMAILER_PASS,
    },
    tls: { rejectUnauthorized: false },
  });
  const rootDirectory = process.cwd();
  const uploadsDirectory = path.join(rootDirectory, "uploads", "Logo.png");

  const message = {
    from: '`OneTapConnect:${process.env.NODMAILER_EMAIL}`',
    to: email,
    subject: `Verify your email address`,
    //   text: `Your Verification code is ${code}`,
    html: `
    <!DOCTYPE html>
<html>

<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="initial-scale=1, width=device-width" />
</head>

<body style="margin: 0;  line-height: normal; font-family: 'Assistant', sans-serif; background-color: #f2f2f2;">

  <div style=" padding: 20px; max-width: 600px; margin: 0 auto;">
    <div style="background-color: #000; border-radius: 20px 20px 0 0; padding: 2px 15px; text-align: center;">
    <img src="cid:logo">

    </div>
    <div style="background-color: #fff; margin-bottom:15px; border-radius: 0 0 20px 20px; padding: 20px; color: #333; font-size: 14px;">
        <div style="font-weight: bold; text-align: center;">Email verification</div>
        <p>Please click the “Verify email” button below to continue with the setup of your OneTapConnect account.</p>
        <p>If you believe you received the email by mistake, you may disregard this email, or contact our support team for any information.</p>
        <div class="main-div-" style="display:block; margin-top: 25px; juatify-content:center;  text-align: center;">
            <div style="flex: 1; border-radius: 4px; overflow: hidden; background-color: #e65925; margin: 0 24%;">
                <a href="${process.env.FRONTEND_URL}/register/${token}" style="display: inline-block; ; padding: 10px 20px; font-weight: 100; color: #fff; text-align: center; text-decoration: none;">Verify email</a>
            </div>
        </div>
        <div style="margin-top: 25px;">
            <p>Link not working? Please copy and paste the below URL to verify your email:</p>
            <p>${process.env.FRONTEND_URL}/register/${token}</p>
        </div>
        <div style="margin-top: 25px;">
            <div style="font-weight: bold; text-align: center;">Technical issue?</div>
            <div style="text-align: center; margin-top: 15px;">
                <span>In case you're facing any technical issue, please contact our support team </span>
                <span style="color: #2572e6;"><a href="https://support.onetapconnect.com/">here.</a></span>
            </div>
        </div>
    </div>
    <a href="https://www.OneTapConnect.com" style="text-align: center; font-size: 12px; color: #e65925; margin-top: 30px; text-decoration: none;margin-left: 40%;">OneTapConnect.com</a>
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
    //     <h3>Dear User</h3><br>
    //     <p>Thank you for choosing One Tap Connect LLC! We're thrilled to have you join our community. To complete your sign-up process, please click the button below:</p><br>
    //     <p></p><a href="${process.env.FRONTEND_URL}/sign-up/step-2/${user._id}">Click me</a> to complete sign up</p>
    //     <p>If you have any questions or need assistance, feel free to reach out to our customer support team at <a href="mailto:admin@onetapconnect.com">admin@onetapconnect.com</a></p><br>
    //     <p>We're excited to have you on board and can't wait to see you make the most of our services.
    //     </p>
    //     <p>
    //     Best regards,<br>
    // The One Tap Connect Team</p>
  };

  transporter.sendMail(message, (err, info) => {
    if (err) {
      console.log("error", err);
      return next(
        new ErrorHandler("The email was not sent. Please try again later.", 500)
      );
    } else {
      console.log(info);
      res.status(200).json({
        success: true,
        message: "Email sent successfully.",
      });
    }
  });
});

// function generateUniqueCode() {
//   let code;
//   const alphanumeric = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
//   do {
//     code = '';
//     for (let i = 0; i < 6; i++) {
//       const randomIndex = Math.floor(Math.random() * alphanumeric.length);
//       code += alphanumeric[randomIndex];
//     }
//   } while (usedCodes.has(code));
//   usedCodes.add(code);
//   return code;
// }
function generateUniqueCode() {
  let code;
  const alphabetic = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const totalPossibleCodes = Math.pow(alphabetic.length, 6);

  if (usedCodes.size >= totalPossibleCodes) {
    if (usedCodes.size >= Math.pow(alphabetic.length, 7)) {
      throw new Error("All possible 7-digit alphabetic codes have been generated.");
    }
    const newLength = 7;
    return generateCodeWithLength(newLength);
  }

  return generateCodeWithLength(6);
}
function generateCodeWithLength(length) {
  let code = '';
  const alphabetic = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  do {
    code = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * alphabetic.length);
      code += alphabetic[randomIndex];
    }
  } while (usedCodes.has(code));

  usedCodes.add(code);
  return code;
}


//sign-up step-2
exports.signUP2 = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.params;
  const {
    first_name,
    last_name,
    contact,
    isCompany,
    industry,
    company_name,
    team_size,
    password,
    googleId,
  } = req.body.signupData;

  const decodedData = jwt.verify(token, process.env.JWT_SECRET);
  const email = decodedData.email;
  let user;

  const trimedString = company_name.trim().replace(/\s+/g, " ").toLowerCase();

  const company = await Company.find();

  if (company_name !== "") {
    // checking if company already exists
    const companyExists = company.some(item => {
      const trimmedExistingName = item.company_name.trim().replace(/\s+/g, " ").toLowerCase();
      return trimmedExistingName === trimedString;
    });

    if (companyExists) {
      return next(new ErrorHandler("Company Already Exists.", 400));
    }
  }

  if (password === undefined) {
    user = await User.create({
      email,
      first_name,
      last_name,
      contact,
      isIndividual: !isCompany,
      googleId,
    });
  } else {
    user = await User.create({
      email,
      first_name,
      last_name,
      contact,
      isIndividual: !isCompany,
      password,
    });
  }
  const generatedCode = generateUniqueCode();
  const generatedcompanyCode = generateUniqueCode();
  if (!user) {
    return next(new ErrorHandler("Something went wrong please try again.", 400));
  }

  if (company_name === "" || company_name) {
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
    user.isVerfied = true;

    const companySettingSchema = await CompanyShareReferralModel.create({
      companyID: newCompany._id,
    });
    user.userurlslug = generatedCode;
    user.companyurlslug = generatedcompanyCode;


    await user.save({ validateBeforeSave: true });

    const userInfo = await UserInformation.create({
      user_id: user._id,
      company_ID: user.companyID
      // Add any other fields you want to store in userinfo
    });
    await userInfo.save();

    const user_parmalink = await parmalinkSlug.create({
      user_id: user._id,
      companyID: newCompany._id,
      unique_slugs: [{ value: generatedCode, timestamp: Date.now() }],
      companyunique_slug: [{ value: generatedcompanyCode, timestamp: Date.now() }],
      userurlslug: generatedCode,
      companyurlslug: generatedcompanyCode,
    })
    await user_parmalink.save();
  }
  sendToken(user, 200, res);
});

// exports.signUP2 = catchAsyncErrors(async (req, res, next) => {
//   const { token } = req.params;
//   const {
//     first_name,
//     last_name,
//     contact,
//     isCompany,
//     industry,
//     company_name,
//     team_size,
//     password,
//     googleId,
//   } = req.body.signupData;
//   console.log("google", googleId);

//   const decodedData = jwt.verify(token, process.env.JWT_SECRET);
//   const email = decodedData.email;
//   let user;
//   if (password === undefined) {
//     user = await User.create({
//       email,
//       first_name,
//       last_name,
//       contact,
//       isIndividual: !isCompany,
//       googleId,
//     });
//   } else {
//     user = await User.create({
//       email,
//       first_name,
//       last_name,
//       contact,
//       isIndividual: !isCompany,
//       password,
//     });
//   }
//   if (!user) {
//     return next(
//       new ErrorHandler("Something went wrong please try again.", 400)
//     );
//   }
//   if (company_name != "") {
//     const trimedString = company_name.replace(/\s/g, "").toLowerCase();

//     const company = await Company.find();

//     // checking if compnay already exists
//     company.map((item) => {
//       if (item.company_name.replace(/\s/g, "").toLowerCase() === trimedString) {
//         console.log(item.company_name);
//         return next(new ErrorHandler("Company Already Exists. ", 400));
//       }
//     });
//   }

//   const newCompany = await Company.create({
//     primary_account: user._id,
//     primary_manager: user._id,
//     primary_billing: user._id,
//     company_name,
//     industry,
//     contact,
//     team_size,
//   });

//   user.companyID = newCompany._id;
//   user.isVerfied = true;
//   const companySettingSchema = await CompanyShareReferralModel.create({
//     companyID: newCompany._id,
//   });
//   await user.save({ validateBeforeSave: true });

//   const userInfo = await UserInformation.create({
//     user_id: user._id,
//     company_ID: user.companyID
//     // Add any other fields you want to store in userinfo
//   });
//   await userInfo.save();

//   // res.status(200).json({
//   //   message: "user saved successfully",
//   //   user
//   // })

//   sendToken(user, 200, res);
// });

exports.registerUser = catchAsyncErrors(async (req, res, next) => {
  const {
    first_name,
    last_name,
    email,
    password,
    contact,
    isIndividual,
    isPaidUser,
    role,
    company_name,
    industry,
  } = req.body;
  const userData = ({
    first_name,
    last_name,
    email,
    password,
    contact,
    isIndividual,
    isPaidUser,
    role,
    company_name,
    industry,
  } = req.body);


  const user = await User.create(userData);

  const companyData = {
    company_name,
    industry,
    primary_account: user._id,
  };

  const company = await Company.create(companyData);

  user.companyID = company._id;
  user.save();

  res.status(201).json({
    user,
    company,
  });
});

//google signup
exports.googleSignUP = catchAsyncErrors(async (req, res, next) => {
  const JWT_SECRET_KEY = "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";
  const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  const { token } = req.body;

  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  const googleId = payload.sub;

  const urlToken = jwt.sign({ email: payload.email }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  const { name } = payload;

  // Split the fullName into an array of parts using space as the separator
  const parts = name.split(" ");

  // Extract the first name (assuming it's the first element) and the last name (assuming it's the second element)
  const first_name = parts[0]; // 'Manish'
  const last_name = parts[1]; // 'Shakya'

  const googleData = {
    first_name,
    last_name,
    googleId: payload.sub,
  };

  res.status(200).json({
    success: true,
    token: urlToken,
    googleData,
  });
});

exports.googleLogin = catchAsyncErrors(async (req, res, next) => {
  const JWT_SECRET_KEY = "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";
  const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  const { token } = req.body;

  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();

  const user = await User.findOne({ email: payload.email });

  if (!user) {
    return next(new ErrorHandler("User Not Found", 404));
  }

  if (user.googleId === null) {
    return next(
      new ErrorHandler(
        "User signed up with Email Password , Please use Email and Password",
        400
      )
    );
  }
  if (user.status === "Deactivate") {
    return next(
      new ErrorHandler(
        "Your account has been deactivated by administrator.",
        401
      )
    );
  }
  if (user.delete_account_status === "inactive") {
    return next(
      new ErrorHandler("Your account has been deleted, please check your Email for more information.", 401)
    );
  }

  // res.send(payload)
  sendToken(user, 200, res);
});

//login user
exports.login = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;
  const lowercaseEmail = email.toLowerCase();
  console.log(lowercaseEmail, password);
  // checking if user has given password and email both

  if (!email || !password) {
    return next(new ErrorHandler("Please Enter Email & Password", 400));
  }

  const user = await User.findOne({ email: lowercaseEmail }).select("+password");

  if (!user) {
    return next(new ErrorHandler("User does not found. ", 401));
  }
  console.log(user);

  // Check if the user signed up with Google
  if (user.googleId !== null) {
    return next(
      new ErrorHandler("This account is associated with a Google login. Please log in with Google.", 400)
    );
  }

  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    console.log("2");
    return next(new ErrorHandler("Please enter valid password.", 401));
  }
  if (user.status === "Deactivate") {
    return next(
      new ErrorHandler(
        "Your account has been deactivated by administrator.",
        401
      )
    );
  }
  if (user.delete_account_status === "inactive") {
    return next(
      new ErrorHandler("Your account has been deleted, please check your Email for more information.", 401)
    );
  }
  sendToken(user, 200, res);
});

//logout
exports.logout = catchAsyncErrors(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged Out",
  });
});

//get profile user
exports.getProfile = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.user;

  // checking if user has given password and email both

  const user = await User.findById(id);

  if (!user) {
    return next(new ErrorHandler("user not found", 401));
  }
  if (user.delete_account_status === "inactive") {
    res.cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    });
    return next(
      new ErrorHandler("Your account has been deleted, please check your Email for more information.", 401)
    );
  }

  res.status(200).json({
    success: true,
    user,
  });
});

// forgot password
// exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {

//   const { email } = req.body;

//   const user = await User.findOne({ email });

//   if (!user) {
//     return next(new ErrorHandler("user not found", 404));
//   }

//   // Get reset passworsToken

//   const resetToken = user.getResetPasswordToken();

//   await user.save({ validateBeforeSave: false });

//   const transporter = nodemailer.createTransport({
//     service: "Gmail",
//     port: 587,
//     auth: {
//       user: process.env.NODMAILER_EMAIL,
//       pass: process.env.NODEMAILER_PASS,
//     },
//   });

//   const message = {
//     from: "otcdevelopers@gmail.com",
//     to: email,
//     subject: `Password recovery email`,
//     text: `Password reset link is  :- \n\n ${process.env.FRONTEND_URL + '/reset/password/' + resetToken} \n\n If you have not requested this email then please ignore It `,
//   };

//   try {
//     transporter.sendMail(message, (err, info) => {
//       if (err) {
//         console.log(err);
//       } else {
//         console.log(info);
//       }
//     });

//     res.status(200).json({
//       success: true,
//       message: `Email sent to ${email} successfully`,
//     });
//   } catch (error) {
//     return next(new ErrorHandler(error.message, 500));
//   }

// });

// forgot password

exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const { email } = req.body;

  try {
    // Check if you're using the correct SMTP settings
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587, // Use 465 for SSL
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.NODMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASS,
      },
      tls: { rejectUnauthorized: false },
    });

    const user = await User.findOne({ email });

    if (!user) {
      return next(new ErrorHandler("User not found.", 404));
    }

    if (user.googleId) {
      return next(
        new ErrorHandler("This email is associated with Gmail.", 401)
      );
    }

    // Generate or retrieve resetToken here
    const resetToken = user.getResetPasswordToken();
    const resetPasswordExpire = user.resetPasswordExpire;
    console.log("resetToken");
    console.log(resetToken);
    console.log(resetPasswordExpire);
    user.resetPasswordToken = resetToken;

    await user.save();
    await user.save({ validateBeforeSave: false });

    const rootDirectory = process.cwd();
    const uploadsDirectory = path.join(rootDirectory, "uploads", "Logo.png");
    const message = {
      from: "`OneTapConnect:${process.env.NODMAILER_EMAIL}`",
      to: email, // Replace with the recipient's email
      subject: "Password Recovery Email",
      // text: `Password reset link: ${process.env.FRONTEND_URL}/reset-password/${resetToken}\n\nIf you have not requested this email, please ignore it.`,
      html: `
      <!DOCTYPE html>
<html>

<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="initial-scale=1, width=device-width" />
</head>

<body style="margin: 0; line-height: normal; font-family: 'Assistant', sans-serif; background-color: #f2f2f2;">

  <div style=" padding: 20px; max-width: 600px; margin: 0 auto;">
    <div style="background-color: #000; border-radius: 20px 20px 0 0; padding: 2px 15px; text-align: center;">
      <img src="cid:logo">
    </div>
    <div style="background-color: #fff; border-radius: 0 0 20px 20px; padding: 20px; color: #333; font-size: 14px;">
      <!-- <div><img src="https://onetapconnect.com/wp-content/uploads/2023/05/OneTapConnect-logo-2023.png" width="150px"/></div> -->
      <p>Dear User</p>
      <p>We received a request to reset the password associated with your account. If you did not initiate this request, please disregard this email.</p>

      <p>To reset your password, please click the link below:</p>
      <a href="${process.env.FRONTEND_URL}/reset-password/${resetToken}" style="display: inline-block; padding: 10px 20px; background-color: #E65925;margin-top:10px ; margin-bottom:10px ; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>

      <p>If you're having trouble clicking the link, you can copy and paste the following URL into your browser's address bar:</p>

      <p>Please note that this link is valid for the next 24 hours. After that, you will need to request another password reset.</p>

      <p>If you have any questions or need further assistance, please contact our support team at <a href="mailto:admin@onetapconnect.com">admin@onetapconnect.com</a>.</p>

      <p>Best regards,<br>The One Tap Connect Team</p>
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
    // <div>
    //   <h3>Dear User</h3>
    //   <p>We received a request to reset the password associated with your account. If you did not initiate this request, please disregard this email.</p>

    //   <p>To reset your password, please click the link below:</p>
    //   <a href="${process.env.FRONTEND_URL}/reset-password/${resetToken}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>

    //   <p>If you're having trouble clicking the link, you can copy and paste the following URL into your browser's address bar:</p>

    //   <p>Please note that this link is valid for the next 24 hours. After that, you will need to request another password reset.</p>

    //   <p>If you have any questions or need further assistance, please contact our support team at <a href="mailto:admin@onetapconnect.com">admin@onetapconnect.com</a>.</p>

    //   <p>Best regards,<br>The One Tap Connect Team</p>
    //  </div>

    // Attempt to send the email
    await transporter.sendMail(message);

    // Email sent successfully
    res.status(200).json({
      success: true,
      message: `Email sent to ${email} successfully.`,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    res.send(error);

    // Handle the error properly
    return next(new ErrorHandler("Email sending failed", 500));
  }
});

//reset password
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
  console.log(req.params.token);
  //creating token hash
  // const resetPasswordToken = crypto
  //   .createHash("sha256")
  //   .update(req.params.token)
  //   .digest("hex");
  const resetPasswordToken = req.params.token;

  // console.log(token)

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  console.log(user);

  if (!user) {
    return next(
      new ErrorHandler(
        "Reset Password Token is invalid or has been expired",
        400
      )
    );
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  // sendToken(user, 200, res);
  res.status(200).json({
    success: true,
    message: "Password Updated Successfully",
  });
});

exports.getCompanyDetails = catchAsyncErrors(async (req, res, next) => {
  const { companyID } = req.user;
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

// get all team members
exports.getUsers = catchAsyncErrors(async (req, res, next) => {
  const { companyID } = req.user;
  console.log(companyID);
  const users = await User.find({ companyID, delete_account_status: 'active' });
  // const users = await User.find({ companyID});

  if (!users) {
    return next(new ErrorHandler("No company details Found", 404));
  }

  res.status(200).json({
    success: true,
    users,
  });
});

exports.getinvitedUsers = catchAsyncErrors(async (req, res, next) => {
  const { companyID } = req.user;

  try {
    // Fetch invited users based on companyID    
    const invitedusers = await InvitedTeamMemberModel.find({
      companyId: companyID,
    });

    // console.log(invitedusers, "%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%")

    if (invitedusers.length === 0) {
      return next(new ErrorHandler("No invited users found", 404));
    }

    for (const user of invitedusers) {
      if (user.status === 'pending' && user.invitationExpiry < new Date()) {
        // If status is pending and invitation has expired
        const newData = await InvitedTeamMemberModel.findOneAndUpdate(
          { _id: user._id },
          { status: 'unresponsive' },
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

exports.deleteInvitedUser = catchAsyncErrors(async (req, res, next) => {
  // const { companyID } = req.body;

  const { invitedUserID } = req.params; // Assuming the invited user's ID is passed as a URL parameter.
  console.log(invitedUserID);

  try {
    // Find and delete the invited user based on companyID and invitedUserID
    const deletedInvitedUser = await InvitedTeamMemberModel.findOneAndDelete({
      _id: invitedUserID,
    });

    if (!deletedInvitedUser) {
      return next(new ErrorHandler("Invited user not found", 404));
    }

    res.status(200).json({
      success: true,
      message: "Invited user deleted successfully",
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});
// get single team members
exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findById(id);
  if (!user) {
    return next(new ErrorHandler("No company details Found", 404));
  }
  // console.log(user.companyID, req.user.companyID);
  // if (user.companyID.toString() !== req.user.companyID.toString()) {
  //   return next(
  //     new ErrorHandler("You are not authorized to access this route", 401)
  //   );
  // }

  res.status(200).json({
    success: true,
    user,
  });
});

// update user team
exports.updateTeam = catchAsyncErrors(async (req, res, next) => {
  const { users, teams } = req.body;

  // Loop through the array of user IDs
  for (let i = 0; i < users.length; i++) {
    const user = await User.findById(users[i]);

    if (!user) {
      return next(new ErrorHandler(`No user found with ID: ${users[i]}`, 404));
    }

    // Update the user's team based on the corresponding team value
    // user.team = teams[i].value;
    //comment above line because this time we only select one team not multiple
    user.team = teams.value;
    await user.save(); // Save the changes to the user
  }

  res.status(200).json({
    success: true,
  });
});

// updtae users status
exports.updateStatus = catchAsyncErrors(async (req, res, next) => {
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

exports.requestToManagerForUpdateUserInfo = catchAsyncErrors(async (req, res, next) => {
  const { emailtoauth, message, requestedUserEmail } = req.body;
  const manageremails = emailtoauth;
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    port: 587,
    auth: {
      user: process.env.NODMAILER_EMAIL,
      pass: process.env.NODEMAILER_PASS,
    },
  });

  // Loop through the manageremails array and send an email to each address
  manageremails.forEach((email) => {
    // const messageData = {
    //   from: "yashpatel.syndell@gmail.com",
    //   to: email, // Set the recipient email address
    //   subject: "Request for Assistance",
    //   text: message,
    // };
    const rootDirectory = process.cwd();
    const uploadsDirectory = path.join(rootDirectory, "uploads", "Logo.png");
    const messageData = {
      from: `OneTapConnect:${process.env.NODMAILER_EMAIL}`,
      to: email,
      subject: "Request for Assistance",
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
            <!-- Insert your company logo here -->
            <img src="cid:logo">
          </div>
          <div style="background-color: #fff; border-radius: 0 0 20px 20px; padding: 20px; color: #333; font-size: 14px;">
            <h3>Request to Update User Information</h3>
            <p>User with email: ${requestedUserEmail} has requested an update to their user information. Here is their request:</p>
            <p>${message}</p>
            <p>Please review the request and take appropriate action. If you have any questions or need further information, please respond to this email.</p>
            <h5>Technical Issue?</h5>
            <p>If you are facing any technical issues, please contact our support team <a href="[support_team_link]">here</a>.</p>
          </div>
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

    transporter.sendMail(messageData, (err, info) => {
      if (err) {
        console.log(err);
        // Handle email sending error for this email address (you may choose to continue or stop on error)
      } else {
        console.log(info.response);
        // Email sent successfully to this email address
      }
    });
  });

  res.status(200).json({
    success: true,
    message: "Emails sent to managers successfully",
  });
});

// invite team member
exports.inviteTeamMember = catchAsyncErrors(async (req, res, next) => {
  const { memberData, manage_superadmin, manager_firstname, manager_email } = req.body;
  const { companyID } = req.user;
  // console.log(manage_superadmin, "*****************************")

  // Check if CSVMemberData is an array and contains data
  if (!Array.isArray(memberData) || memberData.length === 0) {
    return next(new ErrorHandler("No user data provided", 400));
  }

  // let accountManager = {};
  // const manager = manage_superadmin.find(user => user.role === 'manager');

  // if (manager) {
  //   accountManager.name = manager.first_name;
  //   accountManager.email = manager.email;
  // } else {
  //   const superadmin = manage_superadmin.find(user => user.role === 'superadmin');
  //   accountManager.name = superadmin.first_name;
  //   accountManager.email = superadmin.email;
  // }

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
      from: "`OneTapConnect:${process.env.NODMAILER_EMAIL}`",
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
          <div style="display: flex ;  margin-top: 25px">
            <div style="flex: 1; border-radius: 4px; overflow: hidden; background-color: #e65925; justify-content: center; display: flex; width:100%; margin-right:10px ">
                <a href="${process.env.FRONTEND_URL}/sign-up/${invitationToken}" style="display: inline-block; width: 83%; padding: 10px 20px; font-weight: 600; color: #fff; text-align: center; text-decoration: none;">Accept invitation</a>
            </div>
            <div style="flex: 1; border: 1px solid #333; border-radius: 4px; overflow: hidden; justify-content: center;display: flex; width:100%;">
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

exports.rejectInvitation = catchAsyncErrors(async (req, res, next) => {
  const { invitationToken } = req.params;

  // Find the invitation by token
  const invitation = await InvitedTeamMemberModel.findOne({ invitationToken });

  if (!invitation) {
    return next(new ErrorHandler("Invitation not found", 404));
  }

  // Update the status to "Declined" in the database
  invitation.status = "Declined";
  await invitation.save();
  // Retrieve the associated company
  const companyId = invitation.companyId;
  const company = await Company.findOne({ _id: companyId });

  if (!company) {
    return next(new ErrorHandler("Company not found", 404));
  }

  // Now you have the company name
  const companyName = company.company_name;

  // Redirect or send a response for successful rejection, including the company name
  // res.redirect("/rejected"); // You can customize this
  res.status(200).json({ message: "Invitation declined", companyName });
  // Redirect or send a response for successful rejection
  // res.redirect("/rejected"); // You can customize this
});

//invite team member by CSV
exports.inviteTeamMemberByCSV = catchAsyncErrors(async (req, res, next) => {
  const { CSVMemberData } = req.body;
  const { companyID, id } = req.user;
  console.log(CSVMemberData)


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

  const company = await Company.findById(companyID);
  const userInfo = await User.findById(id);
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
    const { 'First name': firstName, 'Last name': lastName, Email: email, Team: team, emailAlreadyUsed } = userData;
    if (emailAlreadyUsed) {
      const password = generatePassword();

      if (!email || !firstName || !lastName || !team) {
        return next(new ErrorHandler("Please fill out all user details", 400));
      }

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) {
        return next(new ErrorHandler("Please enter a valid email", 400));
      }
      const rootDirectory = process.cwd();
      const uploadsDirectory = path.join(rootDirectory, "uploads", "Logo.png");
      const message = {
        from: "`OneTapConnect:${process.env.NODMAILER_EMAIL}`",
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
            ${userInfo.first_name} ${userInfo.last_name}<br/>
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
        companyID: companyID,
      });

      if (!teamRecord) {
        // If the team doesn't exist, create a new team
        teamRecord = await Team.create({
          team_name: team,
          companyID: companyID,
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
        companyID: companyID,
        password: password,
        role: "teammember",
        userurlslug: generatedCode,
        status: "inactive"
      });

      const userId = userRecord.id;
      // console.log(userId,"!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
      const userinfocreate = await UserInformation.create({
        user_id: userId,
        company_ID: companyID,
      })
      const existingCompanySlug = await parmalinkSlug.findOne({
        companyID: companyID,
      });
      const companyuniqueSlugValue = existingCompanySlug?.companyunique_slug[0]?.value

      const user_parmalink = await parmalinkSlug.create({
        user_id: userId,
        companyID: companyID,
        unique_slugs: [{ value: generatedCode, timestamp: Date.now() }],
        companyunique_slug: [{ value: companyuniqueSlugValue, timestamp: Date.now() }],
        userurlslug: generatedCode,
        companyurlslug: companyuniqueSlugValue,
      })
      await user_parmalink.save();
      await userinfocreate.save();

      // const userplan = planData.plan;
      // console.log(userplan, "))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))")
      let slug = null;
      let companyslug = null;
      const username = firstName;
      const userlastname = lastName;
      const companyName = company.company_name;
      // console.log(userlastname, username, "---------------------------------------------------")

      const first_Name = username.toLowerCase().replace(/[^a-z0-9-]/g, "");
      const last_Name = userlastname.toLowerCase().replace(/[^a-z0-9-]/g, "");
      slug = `${first_Name}${last_Name}`;
      // console.log(slug, "((((((((((((((((((((((((((((((((((((((((((((((((((((((((")

      if (slug !== null) {
        // Check for duplicates in user_parmalink collection before saving
        const isDuplicate = await parmalinkSlug.exists({ "unique_slugs.value": slug });
        if (!isDuplicate) {
          // Save the slug
          const uniqueSlug = { value: slug, timestamp: Date.now() };
          await parmalinkSlug.updateOne(
            { user_id: userId },
            { $addToSet: { unique_slugs: uniqueSlug }, userurlslug: slug },
          );
          await User.updateOne(
            { _id: userId },
            { userurlslug: slug },
          );
        }
      }
    }
  }

  res.status(201).json({
    success: true,
    message: "Invitaion Email sent Successfully",
    existingMails: existingMails,
  });
});

//add card details
exports.addCardDetails = catchAsyncErrors(async (req, res) => {
  const { formData } = req.body;
  const { id } = req.user;

  const cardData = {
    nameOnCard: formData.cardName,
    cardNumber: formData.cardNumber,
    cardExpiryMonth: formData.cardExpiry.slice(0, 2),
    cardExpiryYear: formData.cardExpiry.slice(3),
    CVV: formData.cardCVV,
    brand: formData.cardType,
    status: formData.isPrimary ? "primary" : "active",
  };

  const card = await Cards.create(cardData);

  card.userID = id;

  await card.save();

  // If the new card is set as primary, update the status of other cards to "active"
  if (formData.isPrimary) {
    await Cards.updateMany(
      { userID: id, _id: { $ne: card._id } }, // Update all cards for this user except the new one
      { $set: { status: "active" } } // Set the status to "active"
    );
  }

  res.status(201).json({
    success: true,
    message: "Card Added successfully",
  });
});

//show card details

exports.showCardDetails = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.user;

  const cards = await Cards.find({ userID: id });

  if (!cards) {
    return next(new ErrorHandler("No card details found for this user", 404));
  }

  res.status(201).json({
    success: true,
    cards,
  });
});
//fetch card details

exports.fetchCardDetails = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  const cards = await Cards.findById(id);

  if (!cards) {
    return next(new ErrorHandler("No card details found", 404));
  }

  res.status(201).json({
    success: true,
    cards,
  });
});

//delete card details
exports.deleteCardDetails = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  console.log(id, "weff");

  const deletedCard = await Cards.findByIdAndDelete(id);

  if (!deletedCard) {
    return next(new ErrorHandler("No card details found for this id", 404));
  }

  res.status(201).json({
    success: true,
    message: "Card deleted successfully",
  });
});

exports.updateCardDetails = catchAsyncErrors(async (req, res) => {
  const { formData } = req.body;
  const { id } = req.params;

  const cardData = {
    nameOnCard: formData.cardName,
    cardNumber: formData.cardNumber,
    cardExpiryMonth: formData.cardExpiry.slice(0, 2),
    cardExpiryYear: formData.cardExpiry.slice(3),
    CVV: formData.cardCVV,
    brand: formData.cardType,
    status: formData.isPrimary ? "primary" : "active",
  };

  const card = await Cards.findByIdAndUpdate(id, cardData);

  await card.save();

  // If the updated card is set as primary, update the status of other cards to "active"
  if (formData.isPrimary) {
    await Cards.updateMany(
      { userID: card.userID, _id: { $ne: id } }, // Update all cards for this user except the updated one
      { $set: { status: "active" } } // Set the status to "active"
    );
  }

  res.status(201).json({
    success: true,
    message: "Card Updated successfully",
  });
});

//fetch billing address
exports.fetchBillingAddress = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.user;

  const billingData = await billingAddress.find({ userId: id });

  if (!billingData || billingData.length === 0) {
    return next(new ErrorHandler("No Billing details found", 404));
  }

  const firstBillingAddress = billingData[0];

  res.status(201).json({
    success: true,
    billingData: firstBillingAddress,
  });
});

//update billing address

exports.updateBillingAddress = catchAsyncErrors(async (req, res, next) => {
  const { id, companyID } = req.user;
  const { firstName, lastName, company_name, billing_address } = req.body;

  const userData = {
    first_name: firstName,
    last_name: lastName,
  };

  const BillingAddressData = {
    billing_address: billing_address,
  };

  const updateUser = await User.findByIdAndUpdate(id, userData);
  const updateBilling = await billingAddress.findOneAndUpdate(
    { userId: id },
    BillingAddressData,
    { new: true }
  );

  const updateCompany = await Company.findByIdAndUpdate(companyID, {
    company_name: company_name,
  });

  await updateUser.save();
  await updateBilling.save();
  await updateCompany.save();

  res.status(201).json({
    success: true,
    message: "Data Updated Successfully",
  });
});

// for Create new Team and update User Team
// exports.updateTeamName = catchAsyncErrors(async (req, res, next) => {
//   console.log("called");
//   const { user_id, team } = req.body;

//   try {
//     // Update the document by _id
//     const updatedTeam = await User.findOneAndUpdate(
//       { _id: user_id },
//       { team: team },
//       { new: true }
//     );

//     if (updatedTeam) {
//       res.status(200).json({ message: "User updated successfully", team: updatedTeam });
//     } else {
//       res.status(404).json({ message: "User not found with the given _id" });
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// });
// exports.updateTeamName = catchAsyncErrors(async (req, res, next) => {
//   console.log("called");
//   const { user_id, team } = req.body;

//   try {
//     // Update the documents by _ids
//     const updatedTeams = await User.updateMany(
//       { _id: { $in: user_id } }, // Use $in to match multiple _ids
//       { $set: { team: team } }, // Use $set to update the 'team' field
//       { new: true }
//     );

//     if (updatedTeams.nModified > 0) {
//       res.status(200).json({ message: "Users updated successfully", teams: updatedTeams });
//     } else {
//       res.status(404).json({ message: "No users found with the given _ids" });
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// });

exports.updateTeamName = catchAsyncErrors(async (req, res, next) => {
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

//get team name

exports.getTeam = catchAsyncErrors(async (req, res, next) => {
  const company_id = req.user.companyID;
  // console.log(company_id, "sadadas")

  const team = await Team.find({ companyID: company_id });
  // console.log(team ,"teamname")
  res.status(200).json({ message: "Users updated successfully", team });
});

// Create new Team
exports.createNewTeam = catchAsyncErrors(async (req, res, next) => {
  console.log("team");
  // console.log(req.user,"wdsafeg")
  const companyID = req.user.companyID;
  const userID = req.user._id;
  console.log(companyID);
  const { team_name } = req.body;
  console.log(team_name);
  const teamData = {
    team_name: team_name,
    companyID: companyID,
  };

  const team = await Team.create(teamData);
  const latestTeamId = team._id;
  console.log(userID);
  const Newteam = await UserInformation.findOneAndUpdate(
    { user_id: userID },
    { $set: { team: latestTeamId } }
  );

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
});

// Remove Team from Users
exports.removeTeamFromUsers = catchAsyncErrors(async (req, res, next) => {
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
});

// rename teams name
// exports.renameTeam = catchAsyncErrors(async (req, res, next) => {
//   const companyID = req.user.companyID; // Assuming you have this value available
//   const { oldTeamName, newTeamName } = req.body;

//   // Find the company
//   const company = await Company.findById(companyID);
//   if (!company) {
//     return res.status(404).json({ message: "Company not found" });
//   }

//   // Find the team index in the company's teams array
//   const teamIndex = company.teams.findIndex(
//     (team) =>
//       team.localeCompare(oldTeamName, undefined, { sensitivity: "base" }) === 0
//   );

//   if (teamIndex === -1) {
//     return res.status(400).json({ message: "Team not found in company" });
//   }

//   const isExistingTeam = company.teams.some(
//     (team) =>
//       team.localeCompare(newTeamName, undefined, { sensitivity: "base" }) === 0
//   );

//   if (isExistingTeam) {
//     return res.status(400).json({ message: "New team name already exists" });
//   }

//   // Update team name in company's teams array
//   const oldTeam = company.teams[teamIndex];
//   company.teams[teamIndex] = newTeamName;
//   await company.save();

//   // Update user's team name
//   const usersToUpdate = await User.find({ team: oldTeam }); // Find users belonging to the old team
//   for (const user of usersToUpdate) {
//     user.team = newTeamName;
//     await user.save();
//   }

//   res.status(200).json({ message: "Team renamed successfully", company });
// });
exports.renameTeam = catchAsyncErrors(async (req, res, next) => {
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
      return res.status(400).json({ message: "New team name already exists" });
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
});

// delete team
// exports.deleteTeam = catchAsyncErrors(async (req, res, next) => {
//   const companyID = req.user.companyID; // Assuming you have this value available
//   const { teamname } = req.body;

//   // Find the company
//   const company = await Company.findById(companyID);
//   if (!company) {
//     return res.status(404).json({ message: "Company not found" });
//   }

//   // Find the team index in the company's teams array
//   const teamIndex = company.teams.indexOf(teamname);
//   if (teamIndex === -1) {
//     return res.status(400).json({ message: "Team not found in company" });
//   }

//   // Remove team from the company's teams array
//   const deletedTeam = company.teams.splice(teamIndex, 1)[0];
//   await company.save();

//   // Find users belonging to the deleted team
//   const usersToDelete = await User.find({ team: deletedTeam });

//   // Remove the team association from the users
//   for (const user of usersToDelete) {
//     user.team = "";
//     await user.save();
//   }

//   res.status(200).json({ message: "Team deleted successfully", company });
// });
exports.deleteTeam = catchAsyncErrors(async (req, res, next) => {
  const { teamId } = req.body; // Assuming you have the team's unique ID available

  // Find and delete the team by its ID
  const deletedTeam = await Team.findByIdAndDelete(teamId);

  if (!deletedTeam) {
    return res.status(404).json({ message: "Team not found" });
  }

  // Find users belonging to the deleted team
  const usersToDelete = await User.find({ team: deletedTeam._id });

  // Remove the team association from the users
  for (const user of usersToDelete) {
    user.team = null; // You can set it to an empty string or null if needed
    await user.save();
  }

  res.status(200).json({ message: "Team deleted successfully" });
});

// exports.checkslugavailiblity = catchAsyncErrors(async (req,res,next)=> {
//   const { slug } = req.body;

//   console.log(slug)
//     const existingSlug = await Company.findOne({ slug });
//     if (existingSlug) {
//       return res.status(400).json({ message: 'Slug is already taken.' });
//     }

//       return res.status(200).json({ message: 'Slug is available.' });

// });
//update company details
// update single team members

exports.updateUserDetails = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { userDetails, selectedUserForRedirect } = req.body; // Assuming the updated details are provided in the request body
  try {
    const user = await User.findById(id);

    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    if (user.companyID.toString() !== req.user.companyID.toString()) {
      return next(
        new ErrorHandler("You are not authorized to update this user", 401)
      );
    }

    // Update the user details
    user.set(userDetails);
    await user.save();

    if (selectedUserForRedirect) {
      const permalinkUpdateResult = await parmalinkSlug.updateMany(
        { user_id: { $in: userDetails.users } },
        {
          $set: {
            isactive: true,
            redirectUserId: selectedUserForRedirect[0]._id,
          },
        }
      );
    }
    if (userDetails.status === "active") {
      const permalinkUpdateResult = await parmalinkSlug.updateMany(
        { user_id: { $in: userDetails.users } },
        {
          $set: {
            isactive: false,
            redirectUserId: null,
          },
        }
      );
    }
    // const permalink = await parmalinkSlug.findOneAndUpdate(
    //   { user_id: id },
    //   {
    //     $set: {
    //       isactive: true,
    //       redirectUserId: selectedUserForRedirect._id,
    //     },
    //   },
    //   { new: true }
    // );

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

exports.updateUserInformation = async (req, res, next) => {
  const { id } = req.params; // Assuming you pass the userId as a parameter
  console.log("////////////////////////////////////////////////////////////////")
  console.log(id, "params id user")
  console.log("////////////////////////////////////////////////////////////////")

  const updatedUserInfo = req.body; // Assuming the updated user information is provided in the request body

  try {
    // Try to find the user information document by userId
    let userInformation = await UserInformation.findOne({ user_id: id });

    console.log("////////////////////////////////////////////////////////////////")
    console.log(userInformation)
    console.log("////////////////////////////////////////////////////////////////")


    if (!userInformation) {
      // If the document doesn't exist, create a new one
      userInformation = new UserInformation({
        user_id: id,
        ...updatedUserInfo,
      });
    } else {
      // If the document exists, update its fields with the new data
      console.log("else")
      Object.assign(userInformation, updatedUserInfo);
    }

    // Save the user information document
    await userInformation.save();

    res.status(200).json({
      success: true,
      message: "User information updated successfully",
      userInformation: userInformation,
    });
  } catch (error) {
    next(error);
  }
};

// get single team members
exports.getUserinfoDetails = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const userinfo = await UserInformation.findOne({ user_id: id });
  if (!userinfo) {
    return next(new ErrorHandler("No user information found", 404));
  }

  res.status(200).json({
    success: true,
    userinfo,
  });
});

// get single team members
exports.updateUserStatus = catchAsyncErrors(async (req, res, next) => {
  const { _id } = req.user;
  console.log(_id)
  console.log("_id--------------------------------")
  const updatedUserInfo = await User.findByIdAndUpdate(
    _id,
    { "first_login": false },
    { new: true }
  );
  if (!updatedUserInfo) {
    return next(new ErrorHandler("Internal Server Error", 500));
  }

  res.status(200).json({
    success: true,
    updatedUserInfo,
  });
});

exports.updateCompanyDetails = catchAsyncErrors(async (req, res, next) => {
  const { id, companyID } = req.user;
  const { companyDetails } = req.body;
  console.log(companyID);
  console.log(companyDetails);

  try {
    const company = await Company.findByIdAndUpdate(
      companyID,
      {
        $set: {
          primary_account: companyDetails.primaryAccount,
          primary_billing: companyDetails.selectedPrimaryBilling,
          primary_manager: companyDetails.primaryManager,
        },
      },
      { new: true, runValidators: true }
    );

    res.status(201).json({
      success: true,
      message: "Company Data Updated Successfully",
      company,
    });
  } catch (error) {
    res.status(500).json({ error: "Error updating company addresses." });
  }
});

// update company details
exports.updateCompanyDetailsInfo = catchAsyncErrors(async (req, res, next) => {
  const { companyID } = req.user;

  const { updatedCompanyDetails } = req.body;

  const company = await Company.findById(companyID);

  if (!company) {
    return next(new ErrorHandler("User not found", 404));
  }

  if (company._id.toString() !== req.user.companyID.toString()) {
    return next(
      new ErrorHandler("You are not authorized to update this user", 401)
    );
  }

  company.set(updatedCompanyDetails);
  await company.save();

  res.status(200).json({
    company,
  });
});

exports.updatecompany_referral_data = catchAsyncErrors(
  async (req, res, next) => {
    const { companyID } = req.user;
    const companyShareReferData = req.body;
    console.log(companyID);
    console.log(companyShareReferData);

    const updatecompany = await CompanyShareReferralModel.findOneAndUpdate(
      { companyID: companyID }, // Query to find the document to update
      companyShareReferData.companyDetails, // New data to replace the existing document
      { new: true } // Optionally, set 'new' to true to return the updated document
    );

    if (!updatecompany) {
      return next(new ErrorHandler("company share details not found", 404));
    }

    // updatecompany.set(companyShareReferData);
    // await updatecompany.save();

    res.status(200).json({
      // updatedCompanyReferralData,
      updatecompany,
    });
  }
);

// exports.checkcompanyurlslugavailiblity = catchAsyncErrors(
//   async (req, res, next) => {
//     const { companyurlslug } = req.body;

//     console.log(companyurlslug);
//     const existingcompanyurlslug = await Company.findOne({ companyurlslug });
//     if (existingcompanyurlslug) {
//       return res
//         .status(400)
//         .json({ message: "companyurlslug is already taken." });
//     }

//     // Check case-sensitive duplicates
//     const caseSensitivecompanyurlslug = await Company.findOne({
//       companyurlslug: new RegExp(`^${companyurlslug}$`, "i"),
//     });
//     if (caseSensitivecompanyurlslug) {
//       return res
//         .status(400)
//         .json({ message: "companyurlslug is already taken." });
//     }

//     return res.status(200).json({ message: "companyurlslug is available." });
//   }
// );
exports.checkcompanyurlslugavailiblity = catchAsyncErrors(
  async (req, res, next) => {
    const { companyurlslug } = req.body;

    //     console.log(companyurlslug);
    // console.log(req.user.companyID);
    console.log("check is hit");
    console.log(companyurlslug);

    // Assuming you have access to the current company's ID
    const currentCompanyId = req.user.companyID; // Modify this line based on how you store the current company's ID in your application

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

    // Check for existing URL companyurlslug in the parmalinkSlug model globally
    const existingGlobalUrlSlug = await parmalinkSlug.findOne({
      "companyunique_slug.value": companyurlslug,
    });
    if (existingGlobalUrlSlug) {
      return res
        .status(400)
        .json({ message: "companyurlslug is already taken." });
    }
    // Check case-sensitive duplicates in the parmalinkSlug model globally
    const caseSensitiveGlobalUrlSlug = await parmalinkSlug.findOne({
      "companyunique_slug.value": new RegExp(`^${companyurlslug}$`, "i"),
    });
    if (caseSensitiveGlobalUrlSlug) {
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

exports.checkurlslugavailiblity = catchAsyncErrors(async (req, res, next) => {
  const { companyurlslug, userurlslug } = req.body;
  console.log(companyurlslug, "!!")
  const currentCompanyId = req.user.companyID;
  console.log(currentCompanyId, "@@")
  const currentUserId = req.user.id;

  if (currentCompanyId && companyurlslug) {
    const existingcompanyurlslug = await Company.findOne({
      _id: { $ne: currentCompanyId },
      companyurlslug,
    });

    if (existingcompanyurlslug) {
      return res
        .status(400)
        .json({ message: "companyurlslug is already taken." });
    }
  }

  // Check case-sensitive duplicates
  if (currentCompanyId && companyurlslug) {
    const caseSensitivecompanyurlslug = await Company.findOne({
      _id: { $ne: currentCompanyId }, // Exclude the current company by ID
      companyurlslug: new RegExp(`^${companyurlslug}$`, "i"),
    });

    if (caseSensitivecompanyurlslug) {
      return res
        .status(400)
        .json({ message: "companyurlslug is already taken." });
    }
  }


  // Check if userurlslug is already taken by the current user
  const currentUserUrlSlug = await parmalinkSlug.findOne({
    user_id: currentUserId,
    "unique_slugs.value": userurlslug,
  });

  if (currentUserUrlSlug) {
    return res.status(400).json({ message: "already active." });
  }

  // Check if userurlslug is already taken globally
  const existinguserurlslug = await parmalinkSlug.findOne({
    user_id: { $ne: currentUserId },
    "unique_slugs.value": userurlslug,
  });

  if (existinguserurlslug) {
    return res.status(400).json({ message: "userurlslug is already taken." });
  }

  // Check case-sensitive duplicates
  const caseSensitiveuserurlslug = await parmalinkSlug.findOne({
    user_id: { $ne: currentUserId }, // Exclude the current company by ID
    "unique_slugs.value": new RegExp(`^${userurlslug}$`, "i"),
  });

  if (caseSensitiveuserurlslug) {
    return res.status(400).json({ message: "userurlslug is already taken." });
  }

  return res.status(200).json({ message: "companyurlslug is available." });
});

exports.updateCompanySlug = catchAsyncErrors(async (req, res, next) => {
  const {
    companyId,
    companyurlslug,
    company_url_edit_permission,
    user_profile_edit_permission,
    userid
  } = req.body; // Assuming you send companyId and companyurlslug from your React frontend
  // console.log(companyurlslug);
  // console.log(companyId);
  // console.log(company_url_edit_permission);
  console.log("update is hit", userid, req.body);
  // const trimslug = companyurlslug.trim()
  const trimslug = companyurlslug?.trim() || companyurlslug;
  const uniquecompanySlug = { value: trimslug, timestamp: Date.now() };
  try {
    const updatedCompany = await Company.findByIdAndUpdate(companyId, {
      companyurlslug: trimslug,
      company_url_edit_permission: company_url_edit_permission,
      user_profile_edit_permission: user_profile_edit_permission,
    });
    const updatedCompanyinsluddata = await parmalinkSlug.updateOne(
      { user_id: userid },
      { $addToSet: { companyunique_slug: uniquecompanySlug }, companyurlslug: trimslug },
    );
    if (!updatedCompany) {
      return res.status(404).json({ error: "Company not found" });
    }

    res.json({ message: "Company slug updated successfully", updatedCompany, updatedCompanyinsluddata });
  } catch (error) {
    console.error("Error updating company slug:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//checkout handler
// exports.checkoutHandler = catchAsyncErrors(async (req, res, next) => {
//   const { id, companyID } = req.user;
//   const { userData, billingdata, shippingData ,planData, cardDetails, shipping_method } = req.body;
// console.log(billingdata, " billingdata")
//   const cardData = {
//     cardNumber: cardDetails.cardNumber,
//     brand: cardDetails.brand,
//     nameOnCard: cardDetails.cardName,
//     cardExpiryMonth: cardDetails.cardExpiryMonth,
//     cardExpiryYear: cardDetails.cardExpiryYear,
//     // CVV: cardDetails.cardCVV
//   };

//   console.log(cardData);

//   const user = await User.findById(id);
//   if (!user) {
//     return next(new ErrorHandler("User not found", 404));
//   }
//   const billingAddressFind = new billingAddress({
//     userId: user._id,
//     billing_address: billingdata,
//   });

//   let shippingAddressFind = await shippingAddress.findOne({ userId: user._id });

//   if (!shippingAddressFind) {
//     shippingAddressFind = new shippingAddress({
//       userId: user._id,
//       shipping_address: [shippingData],
//     });
//   } else {
//     shippingAddressFind.shipping_address.push(shippingData);
//   }
//   const card = await Cards.create(cardData);
//   card.userID = id;

//   user.isPaidUser = true;
//   user.first_name = userData.first_name;
//   user.first_last = userData.first_last;
//   user.address = billingdata;
//   // user.billing_address = userData.billing_address;
//   // user.shipping_address = userData.shipping_address;
//   user.subscription_details = planData;
//   user.subscription_details.auto_renewal = true;
//   user.shipping_method = shipping_method;

//   const company = await Company.findById(companyID);
//   company.address = billingdata;
//   console.log(company.address, "company address");

//   await user.save();
//   await card.save();
//   await company.save();
//   await billingAddressFind.save();
//   await shippingAddressFind.save();

//   res.status(200).json({
//     success: true,
//     billingdata
//   });
// });

exports.checkoutHandler = catchAsyncErrors(async (req, res, next) => {
  const { id, companyID } = req.user;
  const {
    userData,
    company_name,
    billingdata,
    shippingData,
    shipping_method,
    planData,
    cardDetails,
    saveAddress,
    selectedEditAddress,
    couponData
  } = req.body;

  const existingCards = await Cards.find({ userID: id });

  const cardData = {
    cardNumber: cardDetails.cardNumber,
    brand: cardDetails.brand,
    nameOnCard: cardDetails.cardName,
    cardExpiryMonth: cardDetails.cardExpiryMonth,
    cardExpiryYear: cardDetails.cardExpiryYear,
    // CVV: cardDetails.cardCVV,
    status: existingCards.length === 0 ? "primary" : "active",
  };

  const user = await User.findById(id);
  // console.log(user, "user");
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  let billingAddressFind = await billingAddress.findOne({ userId: user._id });

  if (!billingAddressFind) {
    billingAddressFind = new billingAddress({
      userId: user._id,
      // companyId: user.companyID,
      billing_address: billingdata,
    });
  } else {
    billingAddressFind.billing_address = billingdata;
  }

  let shippingAddressFind = await shippingAddress.findOne({ userId: user._id });

  if (!shippingAddressFind) {
    shippingAddressFind = new shippingAddress({
      userId: user._id,
      shipping_address: [],
    });
  }
  // if(saveAddress) {
  //   shippingAddressFind.shipping_address.push(shippingData);
  // }
  if (saveAddress) {
    if (selectedEditAddress) {
      const index = shippingAddressFind.shipping_address.findIndex(
        (address) => address._id.toString() === selectedEditAddress._id.toString()
      );
      if (index !== -1) {
        // Replace the existing address with the updated address
        shippingAddressFind.shipping_address[index] = shippingData;
      }
    } else {
      // Add a new address
      shippingAddressFind.shipping_address.push(shippingData);
    }
  }

  const card = await Cards.create(cardData);
  card.userID = user._id;

  let userInformation = await UserInformation.findOne({ user_id: user._id });

  if (!userInformation) {
    userInformation = new UserInformation({
      user_id: user._id,
      smartAccessories: planData.smartAccessories.map((e) => ({
        productId: e.productId, productName: e.Type, variationId: e.variationId, price: 0, subtotal: 0, quantity: 1
      })),
      subscription_details: {
        // addones: planData.addones,
        addones: planData.addones.map((addon) => ({
          addonId: addon.addonId,  // Convert addonId to ObjectId
          status: addon.status,
          assignTo: addon.assignTo,
          price: addon.price,
        })),
        subscription_id: planData.subscription_id,
        total_amount: planData.total_amount,
        plan: planData.plan,
        endDate: planData.endDate,
        total_user: planData.total_user,
        billing_cycle: planData.billing_cycle,
        recurring_amount: planData.recurring_amount,
        renewal_date: planData.renewal_date,
        taxRate: planData.taxRate,
        customer_id: planData.customer_id,
        planID: planData.planID
      },
    });
    // userInformation.subscription_details = planData;
    // console.log(userInformation, "userInformation");
  } else {
    userInformation.subscription_details = {
      ...userInformation.subscription_details,
      // addones: planData.addones,
      addones: planData.addones.map((addon) => ({
        addonId: addon.addonId,  // Convert addonId to ObjectId
        status: addon.status,
        assignTo: addon.assignTo,
        price: addon.price,
      })),
      subscription_id: planData.subscription_id,
      total_amount: planData.total_amount,
      plan: planData.plan,
      endDate: planData.endDate,
      total_user: planData.total_user,
      billing_cycle: planData.billing_cycle,
      recurring_amount: planData.recurring_amount,
      renewal_date: planData.renewal_date,
      taxRate: planData.taxRate,
      customer_id: planData.customer_id,
      perUser_price: planData.perUser_price,
      planID: planData.planID
    };
  }
  userInformation.smartAccessories = planData.smartAccessories.map((e) => ({
    productId: e.productId, productName: e.Type, variationId: e.variationId, price: 0, subtotal: 0, quantity: 1
  })),
    shippingAddressFind.shipping_address.address_name = "Default";
  userInformation.subscription_details.auto_renewal = true;
  userInformation.shipping_method = shipping_method;
  userInformation.isInitailUser = false;
  user.isPaidUser = true;
  // user.first_name = userData.first_name;
  // user.last_name = userData.last_name;
  // user.contact = userData.contact;
  // user.email = userData.email;
  user.address = billingdata;
  user.first_login = true;

  const order = new Order({
    paymentStatus: "paid",
    user: user._id,
    company: companyID,
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    contact: user.contact,
    paymentDate: new Date(),
    type: "Subscription",
    smartAccessories: planData.smartAccessories.map((e) => ({
      productId: e.productId, productName: e.Type, variationId: e.variationId, price: 0, subtotal: 0, quantity: 1
    })),
    subscription_details: {
      // addones: planData.addones,
      addones: planData.addones.map((addon) => ({
        addonId: addon.addonId,  // Convert addonId to ObjectId
        status: addon.status,
        assignTo: addon.assignTo,
        price: addon.price,
      })),
      ...planData
    },
    // subscription_details: planData,
    shippingAddress: shippingData,
    billingAddress: billingdata,
    shipping_method: shipping_method
  });
  const company = await Company.findById(companyID);
  company.address = billingdata;
  company.company_name = company_name;
  console.log(company.address, "company address");

  const userplan = planData.plan;
  let slug = null;
  let companyslug = null;
  const username = user.first_name;
  const userlastname = user.last_name;
  const companyName = company_name;
  if (userplan === "Free") {
    // If the plan is "free", skip slug generation
  } else if (userplan === "Professional" || userplan === "Team") {
    const firstName = username.toLowerCase().replace(/[^a-z0-9-]/g, "");
    const lastName = userlastname.toLowerCase().replace(/[^a-z0-9-]/g, "");
    const comapny_Name = companyName.toLowerCase().replace(/[^a-z0-9-]/g, "");
    slug = `${firstName}${lastName}`;
    companyslug = `${comapny_Name}`;
  }
  let userVar = null
  if (slug !== null) {
    // Check for duplicates in user_parmalink collection before saving
    const isDuplicate = await parmalinkSlug.exists({ "unique_slugs.value": slug });
    if (!isDuplicate) {
      // Save the slug
      const uniqueSlug = { value: slug, timestamp: Date.now() };
      userVar = uniqueSlug;
      await parmalinkSlug.updateOne(
        { user_id: user._id },
        { $addToSet: { unique_slugs: uniqueSlug }, userurlslug: slug },
      );
    }

  }
  let companyVar = null
  if (companyslug !== null) {
    const iscompanyDuplicate = await parmalinkSlug.exists({ "companyunique_slug.value": companyslug });
    if (!iscompanyDuplicate) {
      // Save the slug
      const uniquecompanySlug = { value: companyslug, timestamp: Date.now() };
      companyVar = uniquecompanySlug;
      await parmalinkSlug.updateOne(
        { user_id: user._id },
        { $addToSet: { companyunique_slug: uniquecompanySlug }, companyurlslug: companyslug },
      );
    }
  }
  if (userVar !== null) {
    user.userurlslug = userVar.value;
  }
  if (companyVar !== null) {
    company.companyurlslug = companyVar.value;
  }
  if (couponData !== null && Object.keys(couponData).length !== 0) {
    order.isCouponUsed = true;
    order.coupons = {
      code: couponData.appliedCouponCode,
      value: couponData.discountValue
    };
    const logCoupons = await UserCouponAssociation.findOneAndUpdate(
      { userId: user._id, couponCode: couponData.appliedCouponCode },
      { $setOnInsert: { userId: user._id }, $inc: { usageCount: 1 } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )
    console.log(logCoupons);
  }

  // status update for supeadmin deactivated account.
  const updatedUser = await User.updateOne(
    { _id: id },
    {
      $set: { Account_status: 'is_Activated' },
    },
    { new: true }
  );
  const companyUsers = await User.updateMany(
    {
      companyID: companyID,
      role: { $in: ["administrator", "teammember", "manager"] },
      Account_status: { $in: ['is_Deactivated'] }
    },
    {
      $set: { status: 'active', Account_status: 'is_Activated' },
    },
  );
  if (companyUsers.nModified === 0) {
    console.log('No matching users found for companyUsers update.');
  }
  if (!updatedUser) {
    console.log('No matching users found for companyUsers update.');
    // return res.status(404).json({ success: false, message: 'User not found' });
  }

  await user.save();
  await card.save();
  await company.save();
  await order.save();
  await billingAddressFind.save();
  await shippingAddressFind.save();
  await userInformation.save();
  await sendOrderConfirmationEmail(order.first_name, order.email, order._id, planData.plan, planData.billing_cycle, planData.renewal_date, planData.recurring_amount, planData.total_amount);
  res.status(200).json({
    success: true,
    user,
    userInformation,
  });
});
async function sendOrderConfirmationEmail(orderfirstname, orderemail, orderId, plandataplan, plandatacycle, plandatarenew, plandataamount, plandatatotal) {
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
      from: `OneTapConnect:${process.env.NODMAILER_EMAIL}`,
      to: orderemail,
      // to: "tarun.syndell@gmail.com",
      subject: 'Welcome to OneTapConnect! Your Subscription is Confirmed',
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
          <p>Dear ${orderfirstname},<br/>
          <p>Thank you for choosing OneTapConnect! We're excited to confirm that your subscription is now active. You are officially part of our community, and we appreciate your trust in us.</p>
          <p>Subscription Details:</p>
          <ul>
            <li><b>Subscription Plan:</b>&nbsp;&nbsp;${plandataplan}</li>
            <li><b>Duration:</b>&nbsp;&nbsp;${plandatacycle}</li>
            <li><b>Renewal Date:</b>&nbsp;&nbsp;${new Date(plandatarenew).toLocaleDateString()}</li>
            <li><b>Amount:</b>&nbsp;&nbsp;$ ${plandataamount}</li>
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
                    <td>${plandataplan}-${plandatacycle}</td>
                    <!-- <td>Description of Your Item</td> -->
                    <!-- <td></td> -->
                    <td style="text-align: center;">&nbsp;&nbsp;1</td>
                    <td></td>
                    <td>&nbsp;&nbsp;$ ${plandataamount}</td>
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
                    <td>&nbsp;&nbsp;$ ${plandatatotal}</td>
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
    console.log('Order confirmation email sent successfully');
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
  }
}

exports.checkoutHandlerFree = catchAsyncErrors(async (req, res, next) => {
  const { id, companyID } = req.user;
  const {
    userData,
    company_name,
    billingdata,
    shippingData,
    shipping_method,
    planData,
    // cardDetails,
    saveAddress,
    selectedEditAddress
  } = req.body;

  // const cardData = {
  //   cardNumber: cardDetails.cardNumber,
  //   brand: cardDetails.brand,
  //   nameOnCard: cardDetails.cardName,
  //   cardExpiryMonth: cardDetails.cardExpiryMonth,
  //   cardExpiryYear: cardDetails.cardExpiryYear,
  //   // CVV: cardDetails.cardCVV,
  //   status: "primary",
  // };

  const user = await User.findById(id);
  // console.log(user, "user");
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  let billingAddressFind = await billingAddress.findOne({ userId: user._id });

  if (!billingAddressFind) {
    billingAddressFind = new billingAddress({
      userId: user._id,
      // companyId: user.companyID,
      billing_address: billingdata,
    });
  } else {
    billingAddressFind.billing_address = billingdata;
  }

  let shippingAddressFind = await shippingAddress.findOne({ userId: user._id });

  if (!shippingAddressFind) {
    shippingAddressFind = new shippingAddress({
      userId: user._id,
      shipping_address: [],
    });
  }
  // if(saveAddress) {
  //   shippingAddressFind.shipping_address.push(shippingData);
  // }
  if (saveAddress) {
    if (selectedEditAddress) {
      const index = shippingAddressFind.shipping_address.findIndex(
        (address) => address._id.toString() === selectedEditAddress._id.toString()
      );
      if (index !== -1) {
        // Replace the existing address with the updated address
        shippingAddressFind.shipping_address[index] = shippingData;
      }
    } else {
      // Add a new address
      shippingAddressFind.shipping_address.push(shippingData);
    }
  }

  // const card = await Cards.create(cardData);
  // console.log(card, "card");
  // card.userID = user._id;

  let userInformation = await UserInformation.findOne({ user_id: user._id });

  if (!userInformation) {
    userInformation = new UserInformation({
      user_id: user._id,
      subscription_details: planData,
    });
    userInformation.subscription_details = planData;
    console.log(userInformation, "userInformation");
  } else {
    userInformation.subscription_details = planData;
  }
  shippingAddressFind.shipping_address.address_name = "Default";
  userInformation.subscription_details.auto_renewal = true;
  userInformation.shipping_method = shipping_method;
  user.isPaidUser = true;
  user.first_name = userData.first_name;
  user.last_name = userData.last_name;
  user.contact = userData.contact;
  user.email = userData.email;
  user.address = billingdata;
  user.first_login = true;


  const company = await Company.findById(companyID);
  company.address = billingdata;
  company.company_name = company_name;
  const order = new Order({
    paymentStatus: "paid",
    user: user._id,
    company: companyID,
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    paymentDate: new Date(),
    type: "Subscription",
    subscription_details: planData,
    shippingAddress: shippingData,
    billingAddress: billingdata,
    shipping_method: shipping_method
  });

  await user.save();
  await order.save();
  await company.save();
  await billingAddressFind.save();
  await shippingAddressFind.save();
  await userInformation.save();
  await sendOrderconfirmationEmail(order.email, order._id, order.first_name);

  res.status(200).json({
    success: true,
    user,
    userInformation,
  });
});
async function sendOrderconfirmationEmail(orderemail, orderId, ordername) {
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
      from: "`OneTapConnect:${process.env.NODMAILER_EMAIL}`", // Replace with your email
      to: orderemail,
      // to: "tarun.syndell@gmail.com",
      subject: 'Welcome to OneTapConnect! Your Subscription is Confirmed',
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
              <p>Dear ${ordername},<br/>
              <p>Thank you for choosing OneTapConnect! We're excited to confirm that your subscription is now active. You are officially part of our community, and we appreciate your trust in us.</p>
    
              <!-- Invoice Table -->
              <table style="width: 100%; margin-top: 20px; border-collapse: collapse;">
                <thead>
                    <tr style="background-color: #e65925; color: #fff; text-align: left;">
                        <th style="padding: 10px;">Subscription</th>
                        <!-- <th style="padding: 10px;">Description</th> -->
                        <!-- <th style="padding: 10px;">Unit Price</th> -->
                        <th style="padding: 10px;text-align: center;">Quantity</th>
                        <th></th>
                        <th style="padding: 10px;">Price</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- Add your invoice items dynamically here -->
                    <tr>
                        <td>&nbsp;&nbsp;&nbsp;Free</td>
                        <!-- <td>Description of Your Item</td> -->
                        <!-- <td></td> -->
                        <td style="text-align: center;">&nbsp;&nbsp;1</td>
                        <td></td>
                        <td>&nbsp;&nbsp;$ 0.0</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #ccc;">
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                    </tr>
                    <tr style="border-bottom: 1px solid #ccc;">
                        <td></td>
                        <td></td>
                        <td style="text-align: end;"><b>Total:</b></td>
                        <td>&nbsp;&nbsp;$ 0.0</td>
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
    console.log('Order confirmation email sent successfully');
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
  }
}

exports.updateAutoRenewal = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.user;

  const userInfo = await UserInformation.find({ user_id: id });

  if (!userInfo || userInfo.length === 0) {
    return next(new ErrorHandler("User Information Not Found", 404));
  }

  const firstuserInfo = userInfo[0];

  firstuserInfo.subscription_details.auto_renewal = false;

  await firstuserInfo.save();

  res.status(200).json({
    success: true,
  });
});

// multer image upload
const profilestorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/profileImages");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = file.originalname.split(".").pop(); // Get the file extension
    cb(null, `profile-${uniqueSuffix}.${extension}`);
  },
});

const upload = multer({ storage: profilestorage });

const checkimgSize = (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }
    // Use sharp to get the dimensions of the uploaded Profile picture
    sharp(req.file.path)
      .metadata()
      .then((metadata) => {
        const { width, height } = metadata;

        // Check if the dimensions are either 32x32 or 64x64
        if (width <= 300 && height <= 300) {
          // Valid size, continue with the next middleware
          next();
        } else {
          // Invalid size, delete the uploaded file and return an error
          fs.unlinkSync(req.file.path);
          return res.status(400).json({
            error: "Profile picture size must be at most 300x300 pixels..",
          });
        }
      })
      .catch((err) => {
        console.error("Error checking Profile picture size:", err);
        return res.status(500).json({ error: "Internal server error." });
      });
  } catch (error) {
    console.error("Error checking Profile picture size:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};

// Define a function to handle profile picture upload
exports.uploadProfilePicture = async (req, res) => {
  try {
    // Your code to handle image upload and processing goes here
    const uploadedFileName = req.base64FileName;
    // Assuming the upload and processing were successful, you can send a success response
    res.status(200).json({
      message: "Profile Picture uploaded successfully",
      imagePath: uploadedFileName,
    });
  } catch (error) {
    console.error("Error during Profile Picture upload:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

//Logo  update API
// multer image upload
const logostorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(
      null,
    );
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = file.originalname.split(".").pop(); // Get the file extension
    cb(null, `logo-${uniqueSuffix}.${extension}`);
  },
});

const logoupload = multer({
  storage: logostorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit (adjust as needed)
});

// Add this middleware after logoupload.single('logoimage')
const checkLogoSize = (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    // Use sharp to get the dimensions of the uploaded logo
    sharp(req.file.path)
      .metadata()
      .then((metadata) => {
        const { width, height } = metadata;

        // Check if the dimensions are either 32x32 or 64x64
        if (width <= 300 && height <= 300) {
          // Valid size, continue with the next middleware
          next();
        } else {
          // Invalid size, delete the uploaded file and return an error
          fs.unlinkSync(req.file.path);
          return res.status(400).json({
            error: "Logo size must be at most 300x300 pixels..",
          });
        }
      })
      .catch((err) => {
        console.error("Error checking logo size:", err);
        return res.status(500).json({ error: "Internal server error." });
      });
  } catch (error) {
    console.error("Error checking logo size:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};
exports.uploadLogo = async (req, res) => {
  try {
    // Your code to handle image upload and processing goes here
    const uploadedFileName = req.base64FileName;
    // Assuming the upload and processing were successful, you can send a success response
    res.status(200).json({
      message: "Logo uploaded successfully",
      imagePath: uploadedFileName,
    });
  } catch (error) {
    console.error("Error during logo upload:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Modify the route handler to include the checkLogoSize middleware
// exports.uploadLogo = async (req, res) => {
//   res.send("called")
//   // try {
//   //   // Use async/await for better error handling and readability
//   //   const { companyID } = req.user;
//   //   // console.log("object", req.user)
//   //   // Check if the company already has a logo path
//   //   const company = await Company.findById(companyID);
//   //   console.log(company);
//   //   const oldLogoPath = company.logopath;

//   //   logoupload.single("logoimage")(req, res, async (err) => {
//   //     if (err) {
//   //       return res.status(400).json({ error: "File upload failed." });
//   //     }

//   //     const logoPicturePath = req.file.filename;

//   //     // Delete the old logo file if it exists
//   //     if (oldLogoPath) {
//   //       // Remove the old logo file from the storage folder
//   //       fs.unlink(`./uploads/logo/${oldLogoPath}`, (unlinkErr) => {
//   //         if (unlinkErr) {
//   //           console.error("Error deleting old logo:", unlinkErr);
//   //         }
//   //       });
//   //     }

//   //     const updatedCompany = await Company.findByIdAndUpdate(
//   //       companyID,
//   //       { logopath: logoPicturePath },
//   //       { new: true }
//   //     );

//   //     if (!updatedCompany) {
//   //       return res.status(404).json({ error: "Company not found." });
//   //     }

//   //     return res.status(200).json({
//   //       success: true,
//   //       message: "Logo uploaded successfully.",
//   //       updatedCompany,
//   //     });
//   //   });
//   // } catch (error) {
//   //   console.error("Error updating Logo:", error);
//   //   return res.status(500).json({ error: "Internal server error." });
//   // }
// };

// --------------------------------------------------------------------------------------------------------------------------------------
//favicon update API
// multer image upload
const faviconstorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/favicon");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = file.originalname.split(".").pop(); // Get the file extension
    cb(null, `favicon-${uniqueSuffix}.${extension}`);
  },
});

// Add this middleware after logoupload.single('logoimage')
const checkFaviconSize = (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    // Use sharp to get the dimensions of the uploaded logo
    sharp(req.file.path)
      .metadata()
      .then((metadata) => {
        const { width, height } = metadata;
        // Check if the dimensions are either 32x32 or 64x64
        if (width >= 32 && width <= 64 && height >= 32 && height <= 64) {
          // Valid size, continue with the next middleware
          next();
        } else {
          // Invalid size, delete the uploaded file and return an error
          fs.unlinkSync(req.file.path);
          return res.status(400).json({
            error: "Favicon size must be between 32x32 and 64x64 pixels.",
          });
        }
      })
      .catch((err) => {
        console.error("Error checking logo size:", err);
        return res.status(500).json({ error: "Internal server error." });
      });
  } catch (error) {
    console.error("Error checking logo size:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};

const faviconupload = multer({
  storage: faviconstorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit (adjust as needed)
});

// Define a function to handle profile picture upload
exports.uploadfavicon = async (req, res) => {
  try {
    // Your code to handle image upload and processing goes here
    const uploadedFileName = req.base64FileName;
    // Assuming the upload and processing were successful, you can send a success response
    res.status(200).json({
      message: "Favicon uploaded successfully",
      imagePath: uploadedFileName,
    });
  } catch (error) {
    console.error("Error during Favicon upload:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.getcompanies_share_referral_data = catchAsyncErrors(
  async (req, res, next) => {
    const { companyID } = req.user;
    console.log(companyID);
    const companyShareReferData = await CompanyShareReferralModel.findOne({
      companyID: companyID,
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

// Add Shipping Address
exports.createShippingAddress = catchAsyncErrors(async (req, res, next) => {
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
  } = req.body;

  const { id } = req.user;

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

  let shippingAddressFind = await shippingAddress.findOne({ userId: user._id });

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
});

exports.getAllShippingAddress = catchAsyncErrors(async (req, res, next) => {
  const { companyID, id } = req.user;
  // console.log(companyID,id, "id....")
  // console.log(req.user)
  try {
    const shippingAddresses = await shippingAddress.find({ userId: id });
    // console.log(shippingAddresses, "...")

    res.status(200).json({
      success: true,
      shippingAddresses,
    });
  } catch (err) {
    return next(new ErrorHandler("Unable to fetch shipping addresses", 500));
  }
});

exports.removeShippingAddress = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.user;
  const { addressId } = req.params;
  console.log(addressId, " address id");

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
});

exports.editShippingAddress = catchAsyncErrors(async (req, res, next) => {
  // console.log("edit called")
  // alert("alert")
  const { editAddressId } = req.params;
  console.log(editAddressId, "id"); // Get the address ID from the request URL
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
  } = req.body;

  const { id } = req.user;
  const shippingAddressData = {
    _id: editAddressId,
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
  console.log(shippingAddressData, "shippingAddressData");

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
    shipping_address[addressIndex] = shippingAddressData;

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
});

exports.invitedUser = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.body;
  const currentDate = new Date();

  // const data = await InvitedTeamMemberModel.findOne({
  //   invitationToken: token,
  //   invitationExpiry: { $gt: currentDate }, // Not expired
  // });
  const tokenExists = await InvitedTeamMemberModel.findOne({
    invitationToken: token,
  });

  if (!tokenExists) {
    res.status(404).json({
      success: false,
      message: "Invitation does not exist.",
    });
  } else {
    // Check the status field
    if (tokenExists.status === "Declined") {
      res.status(400).json({
        success: false,
        message: "Invalid invitation.",
      });
    } else {
      // Check if the invitation is not expired
      const data = await InvitedTeamMemberModel.findOne({
        invitationToken: token,
        invitationExpiry: { $gt: currentDate }, // Not expired
      }).select("_id email first_name last_name companyId team");

      // console.log(data, ".......................................................................")

      if (data) {
        res.status(200).json({
          success: true,
          userData: data,
        });
      } else {
        res.status(400).json({
          success: false,
          message: "Token is expired.",
        });
      }
    }
  }
});

exports.registerInvitedUser = catchAsyncErrors(async (req, res, next) => {
  try {
    const { _id, status } = req.body.InvitedUserData;
    if (status === "Declined") {
      res.status(400).json({
        success: false,
        message: "Invalid invitation.",
      });
      return; // Stop execution if the invitation is declined.
    }
    let userdetails = ({ email, first_name, last_name, companyId, team } =
      req.body.InvitedUserData);

    userdetails = {
      ...userdetails,
      isIndividual: false,
      isPaidUser: true,
      companyID: userdetails.companyId,
      role: "teammember",
      status: "inactive"
    };

    const user = await User.create(userdetails);
    const userInfo = await UserInformation.create({
      user_id: user._id,
      company_ID: user.companyID,
      // Add any other fields you want to store in userinfo
    });
    await userInfo.save();
    const existingCompanySlug = await parmalinkSlug.findOne({
      companyID: user.companyID,
    });
    const companyuniqueSlugValue = existingCompanySlug?.companyunique_slug[0]?.value

    const generatedCode = generateUniqueCode();
    const user_parmalink = await parmalinkSlug.create({
      user_id: user._id,
      companyID: userdetails.companyId,
      unique_slugs: [{ value: generatedCode, timestamp: Date.now() }],
      userurlslug: generatedCode,
      companyunique_slug: [{ value: companyuniqueSlugValue, timestamp: Date.now() }],
      companyurlslug: companyuniqueSlugValue,
    })
    await user_parmalink.save();
    user.userurlslug = generatedCode;
    await user.save();

    // const userplan = planData.plan;
    // console.log(userplan, "))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))")
    let slug = null;
    const username = user.first_name;
    const userlastname = user.last_name;
    // console.log(userlastname, username, "---------------------------------------------------")
    const firstName = username.toLowerCase().replace(/[^a-z0-9-]/g, "");
    const lastName = userlastname.toLowerCase().replace(/[^a-z0-9-]/g, "");
    slug = `${firstName}${lastName}`;
    // console.log(slug, "((((((((((((((((((((((((((((((((((((((((((((((((((((((((")

    if (slug !== null) {
      // Check for duplicates in user_parmalink collection before saving
      const isDuplicate = await parmalinkSlug.exists({ "unique_slugs.value": slug });
      if (!isDuplicate) {
        // Save the slug
        const uniqueSlug = { value: slug, timestamp: Date.now() };
        await parmalinkSlug.updateOne(
          { user_id: user._id },
          { $addToSet: { unique_slugs: uniqueSlug }, userurlslug: slug },
        );
        await User.updateOne(
          { _id: user._id },
          { userurlslug: slug },
        );
      }
    }

    const deleteInvitedUser = await InvitedTeamMemberModel.findByIdAndDelete(
      _id
    );
    if (!deleteInvitedUser) {
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return next(new ErrorHandler(error, 500));
  }
});

exports.invitedUserGoogleSignup = catchAsyncErrors(async (req, res, next) => {
  const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  const { invitedUserData } = req.body;
  let { token, userData } = invitedUserData;
  const { _id, companyId, email: userEmail, status } = userData;
  console.log(userEmail);
  // Check the status field
  if (status === "Declined") {
    return res.status(400).json({
      success: false,
      message: "Invalid invitation.",
    });
  }

  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  const googleId = payload.sub;
  console.log(payload);
  const { name, email } = payload;

  if (email != userEmail) {
    return next(new ErrorHandler("Email does not found in invitation", 404));
  }
  const parts = name.split(" ");
  const first_name = parts[0];
  const last_name = parts[1];
  const generatedCode = generateUniqueCode();
  userData = {
    email: email,
    first_name: first_name,
    last_name: last_name,
    googleId: googleId,
    companyID: companyId,
    isIndividual: false,
    isIndividual: false,
    isPaidUser: true,
    userurlslug: generatedCode,
    status: "inactive"
  };
  const existingUser = await User.findOne({ email: userData.email });

  if (existingUser) {
    return next(
      new ErrorHandler("User with the same email already exists", 500)
    );
  }

  const newUser = await User.create(userData);
  const user = newUser._id;
  const user_parmalink = await parmalinkSlug.create({
    user_id: user,
    companyID: companyId,
    unique_slugs: [{ value: generatedCode, timestamp: Date.now() }],
    userurlslug: generatedCode,
  })
  await user_parmalink.save();

  const deleteInvitedUser = await InvitedTeamMemberModel.findByIdAndDelete(_id);
  if (!deleteInvitedUser) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }

  res.status(200).json({
    success: true,
    newUser,
  });

  res.status(200).json({
    success: true,
    newUser,
  });
});

exports.resendemailinvitation = catchAsyncErrors(async (req, res, next) => {
  const { userid, manager_email, manager_firstname } = req.body;
  const { companyID } = req.user;

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
      from: "`OneTapConnect:${process.env.NODMAILER_EMAIL}`",
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
});

//get profile user
exports.getUserInformation = catchAsyncErrors(async (req, res, next) => {
  try {
    const { id } = req.user;

    const userInfo = await UserInformation.find({ user_id: id });

    if (!userInfo || userInfo.length === 0) {
      return next(new ErrorHandler("User Information Not Found", 401));
    }

    const firstuserInfo = userInfo[0];

    res.status(200).json({
      success: true,
      firstuserInfo,
    });
  } catch (error) {
    return next(new ErrorHandler(error, 501));

  }
});

// exports.getTeam = catchAsyncErrors(async (req, res, next) => {
//   const company_id = req.user.companyID;
//   // console.log(company_id, "sadadas")

//   const team = await Team_SchemaModel.find({ companyID: company_id });
//   // console.log(team ,"teamname")
//   res.status(200).json({ message: "Users updated successfully", team });
// });

// exports.updateUserRole = catchAsyncErrors(async (req, res, next) => {
//   const { userId, userRole } = req.body;

//   userId.forEach(async (id) => {
//     console.log(id);
//     const updatedUser = await User.findByIdAndUpdate(id, {
//       role: userRole,
//     });
//     console.log(updatedUser);
//   });

//   res.status(200).json({
//     success: true,
//   });
// });

// exports.updateUserRole = catchAsyncErrors(async (req, res, next) => {
//   const { userId, userRole } = req.body;

//   try {
//     // Update user roles based on userId array
//     await User.updateMany({ _id: { $in: userId } }, { role: userRole });
//     res.status(200).json({
//       success: true,
//     });
//   } catch (error) {
//     console.error("Error updating user roles:", error);
//     res.status(500).json({
//       success: false,
//       error: "Error updating user roles",
//     });
//   }
// });
exports.updateUserRole = catchAsyncErrors(async (req, res, next) => {
  const { superAdmins, administrators, managers, teammember } = req.body;

  try {
    // Define a function to update roles based on the provided user IDs and role
    const updateUserRoles = async (userIds, userRole) => {
      await User.updateMany({ _id: { $in: userIds } }, { role: userRole });
    };

    // Update user roles for each role category
    await updateUserRoles(superAdmins.map(user => user.id), 'superadmin');
    await updateUserRoles(administrators.map(user => user.id), 'administrator');
    await updateUserRoles(managers.map(user => user.id), 'manager');
    await updateUserRoles(teammember.map(user => user.id), 'teammember');

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
});

exports.updateUserPlanonRoleChange = catchAsyncErrors(async (req, res, next) => {
  const { userID, subscriptionDetails } = req.body;
  try {
    // const updatedUser = await User.findByIdAndUpdate(
    const filter = {
      user_id: { $in: userID }
    };

    const update = {
      $set: { subscription_details: subscriptionDetails }
    };
    // Update user subscription_details based on userIDs array
    const updatedUser = await UserInformation.updateMany(filter, update);
    res.status(200).json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    console.error("Error updating subscription details:", error);
    res.status(500).json({
      success: false,
      error: "Error updating subscription details",
    });
  }
});


// exports.removeUserRole = catchAsyncErrors(async (req, res, next) => {
//   const { userId } = req.body;

//   try {
//     userId.forEach(async (id) => {
//       console.log(id);
//       // Find the user by ID and update their role to "member"
//       const updatedUser = await User.findByIdAndUpdate(id, {
//         role: "member",
//       });

//       console.log(updatedUser);
//     });

//     res.status(200).json({
//       success: true,
//     });
//   } catch (error) {
//     // Handle any errors that occur during the update process
//     console.error(error);
//     res.status(500).json({
//       success: false,
//       message: "An error occurred while removing user roles.",
//     });
//   }
// });

exports.inviteTeamMembermanually = catchAsyncErrors(async (req, res, next) => {
  const { formData } = req.body;
  const { companyID, id } = req.user;
  // console.log(formData);

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

  const company = await Company.findById(companyID);
  const userInfo = await User.findById(id);
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
    from: "`OneTapConnect:${process.env.NODMAILER_EMAIL}`",
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
            ${userInfo.first_name} ${userInfo.last_name}<br/>
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
    companyID: companyID,
    password: password,
    userurlslug: generatedCode,
    role: "teammember",
    status: "inactive"
  });
  // console.log("called")
  const userInformationData = {
    user_id: userData._id,
    website_url: website_url,
    company_ID: userData.companyID
    // Add other fields from formData if needed
  };
  await UserInformation.create(userInformationData);

  // console.log(userData._id)
  const existingCompanySlug = await parmalinkSlug.findOne({
    companyID: userData.companyID,
  });
  const companyuniqueSlugValue = existingCompanySlug?.companyunique_slug[0]?.value

  const user_parmalink = await parmalinkSlug.create({
    user_id: userData._id,
    companyID: companyID,
    unique_slugs: [{ value: generatedCode, timestamp: Date.now() }],
    userurlslug: generatedCode,
    companyunique_slug: [{ value: companyuniqueSlugValue, timestamp: Date.now() }],
    companyurlslug: companyuniqueSlugValue,
  })
  await user_parmalink.save();

  // const userplan = planData.plan;
  // console.log(userplan, "))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))")
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
    const isDuplicate = await parmalinkSlug.exists({ "unique_slugs.value": slug });
    if (!isDuplicate) {
      // Save the slug
      const uniqueSlug = { value: slug, timestamp: Date.now() };
      await parmalinkSlug.updateOne(
        { user_id: userData._id },
        { $addToSet: { unique_slugs: uniqueSlug }, userurlslug: slug },
      );
      await User.updateOne(
        { _id: userData._id },
        { userurlslug: slug },
      );
    }
  }
  // User.userurlslug = generatedCode;
  // await User.save();

  res.status(201).json({
    success: true,
    message: "Invitaion Email sent Successfully",
    userID: userData._id,
  });
});

exports.uploadImage = catchAsyncErrors(async (req, res, next) => {
  // const userID = req.body.userID;
  // console.log(userID)
  res.send("called api");
});

// exports.saveuserdata = catchAsyncErrors(async (req, res, next) => {
//   const { field_name, field_value } = req.body;
//   const { id } = req.user;
//   const updateData = {};

//   updateData[field_name] = field_value;

//   const data = await User.updateOne({ _id: id }, { $set: updateData });

//   res.status(200).json({
//     success: true,
//     data
//   });
// });
exports.saveuserdata = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params; // Assuming you pass the user ID in the URL parameters
  const { field_name, field_value } = req.body;

  const updateData = {};
  updateData[field_name] = field_value;

  const updatedUser = await User.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true }
  );

  if (!updatedUser) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  res.status(200).json({
    success: true,
    data: updatedUser,
  });
});
exports.saveuserinfodata = catchAsyncErrors(async (req, res, next) => {
  const { field_name, field_value } = req.body;
  const { id } = req.params;
  const updateData = {};

  updateData[field_name] = field_value;

  const data = await UserInformation.updateOne(
    { user_id: id },
    { $set: updateData }
  );

  res.status(200).json({
    success: true,
    data: data,
  });
});
// exports.saveuserinfodata = catchAsyncErrors(async (req, res, next) => {
//   const { field_name, field_value } = req.body;
//   const { id } = req.user;
//   const updateData = {};

//   updateData[field_name] = field_value;

//   const data = await UserInformation.updateOne({ user_id: id }, { $set: updateData });

//   res.status(200).json({
//     success: true,
//     data
//   });
// });

exports.savecompanydata = catchAsyncErrors(async (req, res, next) => {
  const { field_name, field_value } = req.body;
  const { companyID } = req.user;

  const company = await Company.findById(companyID);

  if (!company) {
    return res
      .status(404)
      .json({ success: false, message: "Company not found" });
  }

  company[field_name] = field_value;
  await company.save();

  res.status(200).json({
    success: true,
  });
});


// exports.verifypassword = catchAsyncErrors(async (req, res, next) => {
//   const { userid, password, email, companyid, firstname } = req.body;
//   console.log(userid, password, email, companyid, firstname);

//   try {
//     const user = await User.findOne({ _id: userid }).select("+password");

//     if (!user) {
//       return res.status(400).json({ success: false, message: 'User not found' });
//     }
//     const transporter = nodemailer.createTransport({
//       service: "Gmail",
//       port: 587,
//       auth: {
//         user: process.env.NODMAILER_EMAIL,
//         pass: process.env.NODEMAILER_PASS,
//       },
//     });

//     const isPasswordValid = await user.comparePassword(password);

//     if (!isPasswordValid) {
//       return res.status(400).json({ success: false, message: 'Incorrect password' });
//     }

//     const recoveryToken = jwt.sign(
//       { _id: userid },
//       process.env.JWT_SECRET,
//       { expiresIn: '7d' }
//     );

//     const updatedUser = await User.updateMany(
//       { _id: userid },
//       {
//         $set: { delete_account_status: 'inactive' },
//         recoveryToken: recoveryToken
//       },
//       { new: true }
//     );

//     if (!updatedUser) {
//       return res.status(404).json({ success: false, message: 'User not found' });
//     }

//     const mailOptions = {
//       from: 'otcdevelopers@gmail.com',
//       // to: email,
//       to: email,
//       subject: 'Account Recovery',
//       // text: `Click the following link to recover your account: ${process.env.FRONTEND_URL}/login?token=${recoveryToken}`,
//       html: `
//     <!DOCTYPE html>
//     <html>

//     <head>
//         <meta charset="utf-8" />
//         <meta name="viewport" content="initial-scale=1, width=device-width" />
//     </head>

//     <body style="margin: 0; line-height: normal; font-family: 'Assistant', sans-serif;">

//         <div style="background-color: #f2f2f2; padding: 20px; max-width: 600px; margin: 0 auto;">
//             <div style="background-color: #000; border-radius: 20px 20px 0 0; padding: 20px 15px; text-align: center;">
//             <img src="https://onetapconnect.sincprojects.com/static/media/logo_black.c86b89fa53055b765e09537ae9e94687.svg">

//             </div>
//             <div style="background-color: #fff; border-radius: 0 0 20px 20px; padding: 20px; color: #333; font-size: 14px;">
//             <!-- <div><img src="https://onetapconnect.com/wp-content/uploads/2023/05/OneTapConnect-logo-2023.png" width="150px"/></div> -->

//             <p>Dear ${firstname}<br/><br/>
//             We hope this message finds you well.<br/><br/>
//             We received a request to delete your account, and we wanted to let you know that your account is scheduled for deletion. However, we understand that circumstances may change. That's why we're providing you with a 7-day window to recover your account.<br/><br/>
//             To initiate the account recovery process, simply click on the link below:<br/>

//             <div class="main-div-" style="display:block; margin-top: 5px; width:50%; juatify-content:center;  text-align: center;">
//             <div style="flex: 1; border-radius: 4px; overflow: hidden; background-color: #e65925;">
//                 <a href="${process.env.FRONTEND_URL}/login?token=${recoveryToken}" style="display: inline-block; ; padding: 10px 20px; font-weight: 100; color: #fff; text-align: center; text-decoration: none;">Recover Account</a>
//             </div>
//             </div><br/>

//             Please note that this link is time-sensitive and will expire after 7 days. Once the link expires, you will no longer be able to recover your account.<br/>
//             <div style="margin-top: 25px;">
//             <div style="font-weight: bold;">Technical issue?</div>
//             <div style="margin-top: 5px;">
//               <span>In case you're facing any technical issue, please contact our support team </span>
//               <span style="color: #2572e6;"><a href="https://support.onetapconnect.com/">here.</a></span>
//             </div>
//             </div><br/>
//             Thank you for using our platform.<br/><br/>
//             Best regards,<br/>
//             Team OneTapConnect.<br/>

//         </div>

//     </body>

//     </html>


//   `,
//     };

//     await transporter.sendMail(mailOptions);

//     res.cookie("token", null, {
//       expires: new Date(Date.now()),
//       httpOnly: true,
//     });

//     res.status(200).json({ success: true, message: 'Password verified and user status updated to inactive' });
//     // scheduleTokenExpiration(recoveryToken, userid, companyid);

//   } catch (error) {
//     console.error('Error:', error);
//     res.status(500).json({ success: false, message: 'Internal server error' });
//   }
// });
// function scheduleTokenExpiration(token, userid, companyid) {
//   const { exp } = jwt.decode(token);

//   const expirationTime = (exp - Math.floor(Date.now() / 1000)) * 1000;
//   console.log(expirationTime, ".....expiring time")
//   setTimeout(async () => {
//     try {
//       const user = await User.findOne({ _id: userid });

//       if (user && user.recoveryToken === token) {
//         const deletePromises = [];

//         const pushDeletePromise = async (deletePromise, errorMessage) => {
//           try {
//             const result = await deletePromise;
//             if (!result) {
//               console.log(errorMessage);
//             }
//           } catch (error) {
//             console.error('Error deleting data:', error);
//           }
//         };

//         pushDeletePromise(User.findOneAndDelete({ _id: userid }), 'User not found');
//         pushDeletePromise(UserInformation.findOneAndDelete({ user_id: userid }), 'User Information not found');
//         pushDeletePromise(Cards.findOneAndDelete({ userID: userid }), 'Card info not found');
//         pushDeletePromise(billingAddress.findOneAndDelete({ userId: userid }), 'Billing address not found');
//         pushDeletePromise(shippingAddress.findOneAndDelete({ userId: userid }), 'Shipping address not found');
//         pushDeletePromise(Company.findOneAndDelete({ primary_account: userid }), 'Company info not found');
//         pushDeletePromise(
//           CompanyShareReferralModel.findOneAndDelete({ companyID: companyid }),
//           'Company Share Referral data not found'
//         );
//         deletePromises.push(TeamDetails.deleteMany({ companyID: companyid }));

//         await Promise.all(deletePromises);

//         console.log(`Expired token for user ${userid} deleted.`);
//       }
//     } catch (error) {
//       console.error('Error deleting expired token:', error);
//     }
//   }, expirationTime);
// }
// exports.verifyRecoveryToken = catchAsyncErrors(async (req, res, next) => {
//   const { email, password, token } = req.body;
//   // console.log("tooken.....",token)
//   if (!email || !password) {
//     return res.status(400).json({ success: false, message: 'Email and password are required' });
//   }

//   try {

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const userid = decoded._id;
//     // console.log("iddd...",userid)

//     const user = await User.findOne({ _id: userid }).select("+password");

//     if (!user) {
//       return res.status(400).json({ success: false, message: 'User not found' });
//     }

//     const checkemail = await User.findOne({ email })
//     if (!checkemail) {
//       return res.status(400).json({ success: false, message: "Incorrect Email" });
//     }

//     const isPasswordValid = await user.comparePassword(password);
//     if (!isPasswordValid) {
//       return res.status(400).json({ success: false, message: 'Incorrect Password' });
//     }

//     const userRecoveryToken = user.recoveryToken;
//     // console.log("database token........",userRecoveryToken)

//     jwt.verify(userRecoveryToken, process.env.JWT_SECRET, async (err, decoded) => {
//       if (err) {
//         if (err.name === 'TokenExpiredError') {
//           return res.status(400).json({ success: false, message: 'Token expired' });
//         }
//         return res.status(400).json({ success: false, message: 'Invalid token' });
//       }

//       try {
//         await User.updateOne(
//           { _id: userid },
//           { $set: { delete_account_status: 'active' }, recoveryToken: null }
//         );

//         return res.status(200).json({ success: true, message: 'Token verified and fields updated successfully' });
//       } catch (error) {
//         console.error(error);
//         return res.status(500).json({ success: false, message: 'Internal Server Error' });
//       }
//     });

//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ success: false, message: 'Internal Server Error' });
//   }
// });


exports.guestcheckoutHandler = catchAsyncErrors(async (req, res, next) => {
  const {
    userData,
    billingdata,
    shippingData,
    shipping_method,
    cardDetails,
  } = req.body;

  console.log("--------------------------------");
  console.log("--------------------------------");
  console.log("--------------------------------");
  console.log("--------------------------------");
  console.log("--------------------------------");

  const guestCustomer = new GuestCustomer({
    first_name: userData.first_name,
    last_name: userData.last_name,
    email: userData.email,
    contact: userData.contact,
    billing_address: {
      first_name: billingdata.first_name,
      last_name: billingdata.last_name,
      line1: billingdata.line1,
      line2: billingdata.line2,
      city: billingdata.city,
      state: billingdata.state,
      country: billingdata.country,
      postal_code: billingdata.postal_code
    },
    shipping_address: [
      {
        first_name: shippingData.first_name,
        last_name: shippingData.last_name,
        line1: shippingData.line1,
        line2: shippingData.line2,
        city: shippingData.city,
        state: shippingData.state,
        country: shippingData.country,
        postal_code: shippingData.postal_code
      }
    ],
    card_details: {
      nameOnCard: cardDetails.cardName,
      cardNumber: cardDetails.cardNumber,
      cardExpiryMonth: cardDetails.cardExpiryMonth,
      cardExpiryYear: cardDetails.cardExpiryYear,
      brand: cardDetails.brand,
    },
    shipping_method: {
      type: shipping_method.type,
      price: shipping_method.price,
    }
  });
  await guestCustomer.save();
  res.status(201).json({ success: true, message: 'Guest customer created successfully' });

});



// Create a new order for a specific user
exports.createOrder = catchAsyncErrors(async (req, res, next) => {
  try {
    // Get the user ID from the authenticated user or request data
    const userId = req.body.userId; // Assuming you have a user object in the request with an "id" property
    const orderData = req.body.createOrderData
    console.log(userId, "order by userId");
    const {
      smartAccessories,
      totalAmount,
      tax,
    } = req.body;






    // else part if payment is sucessfull



    // Create a new order linked to the specific user
    const order = new Order({
      paymentStatus: "paid",
      user: userId, // Link the order to the specific user
      smartAccessories,
      totalAmount,
      tax,
    });

    // Save the order to the database
    await order.save();

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


exports.getProfileimage = catchAsyncErrors(async (req, res, next) => {
  const { _id } = req.user;

  // Checking if user has given a valid user ID

  if (!_id) {
    return next(new ErrorHandler("User ID is missing in the request", 400));
  }

  const Avataruser = await User.findById(_id);
  const userprofileimage = Avataruser.avatar;
  if (!Avataruser) {
    return next(new ErrorHandler("User not found", 401));
  }

  res.status(200).json({
    success: true,
    userprofileimage,
    Avataruser,
  });
});

exports.generateotp = catchAsyncErrors(async (req, res, next) => {
  const { email, firstname, status } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const verificationToken = jwt.sign(
    { otp, email },
    process.env.JWT_SECRET,
    { expiresIn: '10m' }
  );
  try {
    const updatedUser = await User.findOneAndUpdate(
      { email: email },
      { $set: { otptoken: verificationToken } },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    if (status === "deactivate") {
      // console.log(otp, "QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ")
      senddeactivateotpEmail(email, otp, firstname)
    } else {
      sendOtpEmail(email, otp, firstname);
    }
    return res.status(200).json({ success: true, message: 'OTP sent successfully.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal Server Error.' });
  }
});
const sendOtpEmail = (email, otp, firstname) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.NODMAILER_EMAIL,
      pass: process.env.NODEMAILER_PASS,
    },
  });
  const rootDirectory = process.cwd();
  const uploadsDirectory = path.join(rootDirectory, "uploads", "Logo.png");
  const mailOptions = {
    from: "`OneTapConnect:${process.env.NODMAILER_EMAIL}`",
    to: email,
    // to: "tarun.syndell@gmail.com",
    subject: 'One-Time Password (OTP) for Onetap Connect Account Deletion',
    // text: `Your OTP is: ${otp}. It will expire in 10 minutes.`,
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
              We have received a request to delete your account. To proceed with this request, we need to verify your identity.<br/><br/>
              Please use the following One-Time Password (OTP) within the next 10 minutes to confirm the deletion of your account:<br/><br/>
  
              <span style="font-weight: bold;">OTP:</span>&nbsp; ${otp}<br/>
  
              <div style="margin-top: 25px;">
               <div style="font-weight: bold;">Technical issue?</div>
                 <div style="margin-top: 5px;">
                 <span>In case you're facing any technical issue, please contact our support team </span>
                 <span style="color: #2572e6;"><a href="https://support.onetapconnect.com/">here.</a></span>
               </div>
              </div><br/>
              Thank you for using our platform.<br/><br/>
              Best regards,<br/>
              Team OneTapConnect.<br/>
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
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
    } else {
      // console.log('OTP email sent successfully:', info.response);
    }
  });
};
const senddeactivateotpEmail = (email, otp, firstname) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.NODMAILER_EMAIL,
      pass: process.env.NODEMAILER_PASS,
    },
  });
  const rootDirectory = process.cwd();
  const uploadsDirectory = path.join(rootDirectory, "uploads", "Logo.png");
  const mailOptions = {
    from: "OneTapConnect:otcdevelopers@gmail.com",
    to: email,
    // to: "tarun.syndell@gmail.com",
    subject: 'One-Time Password (OTP) for Onetap Connect Account Deactivation',
    // text: `Your OTP is: ${otp}. It will expire in 10 minutes.`,
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
      We have received a request to deactivate your account. To proceed with this request, we need to verify your identity.<br/><br/>
      Please use the following One-Time Password (OTP) within the next 10 minutes to confirm the deactivation of your account:<br/><br/><br/>

      <span style="font-weight: bold;">OTP:</span>&nbsp; ${otp}<br/><br/><br/>

      <span style="font-weight: bold;">Caution:</span>&nbsp; Once you deactivate your account, your subscription will also be canceled.<br/>

      <div style="margin-top: 25px;">
       <div style="font-weight: bold;">Technical issue?</div>
         <div style="margin-top: 5px;">
         <span>In case you're facing any technical issue, please contact our support team </span>
         <span style="color: #2572e6;"><a href="https://support.onetapconnect.com/">here.</a></span>
       </div>
      </div><br/>
      Thank you for using our platform.<br/><br/>
      Best regards,<br/>
      Team OneTapConnect.<br/>
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
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
    } else {
      // console.log('OTP email sent successfully:', info.response);
    }
  });
};
exports.verifyotp = catchAsyncErrors(async (req, res, next) => {
  const { email, otp } = req.body;
  // console.log(email, otp, "$$$$$%%$%$$$%$%$%$%$$%%%$%$%$%$%$%$%$%$%$%$%$%$%%")
  // console.log("cld1")
  const user = await User.findOne({ email: email });
  const storedotp = user.otptoken;
  const userid = user._id;
  const companyid = user.companyID;
  const firstname = user.first_name;
  // console.log(userid, companyid, firstname)
  // console.log(storedotp, "................................................")
  try {
    const decodedToken = jwt.verify(storedotp, process.env.JWT_SECRET);
    const userEmail = decodedToken.email;
    // console.log(userEmail, "@@@@@@@@@@@@@@@@@@@@@@@");
    const userotp = decodedToken.otp;
    // console.log(userotp, "!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      port: 587,
      auth: {
        user: process.env.NODMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASS,
      },
    });
    if (otp === userotp) {
      const recoveryToken = jwt.sign(
        { _id: userid },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      const updatedUser = await User.updateMany(
        { _id: userid },
        {
          $set: { delete_account_status: 'inactive' },
          recoveryToken: recoveryToken,
          otptoken: null,
        },
        { new: true }
      );
      const companyUsers = await User.updateMany(
        {
          companyID: companyid,
          role: { $in: ["administrator", "teammember", "manager"] },
        },
        {
          $set: { delete_account_status: 'inactive' },
        },
      );
      if (companyUsers.nModified === 0) {
        console.log('No matching users found for companyUsers update.');
      }

      if (!updatedUser) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const rootDirectory = process.cwd();
      const uploadsDirectory = path.join(rootDirectory, "uploads", "Logo.png");
      const mailOptions = {
        from: "`OneTapConnect:${process.env.NODMAILER_EMAIL}`",
        to: email,
        // to: "tarun.syndell@gmail.com",
        subject: 'OneTap Connect Account Recovery',
        // text: `Click the following link to recover your account: ${process.env.FRONTEND_URL}/login?token=${recoveryToken}`,
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
              We hope this message finds you well.<br/><br/>
              We received a request to delete your account, and we wanted to let you know that your account is scheduled for deletion. However, we understand that circumstances may change. That's why we're providing you with a 7-day window to recover your account.<br/><br/>
              To initiate the account recovery process, simply click on the link below:<br/>
  
              <div class="main-div-" style="display:block; margin-top: 5px; width:50%; juatify-content:center;  text-align: center;">
              <div style="flex: 1; border-radius: 4px; overflow: hidden; background-color: #e65925;">
                  <a href="${process.env.FRONTEND_URL}/login?token=${recoveryToken}" style="display: inline-block; ; padding: 10px 20px; font-weight: 100; color: #fff; text-align: center; text-decoration: none;">Recover Account</a>
              </div>
              </div><br/>
  
              Please note that this link is time-sensitive and will expire after 7 days. Once the link expires, you will no longer be able to recover your account.<br/>
              <div style="margin-top: 25px;">
              <div style="font-weight: bold;">Technical issue?</div>
              <div style="margin-top: 5px;">
                <span>In case you're facing any technical issue, please contact our support team </span>
                <span style="color: #2572e6;"><a href="https://support.onetapconnect.com/">here.</a></span>
              </div>
              </div><br/>
              Thank you for using our platform.<br/><br/>
              Best regards,<br/>
              Team OneTapConnect.<br/>
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
      res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
      });
      scheduleTokenExpiration(recoveryToken, userid, companyid);
      return res.status(200).json({ success: true, message: 'OTP verified' });
    } else {
      return res.status(400).json({ success: false, message: 'Incorrect OTP' });
    }
  } catch (error) {
    // console.error('Error:', error);
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ success: false, message: 'OTP has expired' });
    }
    // console.error('Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});
const userTimeouts = {};
function scheduleTokenExpiration(token, userid, companyid) {
  const { exp } = jwt.decode(token);
  const expirationTime = (exp - Math.floor(Date.now() / 1000)) * 1000;
  console.log(expirationTime, ".....expiring time");

  const expirationTimeInSeconds = Math.floor(expirationTime / 1000);
  const hours = Math.floor(expirationTimeInSeconds / 3600);
  const minutes = Math.floor((expirationTimeInSeconds % 3600) / 60);
  const seconds = expirationTimeInSeconds % 60;
  // console.log(`Expiration Time: ${hours} hours, ${minutes} minutes, ${seconds} seconds`);

  const timeoutId = setTimeout(async () => {
    console.log('called delete');
    try {
      const user = await User.findOne({ _id: userid });
      if (user && user.recoveryToken === token) {
        const deletePromises = [];
        const pushDeletePromise = async (deletePromise, errorMessage) => {
          try {
            const result = await deletePromise;
            if (!result) {
              console.log(errorMessage);
            }
          } catch (error) {
            console.error('Error deleting data:', error);
          }
        };
        pushDeletePromise(User.findOneAndDelete({ _id: userid }), 'User not found');
        pushDeletePromise(UserInformation.findOneAndDelete({ user_id: userid }), 'User Information not found');
        pushDeletePromise(Cards.findOneAndDelete({ userID: userid }), 'Card info not found');
        pushDeletePromise(billingAddress.findOneAndDelete({ userId: userid }), 'Billing address not found');
        pushDeletePromise(shippingAddress.findOneAndDelete({ userId: userid }), 'Shipping address not found');
        pushDeletePromise(Company.findOneAndDelete({ primary_account: userid }), 'Company info not found');
        pushDeletePromise(
          CompanyShareReferralModel.findOneAndDelete({ companyID: companyid }),
          'Company Share Referral data not found'
        );
        deletePromises.push(TeamDetails.deleteMany({ companyID: companyid }));
        delete userTimeouts[userid];
        await Promise.all(deletePromises);
        await handleDataDeletionSuccess(companyid);
        // console.log(`Expired token for user ${userid} deleted.`);
      }
    } catch (error) {
      console.error('Error deleting expired token:', error);
    }
  }, expirationTime);
  // Store the timeout ID associated with the user
  userTimeouts[userid] = timeoutId;
}
// function scheduleTokenExpiration(token, userid, companyid) {
//   const { exp } = jwt.decode(token);
//   const expirationTime = (exp - Math.floor(Date.now() / 1000)) * 1000;
//   console.log(expirationTime, ".....expiring time")

//   const expirationTimeInSeconds = Math.floor(expirationTime / 1000);
//   const hours = Math.floor(expirationTimeInSeconds / 3600);
//   const minutes = Math.floor((expirationTimeInSeconds % 3600) / 60);
//   const seconds = expirationTimeInSeconds % 60;
//   // console.log(`Expiration Time: ${hours} hours, ${minutes} minutes, ${seconds} seconds`);

//   setTimeout(async () => {
//     console.log('called delete')
//     try {
//       const user = await User.findOne({ _id: userid });
//       if (user && user.recoveryToken === token) {
//         const deletePromises = [];
//         const pushDeletePromise = async (deletePromise, errorMessage) => {
//           try {
//             const result = await deletePromise;
//             if (!result) {
//               console.log(errorMessage);
//             }
//           } catch (error) {
//             console.error('Error deleting data:', error);
//           }
//         };
//         pushDeletePromise(User.findOneAndDelete({ _id: userid }), 'User not found');
//         pushDeletePromise(UserInformation.findOneAndDelete({ user_id: userid }), 'User Information not found');
//         pushDeletePromise(Cards.findOneAndDelete({ userID: userid }), 'Card info not found');
//         pushDeletePromise(billingAddress.findOneAndDelete({ userId: userid }), 'Billing address not found');
//         pushDeletePromise(shippingAddress.findOneAndDelete({ userId: userid }), 'Shipping address not found');
//         pushDeletePromise(Company.findOneAndDelete({ primary_account: userid }), 'Company info not found');
//         pushDeletePromise(
//           CompanyShareReferralModel.findOneAndDelete({ companyID: companyid }),
//           'Company Share Referral data not found'
//         );
//         deletePromises.push(TeamDetails.deleteMany({ companyID: companyid }));
//         await Promise.all(deletePromises);
//         await handleDataDeletionSuccess(companyid);
//         // console.log(`Expired token for user ${userid} deleted.`);
//       }
//     } catch (error) {
//       console.error('Error deleting expired token:', error);
//     }
//   }, expirationTime);
// }
async function handleDataDeletionSuccess(companyid) {
  console.log(`Data for company ${companyid} successfully deleted.`);
  // const companyuser = await User.find({ companyID: companyid });
  try {
    const companyUsers = await User.find({
      companyID: companyid,
      role: { $in: ["administrator", "teammember", "manager"] }
    });

    const deletePromises = [];
    const pushDeletePromise = async (deletePromise, errorMessage) => {
      try {
        const result = await deletePromise;
        if (!result) {
          console.log(errorMessage);
        }
      } catch (error) {
        console.error('Error deleting data:', error);
      }
    };
    for (const user of companyUsers) {
      const deletePromise = User.findOneAndDelete({ _id: user._id });
      pushDeletePromise(deletePromise, `User with _id ${user._id} not found`);
      const userInfoDeletePromise = UserInformation.findOneAndDelete({ user_id: user._id });
      pushDeletePromise(userInfoDeletePromise, `User Information for _id ${user._id} not found`);
      const cardsDeletePromise = Cards.findOneAndDelete({ userID: user._id });
      pushDeletePromise(cardsDeletePromise, `Card info for _id ${user._id} not found`);
      const billingAddressDeletePromise = billingAddress.findOneAndDelete({ userId: user._id });
      pushDeletePromise(billingAddressDeletePromise, `Billing address for _id ${user._id} not found`);
      const shippingAddressDeletePromise = shippingAddress.findOneAndDelete({ userId: user._id });
      pushDeletePromise(shippingAddressDeletePromise, `Shipping address for _id ${user._id} not found`);
    }
    await Promise.all(deletePromises);
  } catch (error) {
    console.error('Error deleting users:', error);
  }
}

exports.verifyRecoveryToken = catchAsyncErrors(async (req, res, next) => {
  const { email, password, token } = req.body;
  console.log("tooken.....", token)
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userid = decoded._id;
    console.log("iddd...", userid)
    const user = await User.findOne({ _id: userid }).select("+password");
    if (!user) {
      return res.status(400).json({ success: false, message: 'User not found' });
    }
    const checkemail = await User.findOne({ email })
    if (!checkemail) {
      return res.status(400).json({ success: false, message: "Incorrect Email" });
    }
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({ success: false, message: 'Incorrect Password' });
    }
    const userRecoveryToken = user.recoveryToken;
    console.log("database token........", userRecoveryToken)
    jwt.verify(userRecoveryToken, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(400).json({ success: false, message: 'Token expired' });
        }
        return res.status(400).json({ success: false, message: 'Invalid token' });
      }
      try {
        await User.updateOne(
          { _id: userid },
          { $set: { delete_account_status: 'active' }, recoveryToken: null }
        );
        return res.status(200).json({ success: true, message: 'Token verified and fields updated successfully' });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});
exports.google_verify_recover_account = catchAsyncErrors(async (req, res, next) => {
  const { acc_recover_token } = req.body;
  console.log(acc_recover_token, "%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%")
  try {
    const decoded = jwt.verify(acc_recover_token, process.env.JWT_SECRET);
    const userid = decoded._id;
    const user = await User.findById(userid);
    if (!user) {
      return res.status(400).json({ success: false, message: 'User not found' });
    }
    const userRecoveryToken = user.recoveryToken;
    console.log("database token........", userRecoveryToken)
    jwt.verify(userRecoveryToken, process.env.JWT_SECRET);
    await User.findOneAndUpdate(
      { _id: userid },
      { $set: { delete_account_status: 'active' }, recoveryToken: null }
    );
    return res.status(200).json({ success: true, message: 'Token verified and fields updated successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

exports.getunique_slug = catchAsyncErrors(async (req, res, next) => {
  const { _id } = req.user;
  console.log(_id);
  const users_slug = await parmalinkSlug.find({ user_id: _id });
  console.log(users_slug)

  if (!users_slug) {
    return next(new ErrorHandler("No slug details Found", 404));
  }

  res.status(200).json({
    success: true,
    users_slug,
  });
});
exports.accountSetupsteps = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.user;
  const { accountSetup } = req.body; // The updated Account_setup data

  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }


    // If the user doesn't have the Account_setup field, create it
    if (!user.Account_setup) {
      user.Account_setup = accountSetup;
    } else {
      // Update the existing Account_setup array
      user.Account_setup = accountSetup;
    }


    // Save the user document with the updated Account_setup array
    await user.save();

    res.status(200).json({ message: 'Account_setup updated successfully', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

exports.CancelInvitedUser = catchAsyncErrors(async (req, res, next) => {

  const { invitedUserID } = req.body; // Expecting an array of _id values in the request body
  console.log(invitedUserID);
  const currentTime = new Date().toISOString();
  try {
    const updatedUsers = await InvitedTeamMemberModel.updateMany(
      { _id: { $in: invitedUserID } }, // Find all documents with _id in the array
      {
        $set: {
          status: "Cancelled",
          invitationExpiry: currentTime,
        }
      }
    );
    return res.json({
      message: `invited users updated successfully`,
      updatedUsers
    });
  }
  catch (error) {
    return res.status(500).json({
      error: "An error occurred while updating the invited users",
    });
  }
});

exports.getcompanies = catchAsyncErrors(async (req, res, next) => {
  const { companyID } = req.user;

  const companies = await Company.find({ _id: { $ne: companyID } }, 'company_name');

  if (!companies) {
    return next(new ErrorHandler("No companies Found", 404));
  }
  res.status(200).json({
    success: true,
    companies, // Return the selected fields
  });
});

exports.redirectUser = catchAsyncErrors(async (req, res, next) => {
  const { slug } = req.body;
  try {
    const permalink = await parmalinkSlug.findOne({ 'unique_slugs.value': slug });


    if (!permalink) {
      return res.status(404).json({ success: false, message: 'No user found' });
    }

    if (permalink.isactive) {
      const latestSlug = await parmalinkSlug
        .findOne({ user_id: permalink.redirectUserId });

      if (latestSlug) {
        return res.status(200).json({ success: true, slug: latestSlug.unique_slugs[latestSlug.unique_slugs.length - 1].value });
      } else {
        return res.status(500).json({ success: false, message: 'No user found' });
      }
    } else {
      if (permalink.unique_slugs.length === 1 || slug === permalink.unique_slugs[0].value) {
        console.log("called1");
        return res.status(200).json({ success: true, slug: permalink.unique_slugs[0].value });
      }

      if (permalink.unique_slugs.length > 1) {
        console.log("called2");
        return res.status(200).json({ success: true, slug: permalink.unique_slugs[permalink.unique_slugs.length - 1].value });
      }
    }

    console.log("called3");
    return res.status(500).json({ success: false, message: 'No user found' });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});



// exports.Testapidummy = catchAsyncErrors(async (req, res, next) => {
//   try {
//     // Define the new value you want to set for the 'keywords' field
//     const newKeywordsValue = ""; // Replace this with the desired value

//     // Update the 'keywords' field for all documents in the 'Company' collection
//     await Company.updateMany({}, { $set: { keywords: newKeywordsValue } });

//     // Return a success response
//     return res.status(200).json({ message: 'Keywords field updated successfully.' });
//   } catch (error) {
//     // Handle any errors that may occur
//     return next(error);
//   }
// });

exports.getOrders = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.user;
  console.log(id, "iddddddddddddddddddd")
  try {
    // Find orders by user ID
    const orders = await Order.find({ user: id }).populate({
      path: 'smartAccessories.productId',
      select: 'name', // Assuming 'name' is the field in the 'Product' model that contains the product name
    }).populate({
      path: 'addaddons.addonId',
      model: 'otc_addons',
    });
    console.log(orders, "orderss")
    // Create an array to store user data for each order
    const ordersWithUserData = [];

    for (const order of orders) {
      // Query the user data separately based on the user ID (assuming your User model is imported as 'User')
      const user = await User.findOne({ _id: order.user });
      const userdata = { firstName: user.first_name, lastName: user.last_name, email: user.email, contact: user.contact }
      // Add the user data to the order document
      const orderWithUserData = { ...order.toObject(), userdata };
      ordersWithUserData.push(orderWithUserData);
    }
    // console.log(ordersWithUserData,"orrrrrrrrrrrrrrrrrrr")
    res.status(200).json({ success: true, orders: ordersWithUserData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

exports.getuniqueslugbyid = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  const users_slug = await parmalinkSlug.findOne({ user_id: id });

  if (!users_slug) {
    return next(new ErrorHandler("No slug details Found", 404));
  }

  res.status(200).json({
    success: true,
    users_slug,
  });
});

exports.sharemycard_email = catchAsyncErrors(async (req, res, next) => {
  const { recipientName, recipientEmail, recipientText, UserID, frontendURL, comp_slug, useruniqueslug } = req.body.formData;
  console.log(recipientName, recipientEmail, recipientText, UserID, useruniqueslug, comp_slug, frontendURL);

  const teamlink = `${frontendURL}/${comp_slug}/${useruniqueslug}`;
  const indilink = `${frontendURL}/${useruniqueslug}`
  const link = comp_slug ? teamlink : indilink;
  console.log(link)

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
    from: '`OneTapConnect:${process.env.NODMAILER_EMAIL}`',
    to: recipientEmail,
    subject: `${recipientName} shared their digital business card.`,
    // text: 'Body of your email'
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
        <div style="background-color: #fff; padding: 20px; color: #333; font-size: 14px;">
          <h3>Hi!</h3>
          <div style="margin-top: 30px;">${recipientName} is inviting you to see their Digital Business Card.</div>
          <div style="margin-top: 30px;">You can view the card here: ${link}</div>
        </div>
        <div style="background-color: #f9f9f9; border-radius: 0 0 20px 20px; padding: 20px 15px; font-size: 14px; color: #333;">
            <div>Have a great day!</div>
            <div style="margin-top: 5px;">The OneTapConnect team</div>
        </div>
        <div style="text-align: center; margin-top: 20px;"><a href="https://onetapconnect.com/" style="text-align: center; text-decoration: none;">onetapconnect.com</a></div>
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
  transporter.sendMail(mailOptions, async function (error, info) {
    if (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to send email.' });
    } else {
      console.log('Email sent: ' + info.response);

      try {
        await ShareCardEmail.create({
          User_name: recipientName,
          recipient_email: recipientEmail,
          Text_message: recipientText,
          user_id: UserID
        });

        res.status(200).json({ message: 'Form data saved successfully. Email sent.' });
      } catch (dbError) {
        console.error('Error saving data to the database:', dbError);
        res.status(500).json({ error: 'Failed to save data to the database.' });
      }
    }
  });

  // await ShareCardEmail.create({
  //   User_name:recipientName,
  //   recipient_email:recipientEmail,
  //   Text_message:recipientText,
  //   user_id: UserID
  // })

  // res.status(200).json({ message: 'Form data saved successfully.' });
});

exports.verifyPassword = catchAsyncErrors(async (req, res, next) => {
  const { currentPassword, NewPassWord } = req.body;
  const { id } = req.user;

  const fetchedUser = await User.findById(id).select("+password");

  if (!fetchedUser) {
    return res.status(404).json({ message: 'User not found' });
  }
  const comparePassword = await fetchedUser.comparePassword(currentPassword);
  console.log(comparePassword);
  if (!comparePassword) {
    res.status(500).json({ success: false, msg: "old password is invalid" });
    return
    // send error that old password is invalid
  }

  fetchedUser.password = NewPassWord; // put new password heree

  // update password
  const updatePassword = await fetchedUser.save();
  if (!updatePassword) {
    // send error 
  }
  res.status(200).json({ success: true, msg: "password updated" });

});


exports.postshipstation = catchAsyncErrors(async (req, res, next) => {

  console.log("get req----------------------------------------------------------------------------")
  console.log(req)
  console.log("get req----------------------------------------------------------------------------")
  // console.log("called-----------------------------------------");
  const allorders = await Order.find({ type: 'smartAccessories' });
  // const allorders = await Order.find({ orderNumber: "188" });
  console.log(allorders)

  const xmlOrders = allorders.map(order => {
    const orderID = order._id;
    const odrNum = order.orderNumber;
    const odrtotalweight = order.sumTotalWeights;
    const OrderDate = order.createdAt;
    const formattedOrderDate = `${(OrderDate.getMonth() + 1).toString().padStart(2, '0')}/${OrderDate.getDate().toString().padStart(2, '0')}/${OrderDate.getFullYear()} ${OrderDate.getHours().toString().padStart(2, '0')}:${OrderDate.getMinutes().toString().padStart(2, '0')} ${OrderDate.getHours() >= 12 ? 'PM' : 'AM'}`;
    const OrderStatus = order.status;
    const LastModified = order.updatedAt;
    const formattedLastDate = `${(LastModified.getMonth() + 1).toString().padStart(2, '0')}/${LastModified.getDate().toString().padStart(2, '0')}/${LastModified.getFullYear()} ${LastModified.getHours().toString().padStart(2, '0')}:${LastModified.getMinutes().toString().padStart(2, '0')} ${LastModified.getHours() >= 12 ? 'PM' : 'AM'}`;
    const OrderTotal = order.totalAmount;
    const TaxAmount = order.tax;
    const fname = order?.shippingAddress[0]?.first_name;
    const lname = order?.shippingAddress[0]?.last_name;
    // const email = order?.shippingAddress?.email;
    const compName = order?.shippingAddress[0]?.company_name;
    const Line1 = order?.shippingAddress[0]?.line1;
    const Line2 = order?.shippingAddress[0]?.line2;
    const City = order?.shippingAddress[0]?.city;
    const state = order?.shippingAddress[0]?.state;
    const cntry = order?.shippingAddress[0]?.country;
    const Pcode = order?.shippingAddress[0]?.postal_code;

    const xmlItems = order?.smartAccessories.map(item => {
      const unitPriceFloat = parseFloat(item.price).toFixed(2);
      return `
    <Item>
      <SKU><![CDATA[FD88821]]></SKU>
      <Name><![CDATA[Sample Product]]></Name>
      <ImageUrl><![CDATA[http://www.example.com/products/98765.jpg]]></ImageUrl>
      <Weight>16</Weight>
      <WeightUnits>Ounces</WeightUnits>
      <Quantity>${item.quantity}</Quantity>
      <UnitPrice>${unitPriceFloat}</UnitPrice>
      <Location><![CDATA[C3-D4]]></Location>
      <Options>
          <Option>
            <Name><![CDATA[Size]]></Name>
            <Value><![CDATA[Medium]]></Value>
            <Weight>20</Weight>
          </Option>
          <Option>
            <Name><![CDATA[Color]]></Name>
            <Value><![CDATA[Blue]]></Value>
            <Weight>15</Weight>
          </Option>
      </Options>
    </Item>`;
    }).join('');

    return `
      <Order>
        <OrderID><![CDATA[${orderID}]]></OrderID>
        <OrderNumber><![CDATA[${odrNum}]]></OrderNumber>
        <OrderDate>${formattedOrderDate}</OrderDate>
        <OrderStatus><![CDATA[${OrderStatus}]]></OrderStatus>
        <LastModified>${formattedLastDate}</LastModified>
        <ShippingMethod><![CDATA[USPSPriorityMail]]></ShippingMethod>
        <PaymentMethod><![CDATA[Credit Card]]></PaymentMethod>
        <CurrencyCode>USD</CurrencyCode> 
        <OrderTotal>${OrderTotal}</OrderTotal>
        <TaxAmount>${TaxAmount}</TaxAmount>
        <ShippingAmount>0.00</ShippingAmount>
        <CustomerNotes></CustomerNotes>
        <InternalNotes></InternalNotes>
        <Gift>false</Gift>
        <GiftMessage></GiftMessage>
        <CustomField1></CustomField1>
        <CustomField2></CustomField2>
        <CustomField3></CustomField3>
        <Customer>
           <CustomerCode></CustomerCode>
           <BillTo>
             <Name><![CDATA[${fname}${lname}]]></Name>
             <Company><![CDATA[${compName}]]></Company>
             <Phone><![CDATA[512-555-5555]]></Phone>
             <Email><![CDATA[customer@mystore.com]]></Email>
           </BillTo>
           <ShipTo>
             <Name><![CDATA[${fname}${lname}]]></Name>
             <Company><![CDATA[${compName}]]></Company>
             <Address1><![CDATA[${Line1}]]></Address1>
             <Address2><![CDATA[${Line2}]]></Address2>
             <City><![CDATA[${City}]]></City>
             <State><![CDATA[${state}]]></State>
             <PostalCode><![CDATA[${Pcode}]]></PostalCode>
             <Country><![CDATA[${cntry}]]></Country>
             <Phone><![CDATA[512-555-5555]]></Phone>
           </ShipTo>
        </Customer>
        <Items>${xmlItems}</Items>
      </Order>`;
  }).join('');

  const xmlContent = `<?xml version="1.0" encoding="utf-8"?>
  <Orders pages="${allorders.length}">
    ${xmlOrders}
  </Orders>`;

  console.log(xmlOrders)
  res.status(200).header('Content-Type', 'application/xml').send(xmlContent);
});

exports.getchangesoforder = catchAsyncErrors(async (req, res, next) => {
  console.log("webhook call----------------------------------------------------------------------------")
  console.log(req)
  console.log("webhook call----------------------------------------------------------------------------")
  // console.log('Received ShipStation Webhook:', req.body.query);

  const trcNum = req.query.tracking_number;
  const orderNum = req.query.order_number;

  if (!trcNum) {
    return res.status(404).json({ message: 'User not found' });
  }
  const order = await Order.findOne({ orderNumber: orderNum });
  if (order) {
    await Order.updateOne({ orderNumber: orderNum }, { tracking_number: trcNum });
    return res.status(200).json({
      message: 'Tracking number updated',
      order,
    });
  } else {
    error
  }
  res.status(200).json({ message: 'Webhook received successfully' });
});
const apiKey = '4631a6eafe2e4771b4ceb4981881d1f1';

// ShipStation API endpoint for retrieving shipping rates
const ratesEndpoint = 'https://ssapi.shipstation.com/shipments/getrates';

exports.getrateoforder = catchAsyncErrors(async (req, res, next) => {
  const { shipmentData } = req.body;
  // Make API request to get rates
  axios.post(ratesEndpoint, shipmentData, {
    headers: {
      Authorization: apiKey,
    },
  })
    .then(response => {
      // Handle the response data (rates)
      console.log('Rates:', response.data);
    })
    .catch(error => {
      // Handle errors
      console.error('Errorr:', error.response.data);
    });
});

exports.sendTestData = async (req, res, next) => {
  try {
    const latestUsers = await User.find({}, 'first_name last_name email address _id, avatar')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({ success: true, data: latestUsers });
  } catch (error) {
    res.status(500).json({ success: false, msg: "Internal Server Error" });
  }
};
exports.getorderdetails = catchAsyncErrors(async (req, res, next) => {
  try {
    const { orderNumber, user } = req.body;
    // console.log(orderNumber , user,"req.body")

    if (!orderNumber || !user) {
      return res.status(400).json({ error: 'Both orderNumber and userId are required in the request body' });
    }

    // Fetch order details from the database based on order number and user ID
    const orderDetails = await Order.findOne({ orderNumber, user });

    if (!orderDetails) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Return the order details
    res.status(200).json({ orderDetails });
  } catch (error) {
    next(error); // Pass the error to the error handling middleware
  }

})

exports.getAddonsForOrderSummary = catchAsyncErrors(async (req, res, next) => {
  try {
    const { addonIds } = req.body;
    // console.log(addonIds, "add on ids");

    // Assuming you have a MongoDB model named Addon
    const addonDetails = await Adminaddonsschema.find({ _id: { $in: addonIds } });

    // console.log(addonDetails, "Details");

    if (!addonDetails || addonDetails.length === 0) {
      return res.status(404).json({ message: 'Add-on details not found' });
    }

    return res.status(200).json(addonDetails);
  } catch (error) {
    console.error('Error fetching add-on details:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

exports.cardEditorData = catchAsyncErrors(async (req, res, next) => {
  try {
    const data = {
      "/": {
        content: [
          {
            type: "Hero",
            props: {
              title: "This page was built with Puck",
              description:
                "Puck is the self-hosted visual editor for React. Bring your own components and make site changes instantly, without a deploy.",
              buttons: [
                {
                  label: "Visit GitHub",
                  href: "https://github.com/measuredco/puck",
                },
                { label: "Edit this page", href: "/edit", variant: "secondary" },
              ],
              id: "Hero-1687283596554",
              height: "",
              image: {
                url: "https://images.unsplash.com/photo-1687204209659-3bded6aecd79?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2670&q=80",
                mode: "inline",
              },
              padding: "128px",
              align: "left",
            },
          },
          {
            type: "VerticalSpace",
            props: { size: "96px", id: "VerticalSpace-1687298109536" },
          },
          {
            type: "Heading",
            props: {
              align: "center",
              level: "2",
              text: "Drag-and-drop your own React components",
              padding: "0px",
              size: "xxl",
              id: "Heading-1687297593514",
            },
          },
          {
            type: "VerticalSpace",
            props: { size: "8px", id: "VerticalSpace-1687284122744" },
          },
          {
            type: "Text",
            props: {
              align: "center",
              text: "Configure Puck with your own components to make change for your marketing pages without a developer.",
              padding: "0px",
              size: "m",
              id: "Text-1687297621556",
              color: "muted",
            },
          },
          {
            type: "VerticalSpace",
            props: { size: "40px", id: "VerticalSpace-1687296179388" },
          },
          {
            type: "Columns",
            props: {
              columns: [{}, {}, {}],
              distribution: "auto",
              id: "Columns-2d650a8ceb081a2c04f3a2d17a7703ca6efb0d06",
            },
          },
          {
            type: "VerticalSpace",
            props: { size: "96px", id: "VerticalSpace-1687287070296" },
          },
          {
            type: "VerticalSpace",
            props: { size: "96px", id: "VerticalSpace-1687298110602" },
          },
          {
            type: "Heading",
            props: {
              align: "center",
              level: 2,
              text: "The numbers",
              padding: "0px",
              size: "xxl",
              id: "Heading-1687296574110",
            },
          },
          {
            type: "VerticalSpace",
            props: { size: "16px", id: "VerticalSpace-1687284283005" },
          },
          {
            type: "Text",
            props: {
              align: "center",
              text: 'This page demonstrates Puck configured with a custom component library. This component is called "Stats", and contains some made-up numbers. You can configure any page by adding "/edit" onto the URL.',
              padding: "0px",
              size: "m",
              id: "Text-1687284565722",
              color: "muted",
              maxWidth: "916px",
            },
          },
          {
            type: "VerticalSpace",
            props: { size: "96px", id: "VerticalSpace-1687297618253" },
          },
          {
            type: "Stats",
            props: {
              items: [
                { title: "Users reached", description: "20M+", icon: "Feather" },
                { title: "Cost savings", description: "$1.5M", icon: "Feather" },
                { title: "Another stat", description: "5M kg", icon: "Feather" },
                { title: "Final fake stat", description: "15K", icon: "Feather" },
              ],
              mode: "flat",
              id: "Stats-1687297239724",
            },
          },
          {
            type: "VerticalSpace",
            props: { size: "120px", id: "VerticalSpace-1687297589663" },
          },
          {
            type: "Heading",
            props: {
              align: "center",
              level: 2,
              text: "Extending Puck",
              padding: "0px",
              size: "xxl",
              id: "Heading-1687296184321",
            },
          },
          {
            type: "VerticalSpace",
            props: { size: "8px", id: "VerticalSpace-1687296602860" },
          },
          {
            type: "Text",
            props: {
              align: "center",
              text: "Puck can also be extended with plugins and headless CMS content fields, transforming Puck into the perfect tool for your Content Ops.",
              padding: "0px",
              size: "m",
              id: "Text-1687296579834",
              color: "muted",
              maxWidth: "916px",
            },
          },
          {
            type: "VerticalSpace",
            props: { size: "96px", id: "VerticalSpace-1687299311382" },
          },
          {
            type: "Columns",
            props: {
              columns: [
                { span: 4 },
                { span: 4 },
                { span: 4 },
                { span: 4 },
                { span: 4 },
                { span: 4 },
              ],
              id: "Columns-3c2ca5b045ee26535fcdf0eddf409a6308764634",
              distribution: "manual",
            },
          },
          {
            type: "VerticalSpace",
            props: { size: "96px", id: "VerticalSpace-1687299315421" },
          },
          {
            type: "Heading",
            props: {
              align: "center",
              level: 2,
              text: "Get started",
              padding: "0px",
              size: "xxl",
              id: "Heading-1687299303766",
            },
          },
          {
            type: "VerticalSpace",
            props: { size: "16px", id: "VerticalSpace-1687299318902" },
          },
          {
            type: "Text",
            props: {
              align: "center",
              text: "Browse the Puck GitHub to get started, or try editing this page",
              padding: "0px",
              size: "m",
              id: "Text-1687299305686",
              color: "muted",
            },
          },
          {
            type: "VerticalSpace",
            props: { size: "24px", id: "VerticalSpace-1687299335149" },
          },
          {
            type: "ButtonGroup",
            props: {
              buttons: [
                {
                  label: "Visit GitHub",
                  href: "https://github.com/measuredco/puck",
                },
                { label: "Edit this page", href: "/edit", variant: "secondary" },
              ],
              id: "ButtonGroup-1687299235545",
              align: "center",
            },
          },
          {
            type: "VerticalSpace",
            props: { size: "96px", id: "VerticalSpace-1687284290127" },
          },
        ],
        root: { props: { title: "Puck Example" } },
        zones: {
          "Columns-2d650a8ceb081a2c04f3a2d17a7703ca6efb0d06:column-0": [
            {
              type: "Card",
              props: {
                title: "Built for content teams",
                description:
                  "Puck enables content teams to make changes to their content without a developer or breaking the UI.",
                icon: "PenTool",
                mode: "flat",
                id: "Card-0d9077e00e0ad66c34c62ab6986967e1ce04f9e4",
              },
            },
          ],
          "Columns-2d650a8ceb081a2c04f3a2d17a7703ca6efb0d06:column-1": [
            {
              type: "Card",
              props: {
                title: "Easy to integrate",
                description:
                  "Front-end developers can easily integrate their own components using a familiar React API.",
                icon: "GitMerge",
                mode: "flat",
                id: "Card-978bef5d136d4b0d9855f5272429986ceb22e5a6",
              },
            },
          ],
          "Columns-2d650a8ceb081a2c04f3a2d17a7703ca6efb0d06:column-2": [
            {
              type: "Card",
              props: {
                title: "No vendor lock-in",
                description:
                  "Completely open-source, Puck is designed to be integrated into your existing React application.",
                icon: "GitHub",
                mode: "flat",
                id: "Card-133a61826f0019841aec6f0aec011bf07e6bc6de",
              },
            },
          ],
          "Columns-3c2ca5b045ee26535fcdf0eddf409a6308764634:column-0": [
            {
              type: "Card",
              props: {
                title: "plugin-heading-analyzer",
                description:
                  "Analyze the document structure and identify WCAG 2.1 issues with your heading hierarchy.",
                icon: "AlignLeft",
                mode: "card",
                id: "Card-e2e757b0b4a579d5f87564dfa9b4442f9794b45b",
              },
            },
          ],
          "Columns-3c2ca5b045ee26535fcdf0eddf409a6308764634:column-1": [
            {
              type: "Card",
              props: {
                title: "External data",
                description:
                  "Connect your components with an existing data source, like Strapi.js.",
                icon: "Feather",
                mode: "card",
                id: "Card-4eea28543d13c41c30934c3e4c4c95a75017a89c",
              },
            },
          ],
          "Columns-3c2ca5b045ee26535fcdf0eddf409a6308764634:column-2": [
            {
              type: "Card",
              props: {
                title: "Custom plugins",
                description:
                  "Create your own plugin to extend Puck for your use case using React.",
                icon: "Feather",
                mode: "card",
                id: "Card-3314e8b24aa52843ce22ab7424b8f3b8064acfdf",
              },
            },
          ],
          "Columns-3c2ca5b045ee26535fcdf0eddf409a6308764634:column-3": [
            {
              type: "Card",
              props: {
                title: "Title",
                description: "Description",
                icon: "Feather",
                mode: "card",
                id: "Card-49b11940784cfe8dc1a2b2facc5ac2bcf797792f",
              },
            },
          ],
          "Columns-3c2ca5b045ee26535fcdf0eddf409a6308764634:column-4": [
            {
              type: "Card",
              props: {
                title: "Title",
                description: "Description",
                icon: "Feather",
                mode: "card",
                id: "Card-efb0a1ed06cc4152a7861376aafbe62b0445382d",
              },
            },
          ],
          "Columns-3c2ca5b045ee26535fcdf0eddf409a6308764634:column-5": [
            {
              type: "Card",
              props: {
                title: "Title",
                description: "Description",
                icon: "Feather",
                mode: "card",
                id: "Card-513cfb17d07ba4b6e0212d931571c0760839f029",
              },
            },
          ],
        },
      },
      "/pricing": {
        content: [],
        root: { props: { title: "Pricing" } },
      },
      "/about": {
        content: [],
        root: { props: { title: "About Us" } },
      },
    };
    res.send(data)
    return
  } catch (error) {
    console.error('Error :', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});



exports.verifydeactivateAccountotp = catchAsyncErrors(async (req, res, next) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email: email });
  const storedotp = user.otptoken;
  const userid = user._id;
  const userinfo = await UserInformation.findOne({ user_id: userid })
  const user_subscription_id = userinfo.subscription_details.subscription_id
  // console.log(user_subscription_id)
  const companyid = user.companyID;
  try {
    const decodedToken = jwt.verify(storedotp, process.env.JWT_SECRET);
    const userotp = decodedToken.otp;
    // console.log(userotp, "!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
    if (otp === userotp) {
      console.log('verified')
      const updatedUser = await User.updateOne(
        { _id: userid },
        {
          $set: { Account_status: 'is_Deactivated' },
          otptoken: null,
        },
        { new: true }
      );
      const companyUsers = await User.updateMany(
        {
          companyID: companyid,
          role: { $in: ["administrator", "teammember", "manager"] },
          status: { $in: ['active'] }
        },
        {
          $set: { status: 'Deactivate', Account_status: 'is_Deactivated' },
        },
      );
      if (companyUsers.nModified === 0) {
        console.log('No matching users found for companyUsers update.');
      }
      if (!updatedUser) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      return res.status(200).json({ success: true, message: 'OTP verified', user_subscription_id });
    } else {
      return res.status(400).json({ success: false, message: 'Incorrect OTP' });
    }
  } catch (error) {
    console.log(error);
  }
});
exports.assignSmartAccessroiesToUser = catchAsyncErrors(async (req, res, next) => {
  try {
    const { userId, uniqueIds } = req.body;

    // Update the userId for multiple uniqueIds
    const updatedAccessories = await SmartAccessoriesModal.updateMany(
      { uniqueId: { $in: uniqueIds } },
      { $set: { userId: userId } },
      { new: true }
    );

    if (!updatedAccessories) {
      return res.status(404).json({ message: "Accessories not found" });
    }

    // Return the updated accessories details
    res.status(200).json({ updatedAccessories, success: true });
  } catch (error) {
    next(error);
  }
});


exports.updateSmartAccessoryStatus = catchAsyncErrors(async (req, res, next) => {
  try {
    const { Ids, status } = req.body;

    // Update the status for the specified uniqueIds
    const updatedAccessories = await SmartAccessoriesModal.updateMany(
      { _id: { $in: Ids } },
      { $set: { status: status } },
      { new: true }
    );

    if (!updatedAccessories) {
      return res.status(404).json({ message: "Accessories not found" });
    }

    // Return the updated accessories details
    res.status(200).json({ updatedAccessories, success: true });
  } catch (error) {
    next(error);
  }
});

exports.removeUserFromSmartAccessories = catchAsyncErrors(async (req, res, next) => {
  try {
    const { uniqueIds } = req.body;
    // Convert uniqueIds to ObjectId array
    // const objectIdArray = uniqueIds.map(id => mongoose.Types.ObjectId(id));

    // Remove the userId field for the specified uniqueIds
    const removedUserAccessories = await SmartAccessoriesModal.updateMany(
      { _id: { $in: uniqueIds } },
      { $unset: { userId: 1 } },
      { new: true }
    );
    if (!removedUserAccessories) {
      return res.status(404).json({ message: "Accessories not found" });
    }
    res.status(200).json({ removedUserAccessories, success: true });
  } catch (error) {
    next(error);
  }
});



// exports.assignSmartAccessroiesToUser = catchAsyncErrors(async(req,res,next)=>{
//   try {
//     const { userId, uniqueId , companyId } = req.body;
//     // const { companyID } = req.user;

//     // Update the userId in the smartAccessories array based on the uniqueId
//     const updatedCompany = await Company.findOneAndUpdate(
//       { _id: companyId, "smartAccessories.uniqueId": uniqueId },
//       { $set: { "smartAccessories.$.userId": userId } },
//       { new: true }
//     );

//     if (!updatedCompany) {
//       // If the company with the specified ID or uniqueId is not found
//       return res.status(404).json({ message: "Company not found" });
//     }

//     // Return the updated company details
//     res.status(200).json({ updatedCompany });
//   } catch (error) {
//     next(error); // Pass the error to the error handling middleware
//   }
// });

exports.getUserAssignSmartAccessoriesForCompany = catchAsyncErrors(async (req, res, next) => {
  try {
    // Assuming you want to get smartAccessories based on company ID
    // const { companyID } = req.user;

    const SmartAccessorie = await SmartAccessoriesModal.find()
      .populate({
        path: 'userId',
        select: 'first_name last_name email designation',
      })
      .populate('productId');


    if (!SmartAccessorie) {
      return res.status(404).json({ message: 'SmartAccessorie does not have a data' });
    }

    const smartAccessories = SmartAccessorie.filter(sa => sa.userId !== undefined);
    const smartAccessorieswithoutUserId = SmartAccessorie.map(e => e);
    // const companyName = company.company_name

    res.status(200).json({ smartAccessories, smartAccessorieswithoutUserId, AllSmartAccessories: SmartAccessorie });
  } catch (error) {
    next(error); // Pass the error to the error handling middleware
  }
});

exports.getuniqueslug = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.body

  console.log(id);
  const users_slug = await parmalinkSlug.find({ user_id: id });
  console.log(users_slug)

  if (!users_slug) {
    return next(new ErrorHandler("No slug details Found", 404));
  }

  res.status(200).json({
    success: true,
    users_slug,
  });
})

