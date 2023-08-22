const sendToken = require("../../utils/authToken.js");
const bcrypt = require("bcryptjs");
const sendMail = require("../../utils/sendMali.js");
const ErrorHandler = require("../../utils/errorHandler.js");
const catchAsyncErrors = require("../../middleware/catchAsyncErrors.js");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const crypto = require("crypto");
const axios = require('axios')
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require("google-auth-library");
const User = require("../../models/Customers/UserModel.js");
const Company = require('../../models/Customers/CompanyModel.js');
const { processPayment } = require("../paymentController/paymentcontroller.js");
const InvitaionModel = require('../../models/Customers/InvitedTeamMemberModel.js')
// const logo = require('../../uploads/logo/logo_black.svg')


dotenv.config();


//--sign up step - 1 ----
exports.signUP1 = catchAsyncErrors(async (req, res, next) => {

  const { email } = req.body
  console.log(email)

  const user = await User.create(req.body);

  if (!user) {
    return next(new ErrorHandler("Error while sign-up", 400)
    )
  }

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
    subject: `Creating new account`,
    //   text: `Your Verification code is ${code}`,
    html: `
    <h3>Dear User</h3><br>
    <p>Thank you for choosing One Tap Connect LLC! We're thrilled to have you join our community. To complete your sign-up process, please click the button below:</p><br>
    <p></p><a href="${process.env.FRONTEND_URL}/sign-up/step-2/${user._id}">Click me</a> to complete sign up</p>
    <p>If you have any questions or need assistance, feel free to reach out to our customer support team at <a href="mailto:admin@onetapconnect.com">admin@onetapconnect.com</a></p><br>   
    <p>We're excited to have you on board and can't wait to see you make the most of our services.
    </p>
    <p>
    Best regards,<br>
The One Tap Connect Team</p>
    
  `

  };

  transporter.sendMail(message, (err, info) => {
    if (err) {
      console.log(err)
    }
    else {
      console.log(info.envelope)
    }
  })

  res.status(200).json({
    success: true,
    user,
    message: "Email sent successfully"
  })

});


//sign-up step-2
exports.signUP2 = catchAsyncErrors(async (req, res, next) => {

  const { id } = req.params
  const { first_name, last_name, contact, isCompany, industry, company_name, team_size } = req.body.signupData;
  console.log(req.body)

  const user = await User.findById(id);
  if (!user) {
    return next(new ErrorHandler("Error while sign-up", 400)
    )
  }

  const trimedString = company_name.replace(/\s/g, '').toLowerCase();


  const company = await Company.find();

  // checking if compnay already exists
  company.map((item) => {
    if (item.company_name.replace(/\s/g, '').toLowerCase() === trimedString) {
      console.log(item.company_name)
      return next(new ErrorHandler("Company Already Exists", 400))
    }
  })

  const newCompany = await Company.create({ primary_account: id, company_name, industry, team_size })

  user.first_name = first_name;
  user.last_name = last_name;
  user.contact = contact;
  if (isCompany) {
    user.isCompanyMember = true;
  }
  else {
    user.isCompanyMember = false;
  }
  await user.save({ validateBeforeSave: true });

  res.status(200).json({
    message: "user saved successfully",
    user
  })

})


exports.registerUser = catchAsyncErrors(async (req, res, next) => {

  const { first_name, last_name, email, password, contact, isIndividual, isPaidUser, role,company_name,industry, } = req.body;
  const userData = {

    first_name,
    last_name,
    email,
    password,
    contact,
    isIndividual,
    isPaidUser,
    role
  }

  console.log(req.body);

  const user = await User.create(userData);


  const companyData = {
    company_name,
    industry,
    primary_account : user._id

  }

  const company = await  Company.create(companyData);

  user.companyID = company._id;
  user.save();

  res.status(201).json({
    user,
    company
  })



})







//login user
exports.login = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

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



  const user = await User.findById(id)

  if (!user) {
    return next(new ErrorHandler("user not found", 401));
  }

  res.status(200).json({
    success: true,
    user
  })

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
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587, // Use 465 for SSL
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.NODMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASS,
      },
      tls: {rejectUnauthorized: false}
    });

    const user = await User.findOne({ email });

    if (!user) {
      return next(new ErrorHandler('User not found', 404));
    }

    // Generate or retrieve resetToken here
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    const message = {
      from: 'manish.syndell@gmail.com',
      to: email, // Replace with the recipient's email
      subject: 'Password Recovery Email',
      // text: `Password reset link: ${process.env.FRONTEND_URL}/reset-password/${resetToken}\n\nIf you have not requested this email, please ignore it.`,
      html:  `<div>
      <h3>Dear User</h3>
      <p>We received a request to reset the password associated with your account. If you did not initiate this request, please disregard this email.</p>
      
      <p>To reset your password, please click the link below:</p>
      <a href="${process.env.FRONTEND_URL}/reset-password/${resetToken}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
      
      <p>If you're having trouble clicking the link, you can copy and paste the following URL into your browser's address bar:</p>
      
      <p>Please note that this link is valid for the next 24 hours. After that, you will need to request another password reset.</p>
      
      <p>If you have any questions or need further assistance, please contact our support team at <a href="mailto:admin@onetapconnect.com">admin@onetapconnect.com</a>.</p>
      
      <p>Best regards,<br>The One Tap Connect Team</p>
     </div>`,
    };
    


    // Attempt to send the email
    await transporter.sendMail(message);

    // Email sent successfully
    res.status(200).json({
      success: true,
      message: `Email sent to ${email} successfully`,
    });
  } catch (error) {
    console.error('Error sending email:', error);
    res.send(error);

    // Handle the error properly
    return next(new ErrorHandler('Email sending failed', 500));
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

  console.log(user)
  console.log(req.body)

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

  sendToken(user, 200, res);
});



exports.getCompanyDetails = catchAsyncErrors(async(req,res,next)=>{


  const {companyID} = req.user
  const company = await Company.findById(companyID).populate('primary_account');
  if(!company){
    return next(new ErrorHandler("No company details Found",404));
  }

  res.status(200).json({
    success : true,
    company
  })

})



// get all team members
exports.getUsers = catchAsyncErrors(async(req,res,next)=>{

  const {companyID} = req.user
  const users = await User.find({companyID});
  if(!users){
    return next(new ErrorHandler("No company details Found",404));
  }

  res.status(200).json({
    success : true,
    users
  })

})


// get single team members
exports.getUserDetails = catchAsyncErrors(async(req,res,next)=>{

  const {id} = req.params
  const user = await User.findById(id);
  if(!user){
    return next(new ErrorHandler("No company details Found",404));
  }
console.log(user.companyID,req.user.companyID)
  if(user.companyID.toString() !== req.user.companyID.toString()){
    return next(new ErrorHandler("You are not authorized to access this route",401));
  }

  res.status(200).json({
    success : true,
    user
  })

})

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
    user.team = teams[i].value;
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


})


// invite team member 

exports.inviteTeamMember = catchAsyncErrors(async (req, res, next) => {

  const {email, first_name, last_name, team} = req.body.memberData;
  const {companyID} = req.user

  if (!email || !first_name  || !last_name || !team) {

    if (!email) {
      return next(new ErrorHandler('Please Enter Email', 400))
    }
    if (!first_name) {
      return next(new ErrorHandler('Please Enter First Name', 400))
    }
    if (!last_name) {
      return next(new ErrorHandler('Please Enter Last Name', 400))
    }
    if (!team) {
      return next(new ErrorHandler('Please Enter Team', 400))
    }
    else {
      return next(new ErrorHandler("Please fill out all details", 400))
    }

  }
  if (email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailPattern.test(email) === false) {

      return next(new ErrorHandler("Please enter valid email"))
    }
  }

  let invitationToken = crypto.randomBytes(20).toString("hex");

  const currentDate = new Date();

  // Calculate the expiry date by adding 10 days
  const expiryDate = new Date(currentDate);
  expiryDate.setDate(currentDate.getDate() + 10);

  // Convert the expiry date to ISO string format
  // const expiryDateString = expiryDate.toISOString();

  

  const member = await InvitaionModel.create({
    email : email,
    first_name : first_name,
    last_name:last_name,
    team : team,
    companyId: companyID,
    invitationToken :invitationToken,
    invitationExpiry : expiryDate


   })



  const transporter = nodemailer.createTransport({
    service: "Gmail",
    port: 587,
    auth: {
      user: process.env.NODMAILER_EMAIL,
      pass: process.env.NODEMAILER_PASS,
    },
  });

  const message = {
    from: "mailto:manish.syndell@gmail.com",
    to: email,
    subject: `${company.name} Invited you to join OneTapConnect`,
    html: `
   <div>
   <div><img src="https://onetapconnect.com/wp-content/uploads/2023/05/OneTapConnect-logo-2023.png" width="150px"/></div>
   <h3>Welcome to OneTapConnect!</h3>
   <p>Hi ${first_name}<br/>
   You’ve been invited by ${company.name} to join OneTapConnect. Please click the link below to complete your account setup and start using your new digital business card.</p>
   <div><button>Accept invitation</button><button>Reject</button></div>
   <p>If you have any question about this invitation, please contact your company account manager [account_manager_name] at [account_manager_name_email].</p>
   <h5>Technical issue?</h5>
   <p>In case you facing any technical issue, please contact our support team <a>here</a>.</p>
   <a></a>
   </div>

  `
  };

  transporter.sendMail(message, (err, info) => {
    if (err) {
      console.log(err)
    }
    else {
      console.log(info.response)
    }
  })

  res.status(201).json({
    success : true,
    message:"Invitaion Email sent Successfully"
  })

})