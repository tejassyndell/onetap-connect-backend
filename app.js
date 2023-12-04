const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const companyRoutes = require("./routes/companyRoutes/companyRoutes.js");
const paymentRoutes = require("./routes/paymentRoutes/paymentRoutes.js");
const productRoutes = require("./routes/ProductRoutes/ProductRoutes.js");
const SuperAdminRoutes = require("./routes/SuperAdminRoutes/superAdminRoutes.js");
const OTCAdminRoutes = require("./routes/OTC-AdminRoutes/adminRoutes.js")
const AccountRoutes = require("./routes/accountSwitch/accountRoutes.js");
const notificationRoutes = require("./routes/notificationRoutes/notificationRoutes");
const { webhookHandler } = require("./controllers/webhook/webhookController.js");
const errorMiddleware = require("./middleware/error.js");
const app = express();
const path = require("path");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const connectDatabase = require("./db/db.js");
const admin = require('firebase-admin');//firebase
const serviceAccount = require('./controllers/notification/onetapconnect-85196-firebase-adminsdk-d6ogv-3805b3b9d6.json');//firebase
dotenv.config();
const url = process.env.FRONTEND_URL;

// do not remove this
// stripe webhook route
app.use('/api/v1/webhook', express.raw({ type: 'application/json' }));
app.post('/api/v1/webhook', webhookHandler)
// till here

app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cors({
    origin: [url],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["set-cookie"], // Expose the Set-Cookie header
  })
);

// app.get('/profile/:filename',(req,res) => {
//   const filename = req.params.filename;
//   const filePath = path.join(__dirname, '/uploads/profileImages', filename);
//   res.sendFile(filePath);
// })
app.get("/api/v1/profile/img/:filename", (req, res) => {
  const filename = req.params.filename;
  console.log(filename);

  const filePath = path.join(__dirname, "/uploads/profileImages", filename);
  res.sendFile(filePath);
});

app.get("/api/v1/product/img/:filename", (req, res) => {
  const filename = req.params.filename;
  console.log(filename);

  const filePath = path.join(__dirname, "/uploads/productImages", filename);
  res.sendFile(filePath);
});

app.get("/api/v1/admin/addons/img/:filename", (req, res) => {
  const filename = req.params.filename;
  console.log(filename);

  const filePath = path.join(__dirname, "/uploads/addonsimages", filename);
  res.sendFile(filePath);
});
app.get("/api/v1/logo/img/:filename", (req, res) => {
  const filename = req.params.filename;
  console.log(filename);

  const filePath = path.join(__dirname, "/uploads/logo", filename);
  res.sendFile(filePath);
});
app.get("/api/v1/favicon/img/:filename", (req, res) => {
  const filename = req.params.filename;
  console.log(filename);

  const filePath = path.join(__dirname, "/uploads/favicon", filename);
  res.sendFile(filePath);
});
connectDatabase();

// OTC-Admin
app.use("/api/v1", OTCAdminRoutes);

app.use("/api/v1", companyRoutes);
app.use("/api/v1", SuperAdminRoutes);
app.use("/api/v1", paymentRoutes);
app.use("/api/v1", productRoutes);
app.use("/api/v1", notificationRoutes);
// app.use('/api/v1',AccountRoutes)
app.use(errorMiddleware);

// app.use((req, res, next) => {
//   res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
//   next();
// });
app.get("/", (req, res) => {
  const filePath = path.join(__dirname, "/utils/", "template.html");
  res.sendFile(filePath);
});

app.get("/api/v1/admin/productCategory/img/:filename", (req, res) => {
  const filename = req.params.filename;
  console.log(filename);

  const filePath = path.join(__dirname, "/uploads/categoryImages", filename);
  res.sendFile(filePath);
});
app.get("/api/v1/admin/plan/img/:filename", (req, res) => {
  const filename = req.params.filename;
  console.log(filename);

  const filePath = path.join(__dirname, "/uploads/planImages", filename);
  res.sendFile(filePath);
});

app.get("/test", (req, res) => {
  const htmlResponse = `
    <html>
      <head>
        <style>
          body {
            background-color: #f2f2f2;
            height: 100%;
            font-family: Arial, sans-serif;
            display:flex;
            flex-direction: column;
            align-items:center;
            justify-content:center;
          }
          
          h1 {
            color: #333333;
            text-align: center;
          }
          p{
            color: #e65925;
            display:block;
          }
        </style>
      </head>
      <body>
        <h1>Hello! &#128075;</h1>
        <p>OneTapConnect Server</p>
      </body>
    </html>
  `; // HTML content with inline CSS

  res.send(htmlResponse);
});

// admin.initializeApp({
//   //Firebase
//   credential: admin.credential.cert(serviceAccount),
// });

app.listen(process.env.PORT, () => {
  console.log("server listening on port ", process.env.PORT);
});
