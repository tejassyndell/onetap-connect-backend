const ErrorHandler = require("../utils/errorHandler");


const errorMiddleware = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  console.log(err)

  // Wrong Mongodb Id error
  if (err.name === "CastError") {
    const message = `Resource not found. Invalid: ${err.path}`;
    err = new ErrorHandler(message, 400);
  }

  if (err.code === 11000) {
    const message = `This email is already in use`;
    err = new ErrorHandler(message, 400);
  }

  // Wrong JWT error
  if (err.name === "JsonWebTokenError") {
    const message = `Json Web Token is invalid, Try again `;
    err = new ErrorHandler(message, 400);
  }

  // JWT EXPIRE error
  if (err.name === "TokenExpiredError") {
    const message = `Json Web Token is Expired, Try again `;
    err = new ErrorHandler(message, 400);
  }

  if(err.code === "ENOENT"){
    const message = "Image not found"
    err = new ErrorHandler(message, 404);

  }


// Other error handlers
  res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};

module.exports =  errorMiddleware