const express = require("express");
const {
    isAuthenticatedUser,
    authorizeRoles,
} = require("../../middleware/auth");
const { 
    getUsers_info,
    save_Firebase_Token,
    get_firebase_token,
    getmessages,
} = require("../../controllers/notification/notificationController");
const router = express.Router();


router.post('/save_firebasetoken', isAuthenticatedUser, save_Firebase_Token);
router.post('/getUsers_info', isAuthenticatedUser, getUsers_info);
router.post('/send_firebase_token', isAuthenticatedUser, get_firebase_token);
router.get ('/notifications/get', isAuthenticatedUser, getmessages);

module.exports = router;