const express = require("express");
const router = express.Router();
const {
  testAPIS, getClients, Signup, OtcLogin, Otclogout, getOtcAdminProfile, getordersclient, getallusers, getallusersofcompany, getcompanyuserstatus, updateAddons, getAddons, createPlan , getPlans,createCategories, getCategories, getOrderssofcompany, updateTeamofuser, updateStatusofuser, updateStatusofcompany, updateClientCompanyInformation, showClientCompanyCardDetails, createCoupon, getCoupon, getUser, otcUpdateUserDetails, otc_getcompanies_share_referral_data, updateRedirectLink, AdmininviteTeamMemberByCSV , AdmininviteTeamMember, inviteTeamMembermanuallybyadmin, getinvitedUsersbyadmin, resendemailinvitationbyadmin
} = require("../../controllers/OTC-AdminController/Clients/clientsController");
const { isOtcAdminAuthenticatedUser } = require("../../middleware/OtcAdminAuth");
const { productImageUpload } = require("../../middleware/OTC-AdminProductimageUpload");
const { createProduct, imageUpload, createProductCategory } = require("../../controllers/OTC-AdminController/Clients/productController");

const {newTestAPIS} = require('../../controllers/OTC-AdminController/Clients/couponController');
const { uploadProfilePicture, uploadfavicon, uploadLogo } = require("../../controllers/customers/userController");
const { otcImageUpload } = require("../../middleware/OtcImageUpload");

router.get("/admin/test", testAPIS);
router.get("/admin/clients", getClients);
router.get("/admin/allclients", isOtcAdminAuthenticatedUser, getordersclient);
router.post("/admin/signup", Signup);
router.post("/admin/login", OtcLogin);
router.post("/admin/logout", Otclogout);
router.get("/admin/loadadmin", isOtcAdminAuthenticatedUser, getOtcAdminProfile);

router.post("/admin/product", createProduct);
router.post("/admin/productCategory/create", createCategories);
// router.post("/admin/productCategory/img" ,productImageUpload, imageUpload);
router.post("/admin/imageUpload", productImageUpload, imageUpload);
// router.post("/admin/productCategory/create", productImageUpload ,createProductCategories);
router.get("/admin/productCategory/fetch", getCategories);
router.post("/admin/imageUpload", productImageUpload, imageUpload);
router.get("/admin/users", isOtcAdminAuthenticatedUser, getallusers);
router.get("/admin/user/:id", isOtcAdminAuthenticatedUser, getUser);
router.get("/admin/company_share_referreldata/:id", isOtcAdminAuthenticatedUser, otc_getcompanies_share_referral_data);
router.get("/admin/companyusers/:id", getallusersofcompany);
router.get("/admin/getcompanyuserstatus", getcompanyuserstatus);
router.post("/admin/createproductCategory", createProductCategory);

router.post("/admin/updateAddons", updateAddons);
router.get("/admin/getAddons", getAddons);
router.post("/admin/plan/create", createPlan);
router.get("/admin/plans", getPlans);
router.post("/admin/getorderssofcompany", getOrderssofcompany);
// router.post("/admin/coupons/create", newTestAPIS);

router.get("/admin/getCoupon", getCoupon);
router.post("/admin/coupon/create", createCoupon);

router.post("/admin/user/update/team", updateTeamofuser);
router.post("/admin/user/update/status", updateStatusofuser);
router.post("/admin/company/update/status", updateStatusofcompany);
router.post("/admin/updateClientCompanyInformation", updateClientCompanyInformation);
router.post("/admin/showClientCompanyCardDetails", showClientCompanyCardDetails);
router.post("/admin/user/update/:id", otcUpdateUserDetails);
router.post(
  "/admin/upload-profile-picture/:id",
  isOtcAdminAuthenticatedUser,
  otcImageUpload,
  uploadProfilePicture
);
router.post(
  "/admin/upload-logo-picture",
  // isOtcAdminAuthenticatedUser,
  otcImageUpload,
  uploadLogo
);
router.post(
  "/admin/upload-favicon-picture",
  isOtcAdminAuthenticatedUser,
  otcImageUpload,
  uploadfavicon
);
router.post("/admin/user/update-redirect-link", updateRedirectLink);
router.post("/admin/invite/user", AdmininviteTeamMember);
router.post("/admin/invite/userByCSV", AdmininviteTeamMemberByCSV);
router.post("/admin/invite/manual", inviteTeamMembermanuallybyadmin);
router.post("/admin/getinvitedUsersbyadmin", getinvitedUsersbyadmin);
router.post("/admin/resendemailinvitationbyadmin", resendemailinvitationbyadmin);
module.exports = router;