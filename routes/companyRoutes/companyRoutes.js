const express = require('express');
const { isAuthenticatedUser, authorizeRoles } = require("../../middleware/auth.js");
const { login,
     registerUser,
     forgotPassword, 
     resetPassword, getCompanyDetails, getUsers, getUserDetails, getProfile, logout, updateTeam, updateStatus,updateUserDetails, inviteTeamMember, getinvitedUsers, signUP1, signUP2, addCardDetails, showCardDetails, updateBillingAddress, createNewTeam, updateTeamName, checkslugavailiblity,updateCompanyDetails, removeTeamFromUsers} = require('../../controllers/customers/userController.js');

const router = express.Router();

router.post('/register', signUP1)
router.post('/register/step-2/:token', signUP2)
router.post("/login", login);
router.get("/logout", logout);
router.post("/forgot/password", forgotPassword);
router.put("/reset/password/:token", resetPassword);
router.post("/register/new", registerUser);
router.get("/company/profile", isAuthenticatedUser, getCompanyDetails);
router.get("/users", isAuthenticatedUser, getUsers);
router.get("/profile", isAuthenticatedUser, getProfile);
router.get("/user/:id", isAuthenticatedUser, getUserDetails);
router.put("/user/update/:id", isAuthenticatedUser, updateUserDetails);
router.put("/user/update/team", isAuthenticatedUser, updateTeam);
router.put("/user/update/status", isAuthenticatedUser, updateStatus);
router.post("/cardDetails", isAuthenticatedUser, addCardDetails);
router.get("/showCardDetails", isAuthenticatedUser, showCardDetails);
router.post('/invite/user', isAuthenticatedUser, inviteTeamMember)
router.get('/invitedusers', isAuthenticatedUser, getinvitedUsers)
router.put("/user/update/billingAddress",isAuthenticatedUser,updateBillingAddress);
router.put("/user/update/users/team",isAuthenticatedUser, updateTeamName);
router.post('/user/create/team',isAuthenticatedUser,createNewTeam)
// router.post('/check-availability', isAuthenticatedUser,checkslugavailiblity)
router.put("/company/update",isAuthenticatedUser,updateCompanyDetails);
router.post('/user/remove/team',isAuthenticatedUser,removeTeamFromUsers)






module.exports = router;
