const express = require('express');
const { isAuthenticatedUser, authorizeRoles } = require("../../middleware/auth.js");
const { login,
     registerUser,
     forgotPassword, 
     resetPassword, getCompanyDetails,uploadLogo, uploadfavicon,getUsers, getUserDetails, getProfile, logout, updateTeam, updateStatus,updateUserDetails, inviteTeamMember, getinvitedUsers, signUP1, signUP2, addCardDetails, showCardDetails, updateBillingAddress, createNewTeam, updateTeamName, checkslugavailiblity,updateCompanyDetails, removeTeamFromUsers, updateCompanyDetailsInfo, checkoutHandler,googleSignUP, googleLogin, renameTeam, deleteTeam, checkcompanyurlslugavailiblity, updateCompanySlug , uploadProfilePicture} = require('../../controllers/customers/userController.js');

const router = express.Router();

router.post('/register', signUP1)
router.post('/register/step-2/:token', signUP2)
router.post('/google-sign-up',googleSignUP)
router.post('/google-login',googleLogin)
router.post('/checkout', isAuthenticatedUser,checkoutHandler)
router.post("/login", login);
router.get("/logout", logout);
router.post("/forgot/password", forgotPassword);
router.put("/reset/password/:token", resetPassword);
router.post("/register/new", registerUser);
router.get("/company/profile", isAuthenticatedUser, getCompanyDetails);
router.get("/users", isAuthenticatedUser, getUsers);
router.get("/profile", isAuthenticatedUser, getProfile);
router.get("/user/:id", isAuthenticatedUser, getUserDetails);
router.post("/user/update/:id", isAuthenticatedUser, updateUserDetails);
router.put("/user/update/team", isAuthenticatedUser, updateTeam);
router.put("/user/update/status", isAuthenticatedUser, updateStatus);
router.post("/cardDetails", isAuthenticatedUser, addCardDetails);
router.get("/showCardDetails", isAuthenticatedUser, showCardDetails);
router.post('/invite/user', isAuthenticatedUser, inviteTeamMember)
router.get('/invitedusers', isAuthenticatedUser, getinvitedUsers)
router.post("/user/update/billingAddress",isAuthenticatedUser,updateBillingAddress);
router.put("/user/update/users/team",isAuthenticatedUser, updateTeamName);
router.post('/user/create/team',isAuthenticatedUser,createNewTeam)
router.post("/user/rename/team", isAuthenticatedUser, renameTeam)
router.post("/user/delete/team", isAuthenticatedUser, deleteTeam)
router.post(
     "/upload-profile-picture/:id",
     isAuthenticatedUser,
     uploadProfilePicture
   );
   router.post(
     "/uploadlogo",
     isAuthenticatedUser,
     uploadLogo
   );
   router.post(
     "/uploadfavicon",
     isAuthenticatedUser,
     uploadfavicon
   );
// router.post('/check-availability', isAuthenticatedUser,checkslugavailiblity)
router.put("/company/update",isAuthenticatedUser,updateCompanyDetails);
router.put("/company/update/information",isAuthenticatedUser,updateCompanyDetailsInfo);
router.post('/user/remove/team',isAuthenticatedUser,removeTeamFromUsers)
router.post("/updatecompanyslug", updateCompanySlug);
router.post('/check-availability', isAuthenticatedUser,checkcompanyurlslugavailiblity)





module.exports = router;
