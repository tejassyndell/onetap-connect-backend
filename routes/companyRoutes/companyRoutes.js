const express = require('express');
const { isAuthenticatedUser, authorizeRoles } = require("../../middleware/auth.js");
const { login,
     registerUser,
     forgotPassword, 
     resetPassword, getCompanyDetails, getUsers,uploadLogo, uploadfavicon, getUserDetails, getProfile, logout, updateTeam, updateStatus,updateUserDetails, inviteTeamMember, getinvitedUsers, signUP1, signUP2, addCardDetails, showCardDetails, updateBillingAddress, createNewTeam, updateTeamName, checkslugavailiblity,updateCompanyDetails, removeTeamFromUsers, updateCompanyDetailsInfo, checkoutHandler,googleSignUP, googleLogin, renameTeam, deleteTeam, checkcompanyurlslugavailiblity, updateCompanySlug, updateAutoRenewal, inviteTeamMemberByCSV,  uploadProfilePicture,
     addTeamMemberManually,
     deleteCardDetails,
     fetchCardDetails,
     updateCardDetails, createShippingAddress, invitedUserGoogleSignup, registerInvitedUser, invitedUser, getcompanies_share_referral_datas, updatecompany_referral_data,deleteInvitedUser} = require('../../controllers/customers/userController.js');

const router = express.Router();

router.post('/register', signUP1)
router.post('/register/step-2/:token', signUP2)
router.post('/google-sign-up',googleSignUP)
router.post('/google-login',googleLogin)
router.post('/checkout', isAuthenticatedUser,checkoutHandler)
router.post("/login", login);
router.post("/logout", logout);
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
router.post("/updateCardDetails/:id", isAuthenticatedUser, updateCardDetails);
router.get("/showCardDetails", isAuthenticatedUser, showCardDetails);
router.get("/fetchCardDetails/:id", isAuthenticatedUser, fetchCardDetails);
router.post("/deleteCardDetails/:id", isAuthenticatedUser, deleteCardDetails);
router.post('/invite/user', isAuthenticatedUser, inviteTeamMember);
router.delete('/invited-users/:invitedUserID', deleteInvitedUser);

// router.post('/add/member/manually',isAuthenticatedUser,addTeamMemberManually);

router.get('/invitedusers', isAuthenticatedUser, getinvitedUsers)
router.post("/update/billingAddress",isAuthenticatedUser,updateBillingAddress);
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
router.post("/update-AutoRenewal", isAuthenticatedUser,updateAutoRenewal);
router.post('/invite/userByCSV', isAuthenticatedUser, inviteTeamMemberByCSV)
router.get('/company_share_referreldata', isAuthenticatedUser, getcompanies_share_referral_datas)
router.post("/updatecompany_referral_data", isAuthenticatedUser,updatecompany_referral_data);
router.post('/user/shippingAddress/add', isAuthenticatedUser, createShippingAddress)
router.post('/invited/user', invitedUser)
router.post('/invited/register-user', registerInvitedUser)
router.post('/invited/google-sign-up', invitedUserGoogleSignup)




module.exports = router;
