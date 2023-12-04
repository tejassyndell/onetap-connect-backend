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
    setnotifystatus,
    deleteallNotify,
} = require("../../controllers/notification/notificationController");
const router = express.Router();


router.post('/notifications/save_firebasetoken', isAuthenticatedUser, save_Firebase_Token);
router.post('/notifications/getUsers_info', isAuthenticatedUser, getUsers_info);
router.post('/notifications/send_firebase_token', isAuthenticatedUser, get_firebase_token);
router.get ('/notifications/get', isAuthenticatedUser, getmessages);
router.post('/notifications/setnotiystats', isAuthenticatedUser, setnotifystatus);
router.post('/notifications/deleteAllNotifications', isAuthenticatedUser, deleteallNotify)

module.exports = router;