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
  // Create email message
  const message = {
    from: "otcdevelopers@gmail.com",
    to: email,
    subject: `Invitaiton email from ${data.company_name}`,
    html: `
    <h1>Invitation to join our platform</h1>
    <p>Hello, you have been invited to join our platform.</p>
    <p>Please click the buttons below to accept or decline the invitation:</p>
    <p></p><a href="http://localhost:3000/invitation/${invitationToken}">Click me</a> to open invitation page</p>
  `
  };
  transporter.sendMail(message, (err, info) => {
    if (err) {
    } else {
    }
  });
};
module.exports = sendMail
