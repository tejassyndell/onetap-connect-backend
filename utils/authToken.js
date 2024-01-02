const jwt = require('jsonwebtoken');


const extractDigits = (number) => {
    const numberString = number.toString();
    const firstTwoDigits = numberString.slice(0, 2);
    const middleTwoDigits = numberString.slice(Math.max(0, numberString.length - 3), -1);
    const lastTwoDigits = numberString.slice(-2);
    return `${firstTwoDigits}${middleTwoDigits}${lastTwoDigits}`;
};


const sendToken = (req,user, statusCode, res) => {
    console.log(user, "JJJJJ")
    const token = user.getJWTToken();
    const secretUserID = extractDigits(user.id);
    const userID = user.id;

    const jwtPayload = {
        secretUserID,
    };
    const userIDpayLoad = {
        userID,
    };

    // Options for cookies
    const cookieOptions = {
        expires: new Date(
            Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
    };

    const userCookie = jwt.sign(jwtPayload, process.env.JWT_SECRET);
    const encryptedUserID = jwt.sign(userIDpayLoad, process.env.JWT_SECRET);
     
    
    res
    .status(statusCode)
    .cookie(`token_${secretUserID}`, token, cookieOptions)
    .cookie('combinedId', userCookie, cookieOptions)
    .cookie('active_account', encryptedUserID, cookieOptions)
    .json({
        success: true,
        user,
        token,
        encryptedUserID
    });
};

module.exports = sendToken;
