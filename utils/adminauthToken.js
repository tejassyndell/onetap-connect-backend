const sendOtcToken = (user, statusCode, res) => {
  const otctoken = user.getJWTToken();
  const option = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  res.status(statusCode).cookie("otctoken", otctoken, option).json({
    success: true,
    user,
    otctoken,
  });
};

module.exports = sendOtcToken;
