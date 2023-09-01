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
const InvitedTeamMemberModel = require("../../models/Customers/InvitedTeamMemberModel.js");
const Cards = require("../../models/Customers/CardsModel.js");
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
    return next(new ErrorHandler("This Email is already in use", 409));
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
    from: "manish.syndell@gmail.com",
    to: email,
    subject: `Creating new account`,
    //   text: `Your Verification code is ${code}`,
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
        <div style="font-weight: bold;">Email verification</div>
        <p>Please click the “Verify email” button below to continue with the setup of your OneTapConnect account.</p>
        <p>If you believe you received the email by mistake, you may disregard this email, or contact our support team for any information.</p>
        <div style="display: flex; justify-content: center; gap: 25px; margin-top: 25px;">
            <div style="flex: 1; border-radius: 4px; overflow: hidden; background-color: #e65925;">
                <a href="${process.env.FRONTEND_URL}/register/${token}" style="display: inline-block; width: 93%; padding: 10px 20px; font-weight: 600; color: #fff; text-align: center; text-decoration: none;">Verify email</a>
            </div>
        </div>
        <div style="margin-top: 25px;">
            <p>Link not working? Please copy and paste the below URL to verify your email:</p>
            <p>${process.env.FRONTEND_URL}/register/${token}</p>
        </div>
        <div style="margin-top: 25px;">
            <div style="font-weight: bold;">Technical issue?</div>
            <div>
                <span>In case you're facing any technical issue, please contact our support team </span>
                <span style="color: #2572e6;"><a href="https://support.onetapconnect.com/">here.</a></span>
            </div>
        </div>
    </div>
    <a href="https://www.OneTapConnect.com" style="text-align: center; font-size: 12px; color: #e65925; margin-top: 15px; text-decoration: none;margin-left: 38%;">OneTapConnect.com</a>
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
        new ErrorHandler("Email Not Sent ,Please Try Agian Later", 500)
      );
    } else {
      console.log(info);
      res.status(200).json({
        success: true,
        message: "Email sent successfully",
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
  } = req.body.signupData;
  // console.log(req.body)

  const decodedData = jwt.verify(token, process.env.JWT_SECRET);
  const email = decodedData.email;

  const user = await User.create({
    email,
    first_name,
    last_name,
    contact,
    isIndividual: !isCompany,
    password,
  });
  if (!user) {
    return next(new ErrorHandler("Error while sign-up", 400));
  }

  const trimedString = company_name.replace(/\s/g, "").toLowerCase();

  const company = await Company.find();

  // checking if compnay already exists
  company.map((item) => {
    if (item.company_name.replace(/\s/g, "").toLowerCase() === trimedString) {
      console.log(item.company_name);
      return next(new ErrorHandler("Company Already Exists", 400));
    }
  });

  const newCompany = await Company.create({
    primary_account: user._id,
    company_name,
    industry,
    team_size,
  });

  user.companyID = newCompany._id;
  user.isVerfied = true;
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
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid email or password", 401));
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
      return next(new ErrorHandler("User not found", 404));
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
      message: `Email sent to ${email} successfully`,
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
  const { email, first_name, last_name, team } = req.body.memberData;
  const { companyID } = req.user;

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

  const member = await InvitedTeamMemberModel.create({
    email: email,
    first_name: first_name,
    last_name: last_name,
    team: team,
    companyId: companyID,
    invitationToken: invitationToken,
    invitationExpiry: expiryDate,
  });

  const company = await Company.findById(companyID);

  const transporter = nodemailer.createTransport({
    service: "Gmail",
    port: 587,
    auth: {
      user: process.env.NODMAILER_EMAIL,
      pass: process.env.NODEMAILER_PASS,
    },
  });

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
                <a href="${process.env.FRONTEND_URL}/sign-up" style="display: inline-block; width: 83%; padding: 10px 20px; font-weight: 600; color: #fff; text-align: center; text-decoration: none;">Accept invitation</a>
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

  res.status(201).json({
    success: true,
    message: "Invitaion Email sent Successfully",
  });
});

//add card details
exports.addCardDetails = catchAsyncErrors(async (req, res) => {
  const { nameOnCard, cardNumber, expirationDate, CVV, status } = req.body;
  const { id } = req.user;
  const cardData = {
    nameOnCard,
    cardNumber,
    expirationDate,
    CVV,
    status,
  };
  const card = await Cards.create(cardData);

  card.userID = id;

  card.save();

  res.status(201).json({
    card,
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

//update billing address

exports.updateBillingAddress = catchAsyncErrors(async (req, res, next) => {
  const { id, companyID } = req.user;
  const { firstName, lastName, company_name, billing_address } = req.body;

  try {
    const updateBilling = await User.findByIdAndUpdate(
      id,
      {
        $set: {
          first_name: firstName,
          last_name: lastName,
          billing_address: billing_address,
        },
      },
      { new: true, runValidators: true }
    );

    const updateCompany = await Company.findByIdAndUpdate(
      companyID,
      { $set: { company_name: company_name } },
      { new: true, runValidators: true }
    );

    res.status(201).json({
      success: true,
      message: "User Billing Address and Company Name Updated Successfully",
    });
  } catch (error) {
    res.status(500).json({ error: "Error updating user billing address." });
  }
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
    return res.status(404).json({ message: 'Company not found' });
  }

  // Find the team index in the company's teams array
  const teamIndex = company.teams.findIndex(team => team.localeCompare(oldTeamName, undefined, { sensitivity: 'base' }) === 0);

  if (teamIndex === -1) {
    return res.status(400).json({ message: 'Team not found in company' });
  }

  const isExistingTeam = company.teams.some(team => team.localeCompare(newTeamName, undefined, { sensitivity: 'base' }) === 0);

  if (isExistingTeam) {
    return res.status(400).json({ message: 'New team name already exists' });
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

  res.status(200).json({ message: 'Team renamed successfully', company });
});



// delete team
exports.deleteTeam = catchAsyncErrors(async (req, res, next) => {
  const companyID = req.user.companyID; // Assuming you have this value available
  const { teamname } = req.body; 

  // Find the company
  const company = await Company.findById(companyID);
  if (!company) {
    return res.status(404).json({ message: 'Company not found' });
  }

  // Find the team index in the company's teams array
  const teamIndex = company.teams.indexOf(teamname);
  if (teamIndex === -1) {
    return res.status(400).json({ message: 'Team not found in company' });
  }

  // Remove team from the company's teams array
  const deletedTeam = company.teams.splice(teamIndex, 1)[0];
  await company.save();

  // Find users belonging to the deleted team
  const usersToDelete = await User.find({ team: deletedTeam });

  // Remove the team association from the users
  for (const user of usersToDelete) {
    user.team = '';
    await user.save();
  }

  res.status(200).json({ message: 'Team deleted successfully', company });
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

//checkout handler
exports.checkoutHandler = catchAsyncErrors(async (req, res, next) => {
  const { id,companyID } = req.user;
  const { userData, planData, cardInfo } = req.body;


  const cardData = {
    cardNumber: cardInfo.cardNumber,
    brand: cardInfo.brand,
  };

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

  const company = await Company.findById(companyID);
  company.address = userData.billing_address;

  await user.save();
  await card.save();
  await company.save();

  res.status(200).json({
    success: true,
  });
});
