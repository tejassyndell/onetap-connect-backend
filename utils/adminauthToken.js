const sendOtcToken = (user, statusCode, res) => {
    console.log(user,"==========================")
      const otctoken = user.getJWTToken();
  console.log(otctoken)
      //options for cookies
  
      const option = {
          expires: new Date(
              Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
          ),
          httpOnly: true,
      };
  
      res.status(statusCode).cookie('otctoken', otctoken, option).json({
          success: true,
          user,
          otctoken,
      });
  };
  
  module.exports = sendOtcToken;

  