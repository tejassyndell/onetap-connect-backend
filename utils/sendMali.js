const nodemailer = require("nodemailer");

// Send verification email
const sendMail = (email, data, invitationToken) => {
  // Create nodemailer transporter
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    port: 587,
    auth: {
      user: process.env.NODMAILER_EMAIL,
      pass: process.env.NODEMAILER_PASS,
    },
  });

  const message = {
    from: "otcdevelopers@gmail.com",
    to: email,
    subject: `Invitaiton email from ${data.company_name}`,
    //   text: `Your Verification code is ${code}`,
    html: `
    <h1>Invitation to join our platform</h1>
    <p>Hello, you have been invited to join our platform.</p>
    <p>Please click the buttons below to accept or decline the invitation:</p>
    <p></p><a href="http://localhost:3000/invitation/${invitationToken}">Click me</a> to open invitation page</p>
    
  `,
  };

  // Send email
  transporter.sendMail(message, (err, info) => {
  // DO SOMETHING
  });
};

module.exports = sendMail;
