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
const InvitaionModel = require("../../models/Customers/InvitedTeamMemberModel.js");
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
    console.log(user.email)
    return next(new ErrorHandler("This Email is already in use", 409))
  } else {
    console.log("else part")
  }

  const token = jwt.sign({ email: email }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });
  const date = new Date();
  console.log(date)
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
    <!DOCTYPE html>
    <html>
    
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="initial-scale=1, width=device-width" />
    </head>
    
    <body style="margin: 0; line-height: normal; font-family: 'Assistant', sans-serif;">
    
        <div style="background-color: #f2f2f2; width: 100%; padding: 20px;">
            <div style="background-color: #000; border-radius: 20px 20px 0 0; padding: 20px 15px; text-align: center;">
            <svg width="165" height="35" viewBox="0 0 165 35" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M60.6281 28.366C60.1274 28.5942 59.7177 28.5942 56.8955 28.5942C53.2994 28.5942 53.0263 28.366 53.0263 25.4C53.0263 23.3923 53.1174 22.8903 53.5726 22.4796C54.0278 22.069 54.574 21.9777 57.6693 21.9777C60.9012 21.9777 61.1743 22.069 61.2654 23.4379H64.8614V23.0272C64.8614 21.202 64.4062 20.1069 63.4048 19.6049C62.3578 19.103 61.3564 19.0117 56.7589 19.0117C53.2994 19.0117 52.1159 19.1942 51.0235 19.8331C49.7489 20.5632 49.3848 21.7496 49.3848 24.9893C49.3848 28.6398 49.7489 29.9631 50.9324 30.7388C51.9339 31.3776 53.0718 31.5601 56.6224 31.5601C59.0804 31.5601 60.537 31.5601 61.3109 31.4689C63.2227 31.332 64.2241 30.8301 64.7248 29.7806C64.998 29.233 65.0435 28.5942 65.0435 26.8146H61.4019C61.3564 27.7728 61.1743 28.1378 60.6281 28.366Z" fill="#E65925"/>
            <path d="M80.2008 19.2401C79.3359 19.1032 78.2434 19.0576 74.6929 19.0576C71.461 19.0576 70.323 19.1489 69.2761 19.4227C67.9105 19.8333 67.1822 20.5178 66.818 21.8411C66.5904 22.6624 66.5449 23.21 66.5449 25.2634C66.5449 27.9556 66.636 28.8682 67.1367 29.7808C67.5919 30.6934 68.4112 31.1954 69.7768 31.4691C70.5051 31.606 72.0073 31.6517 74.966 31.6517C76.1495 31.6517 77.7882 31.6517 78.471 31.606C80.2463 31.5148 81.2932 31.241 82.0216 30.6022C83.0685 29.7352 83.3871 28.5488 83.3871 25.5372C83.3871 24.0314 83.3416 23.0275 83.2961 22.5255C83.023 20.5634 82.0671 19.5596 80.2008 19.2401ZM79.1994 27.91C78.7897 28.5032 78.1069 28.5944 74.875 28.5944C72.0528 28.5944 71.461 28.5032 70.9603 28.0925C70.5051 27.6818 70.3686 27.043 70.3686 25.2178C70.3686 23.4382 70.5051 22.845 71.0058 22.4343C71.5066 22.0692 72.2349 21.978 75.0116 21.978C79.609 21.978 79.7001 22.0236 79.7001 25.1265C79.6545 26.8605 79.5635 27.4537 79.1994 27.91Z" fill="#E65925"/>
            <path d="M112.339 28.5484L104.873 19.1484H98.5462L98.6372 28.5484L91.172 19.1484H85.209V31.5143H88.805L88.714 22.2057L96.0881 31.5143H102.097V21.8406L109.744 31.5143H115.798V19.1484H112.248L112.339 28.5484Z" fill="#E65925"/>
            <path d="M121.533 26.5406H130.91V24.0766H121.533V21.9775H131.502V19.1484H117.846V31.5143H131.638V28.7309H121.533V26.5406Z" fill="#E65925"/>
            <path d="M144.292 28.366C143.791 28.5942 143.382 28.5942 140.56 28.5942C136.964 28.5942 136.69 28.366 136.69 25.4C136.69 23.3923 136.781 22.8903 137.237 22.4796C137.692 22.069 138.238 21.9777 141.333 21.9777C144.565 21.9777 144.838 22.069 144.929 23.4379H148.525V23.0272C148.525 21.202 148.07 20.1069 147.069 19.6049C146.022 19.103 145.02 19.0117 140.423 19.0117C136.963 19.0117 135.78 19.1942 134.688 19.8331C133.413 20.5632 133.049 21.7496 133.049 24.9893C133.049 28.6398 133.413 29.9631 134.596 30.7388C135.598 31.3776 136.736 31.5601 140.286 31.5601C142.744 31.5601 144.201 31.5601 144.975 31.4689C146.887 31.332 147.888 30.8301 148.389 29.7806C148.662 29.233 148.708 28.5942 148.708 26.8146H145.066C145.02 27.7728 144.838 28.1378 144.292 28.366Z" fill="#E65925"/>
            <path d="M155.217 31.5147H158.949V22.2061L155.217 24.1682V31.5147Z" fill="#E65925"/>
            <path d="M164.412 19.1484H149.709V22.2057H164.412V19.1484Z" fill="#E65925"/>
            <path d="M62.9508 3.36026C64.8626 3.7253 65.773 4.68354 66.0461 6.69129C66.1371 7.19323 66.1371 8.1971 66.1371 9.70292C66.1371 12.6689 65.8185 13.9009 64.7716 14.7679C64.0432 15.4067 62.9963 15.6805 61.221 15.7718C60.5382 15.8174 58.8995 15.8174 57.716 15.8174C54.8028 15.8174 53.3006 15.7718 52.5268 15.6349C51.1612 15.4067 50.3874 14.8592 49.8867 13.9466C49.386 13.034 49.2949 12.1213 49.2949 9.42913C49.2949 7.37575 49.3404 6.82818 49.568 6.00683C49.9322 4.68354 50.6605 3.99909 52.0261 3.58841C53.073 3.31463 54.1655 3.22337 57.4429 3.22337C60.9934 3.1321 62.0859 3.17773 62.9508 3.36026ZM53.7558 6.60003C53.2551 7.01071 53.1186 7.60391 53.1186 9.3835C53.1186 11.2087 53.2551 11.8476 53.7103 12.2582C54.211 12.6689 54.8028 12.7602 57.625 12.7602C60.8569 12.7602 61.5397 12.6689 61.9493 12.0757C62.3135 11.6194 62.4045 10.9806 62.4045 9.33787C62.4045 6.23499 62.359 6.18936 57.716 6.18936C54.9849 6.18936 54.2565 6.28062 53.7558 6.60003Z" fill="white"/>
            <path d="M68.0039 3.26855H73.967L81.4322 12.6685L81.3411 3.26855H84.8916V15.5888H78.8831L71.5089 6.32581L71.6 15.6345H68.0039V3.26855Z" fill="white"/>
            <path d="M100.596 3.26855V6.05203H90.6271V8.19667H100.004V10.6607H90.6271V12.851H100.687V15.6345H86.8945V3.31419H100.596V3.26855Z" fill="white"/>
            <path d="M107.923 6.32581H102.461V3.26855H117.164V6.32581H111.701V15.6345H107.969V6.32581H107.923Z" fill="white"/>
            <path d="M121.626 3.26855H126.633L133.37 15.5888H129.273L128.044 13.3986H120.124L118.94 15.5888H114.707L121.626 3.26855ZM126.77 10.8432L124.13 5.91513L121.489 10.8432H126.77Z" fill="white"/>
            <path d="M134.006 3.26855H143.428C145.795 3.26855 146.433 3.35982 147.207 3.72486C148.436 4.31806 148.891 5.45883 148.891 7.78599C148.891 10.1588 148.481 11.3452 147.434 11.984C146.706 12.4403 145.886 12.5772 143.747 12.5772H137.738V15.6345H134.006V3.26855ZM143.155 9.61122C144.703 9.61122 145.113 9.2918 145.113 8.10541C145.113 6.64522 144.748 6.28018 143.155 6.28018H137.693V9.61122H143.155Z" fill="white"/>
            <path d="M19.5707 12.8516L17.2947 10.57C17.2947 10.57 17.2492 10.5244 17.2037 10.5244C17.1581 10.5244 17.1581 10.5244 17.1126 10.57C15.3829 12.3496 14.3359 14.7224 14.3359 17.369C14.3359 20.0156 15.3829 22.434 17.1126 24.168C17.1126 24.168 17.1581 24.2136 17.2037 24.2136C17.2492 24.2136 17.2492 24.2136 17.2947 24.168L19.5707 21.8864C19.6162 21.8408 19.6162 21.7495 19.5707 21.7039C18.4782 20.5631 17.7954 19.0117 17.7954 17.3234C17.7954 15.635 18.4782 14.0836 19.5707 12.9428C19.6617 12.9885 19.6162 12.8972 19.5707 12.8516Z" fill="#E65925"/>
            <path d="M36.184 8.06092C36.2295 8.06092 36.3205 8.10655 36.3205 8.19781V26.6326C36.3205 26.6782 36.275 26.7695 36.184 26.7695H17.521L12.6504 31.6519H37.3675C40.0987 31.6519 42.3746 29.416 42.3746 26.6326V8.15218C42.3746 5.41434 40.1442 3.13281 37.3675 3.13281H12.6504L17.521 8.01529H36.184V8.06092ZM39.6435 10.525V24.2598C39.6435 24.4423 39.5069 24.6248 39.2793 24.6248C39.0517 24.6248 38.9152 24.4879 38.9152 24.2598V10.525C38.9152 10.3424 39.0517 10.1599 39.2793 10.1599C39.5069 10.1599 39.6435 10.3424 39.6435 10.525Z" fill="white"/>
            <path d="M14.7005 7.96974L12.4245 5.68821C12.4245 5.68821 12.379 5.64258 12.3335 5.64258C12.288 5.64258 12.288 5.64258 12.2424 5.68821C9.28367 8.69983 7.46289 12.8522 7.46289 17.4153C7.46289 21.9783 9.28367 26.1307 12.2424 29.1423C12.2424 29.1423 12.288 29.188 12.3335 29.188C12.379 29.188 12.379 29.188 12.4245 29.1423L14.7005 26.8608C14.746 26.8152 14.746 26.7239 14.7005 26.6783C12.379 24.3055 10.9224 21.0201 10.9224 17.4153C10.9224 13.8105 12.379 10.5251 14.7005 8.15226C14.746 8.10663 14.746 8.01537 14.7005 7.96974Z" fill="#E65925"/>
            <path d="M7.3709 0.805397C3.13758 5.09468 0.542969 10.9354 0.542969 17.415C0.542969 23.8945 3.13758 29.7352 7.3709 34.0245C7.3709 34.0245 7.41642 34.0701 7.46194 34.0701C7.50746 34.0701 7.50746 34.0701 7.55298 34.0245L9.82896 31.743C9.87448 31.6973 9.87448 31.6061 9.82896 31.5605C6.23292 27.91 4.00246 22.9363 4.00246 17.415C4.00246 11.8936 6.23292 6.9199 9.82896 3.26945C9.87448 3.22382 9.87448 3.13256 9.82896 3.08693L7.55298 0.805397C7.55298 0.805397 7.50746 0.759766 7.46194 0.759766C7.41642 0.759766 7.41642 0.759767 7.3709 0.805397Z" fill="#E65925"/>
            <path d="M24.4693 20.2212C26.0163 20.0303 27.116 18.6184 26.9255 17.0676C26.735 15.5169 25.3265 14.4145 23.7796 14.6055C22.2326 14.7964 21.1329 16.2083 21.3234 17.7591C21.5139 19.3098 22.9223 20.4122 24.4693 20.2212Z" fill="#E65925"/>
            </svg>
            
            </div>
            <div style="background-color: #fff; border-radius: 0 0 20px 20px; padding: 20px; color: #333; font-size: 14px;">
                <div style="font-weight: bold;">Email verification</div>
                <p>Please click the “Verify email” button below to continue with the setup of your OneTapConnect account.</p>
                <p>If you believe you received the email by mistake, you may disregard this email, or contact our support team for any information.</p>
                <div style="display: flex; justify-content: center; gap: 25px; margin-top: 25px;">
                    <div style="flex: 1; border-radius: 4px; overflow: hidden; background-color: #e65925;">
                        <a href="${process.env.FRONTEND_URL}/register/${token}" style="display: inline-block; width: 123px; padding: 10px 20px; font-weight: 600; color: #fff; text-align: center; text-decoration: none;">Verify email</a>
                    </div>
                    <div style="flex: 1; border: 1px solid #333; border-radius: 4px; overflow: hidden; display: none;">
                        <div style="display: flex; align-items: center; justify-content: center; padding: 10px 20px; font-size: 14px; color: #333;">Reject</div>
                    </div>
                </div>
                <div style="margin-top: 25px;">
                    <p>Link not working? Please copy and paste the below URL to verify your email:</p>
                    <p>{${process.env.FRONTEND_URL}/register/${token}}</p>
                </div>
                <div style="margin-top: 25px;">
                    <div style="font-weight: bold;">Technical issue?</div>
                    <div>
                        <span>In case you're facing any technical issue, please contact our support team </span>
                        <span style="color: #2572e6;">here.</span>
                    </div>
                </div>
            </div>
            <div style="text-align: center; font-size: 12px; color: #e65925; margin-top: 15px;">OneTapConnect.com</div>
        </div>
    
    </body>
    
    </html>
    
    
  `,
};

  transporter.sendMail(message, (err, info) => {
    if (err) {
      console.log("error", err)
      return next(new ErrorHandler("Email Not Sent ,Please Try Agian Later", 500))
    }
    else {
      console.log(info)
      res.status(200).json({
        success: true,
        message: "Email sent successfully"
      })
    }
  })



});

//sign-up step-2
exports.signUP2 = catchAsyncErrors(async (req, res, next) => {

  const { token } = req.params
  const { first_name, last_name, contact, isCompany, industry, company_name, team_size, password } = req.body.signupData;
  // console.log(req.body)

  const decodedData = jwt.verify(token, process.env.JWT_SECRET);
  const email = decodedData.email




  const user = await User.create(

    {
      email,
      first_name,
      last_name,
      contact,
      isIndividual: !isCompany,
      password
    }



  );
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

  const newCompany = await Company.create({ primary_account: user._id, company_name, industry, team_size })

  user.companyID = newCompany._id;
  user.isVerfied = true;
  await user.save({ validateBeforeSave: true });

  // res.status(200).json({
  //   message: "user saved successfully",
  //   user
  // })

  sendToken(user, 200, res)

})


exports.registerUser = catchAsyncErrors(async (req, res, next) => {

  const { first_name, last_name, email, password, contact, isIndividual, isPaidUser, role, company_name, industry, } = req.body;
  const userData = {

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


  console.log(req.body);

  const user = await User.create(userData);

  const companyData = {
    company_name,
    industry,
    primary_account: user._id

  }

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

  // checking if user has given password and email both

  if (!email || !password) {
    return next(new ErrorHandler("Please Enter Email & Password", 400));
  }

  const user = await User.findOne({ email });

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
      tls: { rejectUnauthorized: false }
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
      html: `<div>
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

  sendToken(user, 200, res);
});



exports.getCompanyDetails = catchAsyncErrors(async (req, res, next) => {


  const { companyID } = req.user
  const company = await Company.findById(companyID).populate('primary_account');
  if (!company) {
    return next(new ErrorHandler("No company details Found", 404));
  }

  res.status(200).json({
    success: true,
    company
  })

})



// get all team members
exports.getUsers = catchAsyncErrors(async (req, res, next) => {

  const { companyID } = req.user
  const users = await User.find({ companyID });
  if (!users) {
    return next(new ErrorHandler("No company details Found", 404));
  }

  res.status(200).json({
    success: true,
    users
  })

})


// get single team members
exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {

  const { id } = req.params
  const user = await User.findById(id);
  if (!user) {
    return next(new ErrorHandler("No company details Found", 404));
  }
  console.log(user.companyID, req.user.companyID)
  if (user.companyID.toString() !== req.user.companyID.toString()) {
    return next(new ErrorHandler("You are not authorized to access this route", 401));
  }

  res.status(200).json({
    success: true,
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

  exports.showCardDetails = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.user;

    const cards = await Cards.find({ userID: id });

    if (!cards) {
      return next(new ErrorHandler("No card details found for this user", 404));
    }

    res.status(200).json({
      success: true,
      cards,
    });
  })
