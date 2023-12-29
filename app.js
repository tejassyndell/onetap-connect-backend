const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const combinedRoutes = require("./routes/index.js");
const {
  webhookHandler,
} = require("./controllers/webhook/webhookController.js");
const errorMiddleware = require("./middleware/error.js");
const app = express();
const path = require("path");
const connectDatabase = require("./db/db.js");

dotenv.config();
const url = process.env.FRONTEND_URL;

// do not remove this
// stripe webhook route
app.use("/api/v1/webhook", express.raw({ type: "application/json" }));
app.post("/api/v1/webhook", webhookHandler);
// till here

app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cors({
    origin: [
      url,
      "https://www.webdev.sincprojects.com",
      "http://localhost:3000",
    ],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["set-cookie"], // Expose the Set-Cookie header
  })
);

app.get("/api/v1/profile/img/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, "/uploads/profileImages", filename);
  res.sendFile(filePath);
});
app.get("/api/v1/adminprofile/img/:filename", (req, res) => {
  const filename = req.params.filename;

  const filePath = path.join(
    __dirname,
    "/uploads/otcadminsprofileimages",
    filename
  );
  res.sendFile(filePath);
});

app.get("/api/v1/product/img/:filename", (req, res) => {
  const filename = req.params.filename;

  const filePath = path.join(__dirname, "/uploads/productImages", filename);
  res.sendFile(filePath);
});

app.get("/api/v1/admin/addons/img/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, "/uploads/addonsimages", filename);
  res.sendFile(filePath);
});
app.get("/api/v1/logo/img/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, "/uploads/logo", filename);
  res.sendFile(filePath);
});
app.get("/api/v1/favicon/img/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, "/uploads/favicon", filename);
  res.sendFile(filePath);
});
connectDatabase();

app.use("/", combinedRoutes); // use all the routes before error middleware
app.use(errorMiddleware);

app.get("/", (req, res) => {
  const filePath = path.join(__dirname, "/utils/", "template.html");
  res.sendFile(filePath);
});

app.get("/api/v1/admin/productCategory/img/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, "/uploads/categoryImages", filename);
  res.sendFile(filePath);
});
app.get("/api/v1/admin/plan/img/:filename", (req, res) => {
  const filename = req.params.filename;
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
  `; 

  res.send(htmlResponse);
});

app.listen(process.env.PORT, () => {
  console.log("server listening on port ", process.env.PORT);
});
