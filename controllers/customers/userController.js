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
const User = require("../../models/Customers/UserModel.js");
const Company = require("../../models/Customers/CompanyModel.js");
const { processPayment } = require("../paymentController/paymentcontroller.js");
const multer = require("multer");
const path = require("path");
const sharp = require("sharp");
const fs = require("fs");
const InvitedTeamMemberModel = require("../../models/Customers/InvitedTeamMemberModel.js");
const CompanyShareReferralModel = require("../../models/Customers/Company_Share_Referral_DataModel");
const Cards = require("../../models/Customers/CardsModel.js");
const generatePassword = require("../../utils/passwordGenerator.js");
const billingAddress = require("../../models/Customers/BillingAddressModal.js")
const shippingAddress = require("../../models/Customers/ShippingAddressModal.js")
// const logo = require('../../uploads/logo/logo_black.svg')

dotenv.config();

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

  const message = {
    from: process.env.NODMAILER_EMAIL,
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
    <div style="background-color: #000; border-radius: 20px 20px 0 0; padding: 20px 15px; text-align: center;">
      <img src="${process.env.FRONTEND_URL}/static/media/logo_black.c86b89fa53055b765e09537ae9e94687.svg">

    </div>
    <div style="background-color: #fff; border-radius: 0 0 20px 20px; padding: 20px; color: #333; font-size: 14px;">
        <div style="font-weight: bold; text-align: center;">Email verification</div>
        <p>Please click the “Verify email” button below to continue with the setup of your OneTapConnect account.</p>
        <p>If you believe you received the email by mistake, you may disregard this email, or contact our support team for any information.</p>
        <div class="main-div-" style="display:block; margin-top: 25px; width:50%; juatify-content:center;  text-align: center;">
            <div style="flex: 1; border-radius: 4px; overflow: hidden; background-color: #e65925;">
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
  console.log("google", googleId);

  const decodedData = jwt.verify(token, process.env.JWT_SECRET);
  const email = decodedData.email;
  let user;
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
  if (!user) {
    return next(
      new ErrorHandler("Something went wrong please try again.", 400)
    );
  }

  const trimedString = company_name.replace(/\s/g, "").toLowerCase();

  const company = await Company.find();

  // checking if compnay already exists
  company.map((item) => {
    if (item.company_name.replace(/\s/g, "").toLowerCase() === trimedString) {
      console.log(item.company_name);
      return next(new ErrorHandler("Company Already Exists. ", 400));
    }
  });

  const newCompany = await Company.create({
    primary_account: user._id,
    primary_manager: user._id,
    primary_billing: user._id,
    company_name,
    industry,
    contact,
    team_size,
  });

  user.companyID = newCompany._id;
  user.isVerfied = true;
  const companySettingSchema = await CompanyShareReferralModel.create({
    companyID: newCompany._id,
  });
  await user.save({ validateBeforeSave: true });

  // res.status(200).json({
  //   message: "user saved successfully",
  //   user
  // })

  sendToken(user, 200, res);
});

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

  console.log(req.body);

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

  // res.send(payload)
  sendToken(user, 200, res);
});

//login user
exports.login = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;
  console.log(email, password);
  // checking if user has given password and email both

  if (!email || !password) {
    return next(new ErrorHandler("Please Enter Email & Password", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorHandler("User does not found. ", 401));
  }

  // Check if the user signed up with Google
  if (user.googleId !== null) {
    return next(
      new ErrorHandler("User signed up with Google. Use Google login.", 400)
    );
  }

  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    console.log("2");
    return next(new ErrorHandler("Please enter valid password.", 401));
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
//     from: "manish.syndell@gmail.com",
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

    await user.save({ validateBeforeSave: false });

    const message = {
      from: "manish.syndell@gmail.com",
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
    <div style="background-color: #000; border-radius: 20px 20px 0 0; padding: 20px 15px; text-align: center;">
      <img src="https://onetapconnect.sincprojects.com/static/media/logo_black.c86b89fa53055b765e09537ae9e94687.svg">

    </div>
    <div style="background-color: #fff; border-radius: 0 0 20px 20px; padding: 20px; color: #333; font-size: 14px;">
      <!-- <div><img src="https://onetapconnect.com/wp-content/uploads/2023/05/OneTapConnect-logo-2023.png" width="150px"/></div> -->
      <h3>Dear User</h3>
      <p>We received a request to reset the password associated with your account. If you did not initiate this request, please disregard this email.</p>

      <p>To reset your password, please click the link below:</p>
      <a href="${process.env.FRONTEND_URL}/reset-password/${resetToken}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>

      <p>If you're having trouble clicking the link, you can copy and paste the following URL into your browser's address bar:</p>

      <p>Please note that this link is valid for the next 24 hours. After that, you will need to request another password reset.</p>

      <p>If you have any questions or need further assistance, please contact our support team at <a href="mailto:admin@onetapconnect.com">admin@onetapconnect.com</a>.</p>

      <p>Best regards,<br>The One Tap Connect Team</p>
    </div>

</body>

</html>
      `,
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
  //creating token hash
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  console.log(user);
  console.log(req.body);

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
  const users = await User.find({ companyID });
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

    if (invitedusers.length === 0) {
      return next(new ErrorHandler("No invited users found", 404));
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
  console.log(user.companyID, req.user.companyID);
  if (user.companyID.toString() !== req.user.companyID.toString()) {
    return next(
      new ErrorHandler("You are not authorized to access this route", 401)
    );
  }

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

// invite team member
exports.inviteTeamMember = catchAsyncErrors(async (req, res, next) => {
  const { memberData } = req.body;
  const { companyID } = req.user;

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

    if (!email || !first_name || !last_name || !team) {
      if (!email) {
        return next(new ErrorHandler("Please Enter Email", 400));
      }
      if (!first_name) {
        return next(new ErrorHandler("Please Enter First Name", 400));
      }
      if (!last_name) {
        return next(new ErrorHandler("Please Enter Last Name", 400));
      }
      if (!team) {
        return next(new ErrorHandler("Please Enter Team", 400));
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

    let invitationToken = crypto.randomBytes(20).toString("hex");

    const currentDate = new Date();

    // Calculate the expiry date by adding 10 days
    const expiryDate = new Date(currentDate);
    expiryDate.setDate(currentDate.getDate() + 10);

    // Convert the expiry date to ISO string format
    // const expiryDateString = expiryDate.toISOString();

    const message = {
      from: "manish.syndell@gmail.com",
      to: email,
      subject: `${company.company_name} Invited you to join OneTapConnect`,
      //   html: `
      //  <div>
      //  <div><img src="https://onetapconnect.com/wp-content/uploads/2023/05/OneTapConnect-logo-2023.png" width="150px"/></div>
      //  <h3>Welcome to OneTapConnect!</h3>
      //  <p>Hi ${first_name}<br/>
      //  You’ve been invited by ${company.company_name} to join OneTapConnect. Please click the link below to complete your account setup and start using your new digital business card.</p>
      //  <div><button>Accept invitation</button><button>Reject</button></div>
      //  <p>If you have any question about this invitation, please contact your company account manager [account_manager_name] at [account_manager_name_email].</p>
      //  <h5>Technical issue?</h5>
      //  <p>In case you facing any technical issue, please contact our support team <a href="https://onetapconnect.com/contact-sales/">here</a>.</p>
      //  <a></a>
      //  </div>
      // `

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
          <img src="https://onetapconnect.sincprojects.com/static/media/logo_black.c86b89fa53055b765e09537ae9e94687.svg">
          
          </div>
          <div style="background-color: #fff; border-radius: 0 0 20px 20px; padding: 20px; color: #333; font-size: 14px;">
          <!-- <div><img src="https://onetapconnect.com/wp-content/uploads/2023/05/OneTapConnect-logo-2023.png" width="150px"/></div> -->
          <h3>Welcome to OneTapConnect!</h3>
          <p>Hi ${first_name}<br/>
          You’ve been invited by ${company.company_name} to join OneTapConnect. Please click the link below to complete your account setup and start using your new digital business card.</p>
          <!-- <div><button>Accept invitation</button><button>Reject</button></div> -->
          <div style="display: flex; justify-content: space-evenly; gap: 25px; margin-top: 25px;">
            <div style="flex: 1; border-radius: 4px; overflow: hidden; background-color: #e65925;">
                <a href="${process.env.FRONTEND_URL}/sign-up/${invitationToken}" style="display: inline-block; width: 83%; padding: 10px 20px; font-weight: 600; color: #fff; text-align: center; text-decoration: none;">Accept invitation</a>
            </div>
            <div style="flex: 1; border: 1px solid #333; border-radius: 4px; overflow: hidden">
                <a href="${process.env.FRONTEND_URL}/email-invitations/${invitationToken}" style="display: inline-block; width: 79%; padding: 10px 20px; font-weight: 600; color: #fff; text-align: center; text-decoration: none; color:black;">Reject</a>
            </div>
        </div>
          <p>If you have any question about this invitation, please contact your company account manager [account_manager_name] at [account_manager_name_email].</p>
          <h5>Technical issue?</h5>
          <p>In case you facing any technical issue, please contact our support team <a href="https://onetapconnect.com/contact-sales/">here</a>.</p>
      </div>
  
  </body>
  
  </html>
  
  
`,
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

  const company = await Company.findById(companyID);
  const userInfo = await User.findById(id);

  for (const userData of CSVMemberData) {
    const password = generatePassword();
    const { email, firstName, lastName, team } = userData;
    console.log(userData);

    if (!email || !firstName || !lastName || !team) {
      return next(new ErrorHandler("Please fill out all user details", 400));
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      return next(new ErrorHandler("Please enter a valid email", 400));
    }

    const message = {
      from: "mailto:manish.syndell@gmail.com",
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
            <img src="https://onetapconnect.sincprojects.com/static/media/logo_black.c86b89fa53055b765e09537ae9e94687.svg">
            
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
    };

    transporter.sendMail(message, (err, info) => {
      if (err) {
        console.log(`Error sending email to ${email}: ${err}`);
      } else {
        console.log(`Email sent to ${email}: ${info.response}`);
      }
    });

    await User.create({
      email: email,
      first_name: firstName,
      last_name: lastName,
      team: team,
      companyID: companyID,
      password: password,
    });
  }

  res.status(201).json({
    success: true,
    message: "Invitaion Email sent Successfully",
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

  card.save();

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

  console.log(cards);

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

  res.status(201).json({
    success: true,
    message: "Card Updated successfully",
  });
});

//update billing address

exports.updateBillingAddress = catchAsyncErrors(async (req, res, next) => {
  const { id, companyID } = req.user;
  const { firstName, lastName, company_name, billing_address } = req.body;

  const BillingAddressData = {
    first_name: firstName,
    last_name: lastName,
    billing_address: billing_address,
  };

  const updateBilling = await User.findByIdAndUpdate(id, BillingAddressData);

  const updateCompany = await Company.findByIdAndUpdate(companyID, {
    "company_name": company_name,
  });

  await updateBilling.save();
  await updateCompany.save();

  res.status(201).json({
    success: true,
    message: "User Billing Address and Company Name Updated Successfully",
  });
});

// for Create new Team and update User Team
exports.updateTeamName = catchAsyncErrors(async (req, res, next) => {
  const { selectedUsers, teamName } = req.body;

  // Loop through the array of selected user IDs
  for (const userId of selectedUsers) {
    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ message: `User not found with ID: ${userId}` });
    }

    // Update the user's team with the new team name
    user.team = teamName;
    await user.save(); // Save the changes to the user
  }

  res.status(200).json({ message: "Users updated successfully" });
});

// Create new Team
exports.createNewTeam = catchAsyncErrors(async (req, res, next) => {
  const companyID = req.user.companyID;
  console.log(companyID);
  const { teamName } = req.body;

  const company = await Company.findOne(companyID).populate("primary_account"); // Replace with proper query

  if (!company) {
    return res.status(404).json({ message: "Company not found" });
  }

  if (company.teams.includes(teamName)) {
    return res.status(400).json({ message: "This team already exists" });
  }

  company.teams.push(teamName);
  await company.save();

  res.status(201).json({ message: "Team created successfully", company });
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

    user.team = ""; // Remove the team association
    await user.save();
  }

  res.status(200).json({ message: "Team removed from users successfully" });
});

// rename teams name
exports.renameTeam = catchAsyncErrors(async (req, res, next) => {
  const companyID = req.user.companyID; // Assuming you have this value available
  const { oldTeamName, newTeamName } = req.body;

  // Find the company
  const company = await Company.findById(companyID);
  if (!company) {
    return res.status(404).json({ message: "Company not found" });
  }

  // Find the team index in the company's teams array
  const teamIndex = company.teams.findIndex(
    (team) =>
      team.localeCompare(oldTeamName, undefined, { sensitivity: "base" }) === 0
  );

  if (teamIndex === -1) {
    return res.status(400).json({ message: "Team not found in company" });
  }

  const isExistingTeam = company.teams.some(
    (team) =>
      team.localeCompare(newTeamName, undefined, { sensitivity: "base" }) === 0
  );

  if (isExistingTeam) {
    return res.status(400).json({ message: "New team name already exists" });
  }

  // Update team name in company's teams array
  const oldTeam = company.teams[teamIndex];
  company.teams[teamIndex] = newTeamName;
  await company.save();

  // Update user's team name
  const usersToUpdate = await User.find({ team: oldTeam }); // Find users belonging to the old team
  for (const user of usersToUpdate) {
    user.team = newTeamName;
    await user.save();
  }

  res.status(200).json({ message: "Team renamed successfully", company });
});

// delete team
exports.deleteTeam = catchAsyncErrors(async (req, res, next) => {
  const companyID = req.user.companyID; // Assuming you have this value available
  const { teamname } = req.body;

  // Find the company
  const company = await Company.findById(companyID);
  if (!company) {
    return res.status(404).json({ message: "Company not found" });
  }

  // Find the team index in the company's teams array
  const teamIndex = company.teams.indexOf(teamname);
  if (teamIndex === -1) {
    return res.status(400).json({ message: "Team not found in company" });
  }

  // Remove team from the company's teams array
  const deletedTeam = company.teams.splice(teamIndex, 1)[0];
  await company.save();

  // Find users belonging to the deleted team
  const usersToDelete = await User.find({ team: deletedTeam });

  // Remove the team association from the users
  for (const user of usersToDelete) {
    user.team = "";
    await user.save();
  }

  res.status(200).json({ message: "Team deleted successfully", company });
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
  const updatedUserDetails = req.body; // Assuming the updated details are provided in the request body

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
    user.set(updatedUserDetails);
    await user.save();

    res.status(200).json({
      success: true,
      message: "User details updated successfully",
      user: user,
    });
  } catch (error) {
    next(error);
  }
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

exports.checkcompanyurlslugavailiblity = catchAsyncErrors(
  async (req, res, next) => {
    const { companyurlslug } = req.body;

    console.log(companyurlslug);
    const existingcompanyurlslug = await Company.findOne({ companyurlslug });
    if (existingcompanyurlslug) {
      return res
        .status(400)
        .json({ message: "companyurlslug is already taken." });
    }

    // Check case-sensitive duplicates
    const caseSensitivecompanyurlslug = await Company.findOne({
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

exports.updateCompanySlug = catchAsyncErrors(async (req, res, next) => {
  const {
    companyId,
    companyurlslug,
    company_url_edit_permission,
    user_profile_edit_permission,
  } = req.body; // Assuming you send companyId and companyurlslug from your React frontend
  console.log(companyurlslug);
  console.log(companyId);
  console.log(company_url_edit_permission);
  try {
    const updatedCompany = await Company.findByIdAndUpdate(companyId, {
      companyurlslug: companyurlslug,
      company_url_edit_permission: company_url_edit_permission,
      user_profile_edit_permission: user_profile_edit_permission,
    });

    if (!updatedCompany) {
      return res.status(404).json({ error: "Company not found" });
    }

    res.json({ message: "Company slug updated successfully", updatedCompany });
  } catch (error) {
    console.error("Error updating company slug:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//checkout handler
exports.checkoutHandler = catchAsyncErrors(async (req, res, next) => {
  const { id, companyID } = req.user;
  const { userData, planData, cardDetails, shipping_method } = req.body;

  const cardData = {
    cardNumber: cardDetails.cardNumber,
    brand: cardDetails.brand,
    nameOnCard: cardDetails.cardName,
    cardExpiryMonth: cardDetails.cardExpiryMonth,
    cardExpiryYear: cardDetails.cardExpiryYear,
    // CVV: cardDetails.cardCVV
  };

  console.log(cardData);

  const user = await User.findById(id);
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  const card = await Cards.create(cardData);
  card.userID = id;

  user.isPaidUser = true;
  user.first_name = userData.first_name;
  user.first_last = userData.first_last;
  user.address = userData.billing_address;
  user.billing_address = userData.billing_address;
  user.shipping_address = userData.shipping_address;
  user.subscription_details = planData;
  user.subscription_details.auto_renewal = true;
  user.shipping_method = shipping_method;

  const company = await Company.findById(companyID);
  company.address = userData.billing_address;

  await user.save();
  await card.save();
  await company.save();

  res.status(200).json({
    success: true,
  });
});

exports.updateAutoRenewal = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.user;
  const user = await User.findById(id);
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  user.subscription_details.auto_renewal = false;

  await user.save();

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
  const { id } = req.params;
  try {
    // Use async/await for better error handling and readability
    // const userId = req.user.id;
    // Check if the user already has an avatar path
    const removeuser = await User.findById(id);
    const oldAvatarPath = removeuser.avatar;

    upload.single("profilePicture")(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: "File upload failed." });
      }

      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded." });
      }

        const profilePicturePath = req.file.filename;

        // Delete the old profile picture if it exists
        if (oldAvatarPath) {
          // Remove the old profile picture file from the storage folder
          fs.unlink(`./uploads/profileImages/${oldAvatarPath}`, (unlinkErr) => {
            if (unlinkErr) {
              console.error("Error deleting old profile picture:", unlinkErr);
            }
          });

          // Remove the old avatar path from the user document in the database
          await User.findByIdAndUpdate(id, { avatar: null });
        }

        const user = await User.findByIdAndUpdate(
          id,
          { avatar: profilePicturePath }, // Update the 'avatar' field
          { new: true }
        );

        if (!user) {
          return res.status(404).json({ error: "User not found." });
        }

        return res.status(200).json({
          success: true,
          message: "Profile picture uploaded successfully.",
          user,
        });
      });
  } catch (error) {
    console.error("Error updating profile picture:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};

//Logo  update API
// multer image upload
const logostorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/logo");
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

// Modify the route handler to include the checkLogoSize middleware
exports.uploadLogo = async (req, res) => {
  try {
    // Use async/await for better error handling and readability
    const { companyID } = req.user;
    // console.log("object", req.user)
    // Check if the company already has a logo path
    const company = await Company.findById(companyID);
    console.log(company)
    const oldLogoPath = company.logopath;

    logoupload.single("logoimage")(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: "File upload failed." });
      }

      // Add the checkLogoSize middleware here
      checkLogoSize(req, res, async () => {
        const logoPicturePath = req.file.filename;

        // Delete the old logo file if it exists
        if (oldLogoPath) {
          // Remove the old logo file from the storage folder
          fs.unlink(`./uploads/logo/${oldLogoPath}`, (unlinkErr) => {
            if (unlinkErr) {
              console.error("Error deleting old logo:", unlinkErr);
            }
          });
        }

        const updatedCompany = await Company.findByIdAndUpdate(
          companyID,
          { logopath: logoPicturePath },
          { new: true }
        );

        if (!updatedCompany) {
          return res.status(404).json({ error: "Company not found." });
        }

        return res.status(200).json({
          success: true,
          message: "Logo uploaded successfully.",
          updatedCompany,
        });
      });
    });
  } catch (error) {
    console.error("Error updating Logo:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};

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
    // Use async/await for better error handling and readability
    const { companyID } = req.user;

    // Check if the company already has a favicon path
    const company = await Company.findById(companyID);
    const oldfaviconPath = company.fav_icon_path;

    faviconupload.single("faviconimage")(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: "File upload failed." });
      }

      // Add the checkLogoSize middleware here
      checkFaviconSize(req, res, async () => {
        const faviconPicturePath = req.file.filename;

        // Delete the old favicon file if it exists
        if (oldfaviconPath) {
          // Remove the old favicon file from the storage folder
          fs.unlink(`./uploads/favicon/${oldfaviconPath}`, (unlinkErr) => {
            if (unlinkErr) {
              console.error("Error deleting old favicon:", unlinkErr);
            }
          });
        }
        const updatedCompany = await Company.findByIdAndUpdate(
          companyID,
          { fav_icon_path: faviconPicturePath },
          { new: true }
        );

        if (!updatedCompany) {
          return res.status(404).json({ error: "Company not found." });
        }

        return res.status(200).json({
          success: true,
          message: "favicon uploaded successfully.",
          updatedCompany,
        });
      });
    });
  } catch (error) {
    console.error("Error updating favicon:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};

exports.getcompanies_share_referral_datas = catchAsyncErrors(
  async (req, res, next) => {
    const { companyID } = req.user;
    console.log(companyID);
    const companies_share_referral_datas =
      await CompanyShareReferralModel.findOne({ companyID: companyID });
    if (!companies_share_referral_datas) {
      return next(new ErrorHandler("No data Found", 404));
    }

    res.status(200).json({
      success: true,
      companies_share_referral_datas,
    });
  }
);

exports.updatecompany_referral_data = catchAsyncErrors(
  async (req, res, next) => {
    const { companyID } = req.user;
    const updatedCompanyReferralData = req.body;
    console.log(companyID);
    console.log(updatedCompanyReferralData);

    const updatecompany = await CompanyShareReferralModel.findOne({
      companyID: companyID,
    });

    if (!updatecompany) {
      return next(new ErrorHandler("company share details not found", 404));
    }

    updatecompany.set(updatedCompanyReferralData);
    await updatecompany.save();

    res.status(200).json({
      updatedCompanyReferralData,
    });
  }
);

// Add Shipping Address
exports.createShippingAddress = catchAsyncErrors(async (req, res, next) => {
  const {
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

  const { id, companyID } = req.user;

  const user = await User.findById(id);

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  const shippingAddressData = {
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
      companyId: companyID,
      shipping_address: [shippingAddressData],
    });
  } else {
    shippingAddressFind.shipping_address.push(shippingAddressData);
  }

  try {
    await shippingAddressFind.save();

    res.status(201).json({
      success: true,
      message: 'Shipping address added successfully',
      shippingAddressData,
    });
  } catch (error) {
    return next(new ErrorHandler('Error saving shipping address', 500));
  }
});


exports.getAllShippingAddress = catchAsyncErrors(async (req,res,next)=> {
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
    return next(new ErrorHandler('Unable to fetch shipping addresses', 500));
  }
})

exports.removeShippingAddress = catchAsyncErrors(async(req,res, next)=> {
  const { id } = req.user;
  const { addressId } = req.params;
  console.log(addressId, " address id")

  try {
    const userShippingAddress = await shippingAddress.findOne({ userId: id });
    console.log(userShippingAddress, "userShippingAddress")

    if (!userShippingAddress) {
      return next(new ErrorHandler('User shipping address not found', 404));
    }

    const { shipping_address } = userShippingAddress;
    console.log(shipping_address, "shipping address")
    // Find the index of the shipping address to remove
    const addressIndex = shipping_address.findIndex(address => address._id == addressId);
    console.log(addressIndex, "address indexx")

    if (addressIndex === -1) {
      return next(new ErrorHandler('Shipping address not found', 404));
    }

    // Remove the shipping address from the array
    shipping_address.splice(addressIndex, 1);

    // Save the updated document
    await userShippingAddress.save();

    res.status(200).json({
      success: true,
      message: 'Shipping address removed successfully',
    });
  } catch (err) {
    return next(new ErrorHandler('Error removing shipping address', 500));
  }
})
exports.editShippingAddress = catchAsyncErrors(async (req, res, next) => {
  const { editAddressId } = req.params; // Get the address ID from the request URL
  const { first_name, last_name, company_name, line1, line2, city, state, country, postal_code } = req.body;

  const { id } = req.user;

  try {
    const userShippingAddress = await shippingAddress.findOne({ userId: id });
    console.log(userShippingAddress, "userShippingAddress")

    if (!userShippingAddress) {
      return next(new ErrorHandler('User shipping address not found', 404));
    }

    const { shipping_address } = userShippingAddress;
    console.log(shipping_address, "shipping address")

    // Find the index of the shipping address to edit
    const addressIndex = shipping_address.findIndex(address => address._id == addressId);
    console.log(addressIndex, "address index")

    if (addressIndex === -1) {
      return next(new ErrorHandler('Shipping address not found', 404));
    }

    // Update the shipping address data
    shipping_address[addressIndex] = {
      _id: addressId,
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

    // Save the updated document
    await userShippingAddress.save();

    res.status(200).json({
      success: true,
      message: 'Shipping address updated successfully',
      updatedShippingAddress: shipping_address[addressIndex],
    });
  } catch (err) {
    return next(new ErrorHandler('Error updating shipping address', 500));
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
    if (tokenExists.status === 'Declined') {
      res.status(400).json({
        success: false,
        message: 'Invalid invitation.',
      });
    } else {
      // Check if the invitation is not expired
      const data = await InvitedTeamMemberModel.findOne({
        invitationToken: token,
        invitationExpiry: { $gt: currentDate }, // Not expired
      }).select('_id email first_name last_name companyId');
      
      if (data) {
        res.status(200).json({
          success: true,
          userData: data,
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Token is expired.',
        });
      }
    }
  }
});

exports.registerInvitedUser = catchAsyncErrors(async (req, res, next) => {
  try {
    const {_id,status} = req.body.InvitedUserData;
    if (status === 'Declined') {
      res.status(400).json({
        success: false,
        message: 'Invalid invitation.',
      });
      return; // Stop execution if the invitation is declined.
    }
    let userdetails = ({email, first_name, last_name, companyId } = req.body.InvitedUserData);

    userdetails = {
      ...userdetails,
      isIndividual: false,
      isPaidUser: true,
      companyID: userdetails.companyId,
    };

    const user = await User.create(userdetails);
    const deleteInvitedUser = await InvitedTeamMemberModel.findByIdAndDelete(_id);
    if (!deleteInvitedUser) {
      res.status(500).json({
        success: false,
        message: 'Internal Server Error',
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
  const {invitedUserData} = req.body;
  const { token,  userData } = invitedUserData;
  const { _id,  companyId, email: userEmail, status  } = userData;
  console.log(userEmail)
   // Check the status field
   if (status === 'Declined') {
    return res.status(400).json({
      success: false,
      message: 'Invalid invitation.',
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
  userData = {
    email: email,
    first_name: first_name,
    last_name: last_name,
    googleId: googleId,
    companyID: companyId,
    isIndividual: false,
    isIndividual: false,
    isPaidUser: true,
  };
  const existingUser = await User.findOne({ email: userData.email });

  if (existingUser) {
    return next(
      new ErrorHandler("User with the same email already exists", 500)
    );
  }

  const newUser = await User.create(userData);
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
  const { userid } = req.body;
  const { companyID } = req.user;


  console.log(userid)
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
  
      const currentDate = new Date();
  
      // Calculate the expiry date by adding 10 days
      const expiryDate = new Date(currentDate);
      expiryDate.setDate(currentDate.getDate() + 10);
  
    const message = {
      from: "manish.syndell@gmail.com",
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
          <img src="https://onetapconnect.sincprojects.com/static/media/logo_black.c86b89fa53055b765e09537ae9e94687.svg">
          
          </div>
          <div style="background-color: #fff; border-radius: 0 0 20px 20px; padding: 20px; color: #333; font-size: 14px;">
          <!-- <div><img src="https://onetapconnect.com/wp-content/uploads/2023/05/OneTapConnect-logo-2023.png" width="150px"/></div> -->
          <h3>Welcome to OneTapConnect!</h3>
          <p>Hi ${user.first_name}<br/>
          You’ve been invited by ${company.company_name} to join OneTapConnect. Please click the link below to complete your account setup and start using your new digital business card.</p>
          <!-- <div><button>Accept invitation</button><button>Reject</button></div> -->
          <div style="display: flex; justify-content: space-evenly; gap: 25px; margin-top: 25px;">
            <div style="flex: 1; border-radius: 4px; overflow: hidden; background-color: #e65925;">
                <a href="${process.env.FRONTEND_URL}/sign-up/${invitationToken}" style="display: inline-block; width: 83%; padding: 10px 20px; font-weight: 600; color: #fff; text-align: center; text-decoration: none;">Accept invitation</a>
            </div>
            <div style="flex: 1; border: 1px solid #333; border-radius: 4px; overflow: hidden">
                <a href="${process.env.FRONTEND_URL}/plan-selection" style="display: inline-block; width: 79%; padding: 10px 20px; font-weight: 600; color: #fff; text-align: center; text-decoration: none; color:black;">Reject</a>
            </div>
        </div>
          <p>If you have any question about this invitation, please contact your company account manager [account_manager_name] at [account_manager_name_email].</p>
          <h5>Technical issue?</h5>
          <p>In case you facing any technical issue, please contact our support team <a href="https://onetapconnect.com/contact-sales/">here</a>.</p>
      </div>
  
  </body>
  
  </html>
  
  
  `,
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

  res.status(200).json({ message: 'Email Sent' });
  
});
