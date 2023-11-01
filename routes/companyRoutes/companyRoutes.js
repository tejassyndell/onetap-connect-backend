const express = require("express");
const {
  isAuthenticatedUser,
  authorizeRoles,
} = require("../../middleware/auth.js");
const {
  login,
  registerUser,
  forgotPassword,
  resetPassword,
  getCompanyDetails,
  getUsers,
  uploadLogo,
  uploadfavicon,
  getUserDetails,
  getProfile,
  logout,
  updateTeam,
  updateStatus,
  updateUserDetails,
  inviteTeamMember,
  getinvitedUsers,
  signUP1,
  signUP2,
  addCardDetails,
  showCardDetails,
  updateBillingAddress,
  createNewTeam,
  updateTeamName,
  checkslugavailiblity,
  updateCompanyDetails,
  removeTeamFromUsers,
  updateCompanyDetailsInfo,
  checkoutHandler,
  googleSignUP,
  googleLogin,
  renameTeam,
  deleteTeam,
  checkcompanyurlslugavailiblity,
  updateCompanySlug,
  updateAutoRenewal,
  inviteTeamMemberByCSV,
  uploadProfilePicture,
  addTeamMemberManually,
  deleteCardDetails,
  fetchCardDetails,
  updateCardDetails,
  createShippingAddress,
  invitedUserGoogleSignup,
  registerInvitedUser,
  invitedUser,
  getcompanies_share_referral_datas,
  updatecompany_referral_data,
  deleteInvitedUser,
  getAllShippingAddress,
  removeShippingAddress,
  editShippingAddress,
  resendemailinvitation,
  rejectInvitation,
  fetchBillingAddress,
  getUserInformation,
  getcompanies_share_referral_data,
  getTeam,
  updateUserInformation,
  getUserinfoDetails,
  updateUserRole,
  removeUserRole,
  checkurlslugavailiblity,
  inviteTeamMembermanually,
  uploadImage,
  saveuserdata,
  savecompanydata,
  deleteuser,
  checkoutHandlerFree,
  saveuserinfodata,
  guestcheckoutHandler,
  verifypassword,
  verifyRecoveryToken,
  createOrder,
  requestToManagerForUpdateUserInfo,
  getProfileimage,
  updateUserPlanonRoleChange,
  updateUserStatus,
  generateotp,
  verifyotp,
  google_verify_recover_account,
  getunique_slug,
  accountSetupsteps,
  CancelInvitedUser,
  getcompanies,
  // Testapidummy
} = require("../../controllers/customers/userController.js");
const {
  imageUpload,
  deleteProfileImage,
  deleteLogoImage,
  deleteFaviconImage,
} = require("../../middleware/imageUpload");
const { imageinviteUpload } = require("../../middleware/inviteimgupload.js");

const router = express.Router();

router.post("/register", signUP1);
router.post("/register/step-2/:token", signUP2);
router.post("/google-sign-up", googleSignUP);
router.post("/google-login", googleLogin);
router.post("/checkout", isAuthenticatedUser, checkoutHandler);
router.post("/guest_checkout", guestcheckoutHandler);
router.post("/checkout/free", isAuthenticatedUser, checkoutHandlerFree);
router.post("/login", login);
router.post("/logout", logout);
router.post("/forgot/password", forgotPassword);
router.put("/reset/password/:token", resetPassword);
router.post("/register/new", registerUser);
router.get("/company/profile", isAuthenticatedUser, getCompanyDetails);
router.get("/users", isAuthenticatedUser, getUsers);
router.get("/userInformation", isAuthenticatedUser, getUserInformation);
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
router.post("/invite/user", isAuthenticatedUser, inviteTeamMember);
router.delete("/invited-users/:invitedUserID", deleteInvitedUser);
router.post("/user/teamdata", isAuthenticatedUser, getTeam);

// router.post('/add/member/manually',isAuthenticatedUser,addTeamMemberManually);

router.get("/invitedusers", isAuthenticatedUser, getinvitedUsers);
router.post(
  "/update/billingAddress",
  isAuthenticatedUser,
  updateBillingAddress
);
router.get("/fetchbillingAddress", isAuthenticatedUser, fetchBillingAddress);
router.post("/user/update/users/team", isAuthenticatedUser, updateTeamName);
router.post("/user/create/team", isAuthenticatedUser, createNewTeam);
router.post("/user/rename/team", isAuthenticatedUser, renameTeam);
router.post("/user/delete/team", isAuthenticatedUser, deleteTeam);
router.post(
  "/update/billingAddress",
  isAuthenticatedUser,
  updateBillingAddress
);
router.put("/user/update/users/team", isAuthenticatedUser, updateTeamName);
router.post("/user/create/team", isAuthenticatedUser, createNewTeam);
router.post("/user/rename/team", isAuthenticatedUser, renameTeam);
router.post("/user/delete/team", isAuthenticatedUser, deleteTeam);
router.post(
  "/upload-profile-picture/:id",
  isAuthenticatedUser,
  imageUpload,
  uploadProfilePicture
);
router.delete("/deleteProfileImage/:avatarFileName", deleteProfileImage);
router.delete("/deleteLogoImage/:logoFileName", deleteLogoImage);
router.delete("/deleteFaviconImage/:faviconFileName", deleteFaviconImage);
router.post("/uploadlogo", isAuthenticatedUser, imageUpload, uploadLogo);
router.post("/uploadfavicon", isAuthenticatedUser, imageUpload, uploadfavicon);
// router.post('/check-availability', isAuthenticatedUser,checkslugavailiblity)
router.put("/company/update", isAuthenticatedUser, updateCompanyDetails);
router.put(
  "/company/update/information",
  isAuthenticatedUser,
  updateCompanyDetailsInfo
);
router.post("/user/remove/team", isAuthenticatedUser, removeTeamFromUsers);
router.post("/updatecompanyslug", updateCompanySlug);
router.post(
  "/check-availability",
  isAuthenticatedUser,
  checkcompanyurlslugavailiblity
);
router.post(
  "/checkslug-availability",
  isAuthenticatedUser,
  checkurlslugavailiblity
);
router.post("/update-AutoRenewal", isAuthenticatedUser, updateAutoRenewal);
router.post("/invite/userByCSV", isAuthenticatedUser, inviteTeamMemberByCSV);

router.get(
  "/company_share_referreldata",
  isAuthenticatedUser,
  getcompanies_share_referral_data
);
router.put(
  "/updatecompany_referral_data",
  isAuthenticatedUser,
  updatecompany_referral_data
);

router.post(
  "/user/shippingAddress/add",
  isAuthenticatedUser,
  createShippingAddress
);
router.post("/invited/user", invitedUser);
router.post("/invited/register-user", registerInvitedUser);
router.post("/invited/google-sign-up", invitedUserGoogleSignup);
router.post("/reinviteuser", isAuthenticatedUser, resendemailinvitation);
router.post("/reject-invitation/:invitationToken", rejectInvitation);
// router.get("/user/shippingAddresses",isAuthenticatedUser, getAllShippingAddress)
router.get(
  "/user/all/shippingAddresses",
  isAuthenticatedUser,
  getAllShippingAddress
);
router.delete(
  "/user/shippingAddress/remove/:addressId",
  isAuthenticatedUser,
  removeShippingAddress
);
router.post(
  "/shippingAddress/edit/:editAddressId",
  isAuthenticatedUser,
  editShippingAddress
);
router.post("/user/teamdata", isAuthenticatedUser, getTeam);
router.post("/update-user-information/:id", updateUserInformation);
router.get("/get-user-information/:id", getUserinfoDetails);
router.post("/user/updatelogin", isAuthenticatedUser, updateUserStatus);
router.post("/user/updaterole", isAuthenticatedUser, updateUserRole);
router.post("/user/updateplanonrolechange", isAuthenticatedUser, updateUserPlanonRoleChange);

// router.post("/user/removeRole", isAuthenticatedUser, removeUserRole);
router.post( "/users/add-manual-user",isAuthenticatedUser,inviteTeamMembermanually);
router.post("/users/image-upload", imageinviteUpload, uploadImage);
router.post("/save_user_data/:id", isAuthenticatedUser, saveuserdata);
router.post("/save_company_data", isAuthenticatedUser, savecompanydata);
router.post("/save_userinfo_data/:id", isAuthenticatedUser, saveuserinfodata);
// router.delete('/deleteuser', isAuthenticatedUser, deleteuser)
// router.post('/verifyPassword', isAuthenticatedUser, verifypassword);
router.post('/recover_account', verifyRecoveryToken)
router.post("/reqmanger", isAuthenticatedUser, requestToManagerForUpdateUserInfo); 
// router.delete("/deleteuser", isAuthenticatedUser, deleteuser);
router.get('/getProfileimages', isAuthenticatedUser, getProfileimage);
router.post('/generate-otp', isAuthenticatedUser, generateotp )
router.post('/verify-otp',  verifyotp) 
router.post('/google_acc_recover',google_verify_recover_account)
router.get('/user_slugs', isAuthenticatedUser, getunique_slug)

router.post('/update_accountSetupsteps', isAuthenticatedUser ,accountSetupsteps)
router.post('/cancel_invitation', isAuthenticatedUser ,CancelInvitedUser)
router.get("/getallcompanies", isAuthenticatedUser, getcompanies);  
// router.post('/testapii' ,Testapidummy)
module.exports = router;
