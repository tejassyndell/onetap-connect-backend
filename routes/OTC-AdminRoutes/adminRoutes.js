const express = require("express");
const router = express.Router();
const {
  testAPIS, getClients, Signup, OtcLogin, Otclogout, getOtcAdminProfile, getordersclient, getallusers, getallusersofcompany, getcompanyuserstatus, updateAddons, getAddons, createPlan , getPlans,createCategories, getCategories, getOrderssofcompany, updateTeamofuser, updateStatusofuser, updateStatusofcompany, updateClientCompanyInformation, showClientCompanyCardDetails, createCoupon, getCoupon, getUser, otcUpdateUserDetails, otc_getcompanies_share_referral_data, updateRedirectLink, GetSubscriptionDetailsForAdmin, getsubscriptiondetails, AdmininviteTeamMemberByCSV , AdmininviteTeamMember, inviteTeamMembermanuallybyadmin, getinvitedUsersbyadmin, resendemailinvitationbyadmin, getCompanyDetailsforAdmin, checkcompanyurlslugavailiblityAdminside, UpdateCompanySlugFromAdmin, UpdateCompanySettings, getsharereferalSettingsAdmin, UpdateLeadCaptureSettings, getAllOrders, updateOrders, deleteOrders, getSingleOrder, updateOrder
  ,createClient, getActiveUsersOfCompany, getTeamofCompany, updateTeamNamebyAdmin, removeTeamFromUsersByadmin, deleteteamofselectedcompany, renameteamofselectedcompany, createNewteamofselectedcompany, getAllShippingAddressofcompany, createShippingAddressofcompany, removeShippingAddressofcompany, editShippingAddressofcompany, updateuserroleofcompanyusers, updateuserplanonrolechangeofcompany, fetchbillingaddressofcompany, updateBillingAddressofcompany, getallcompanynames, otcadminusers, addAdminUser, updateAdminUser,getcompanyorders, GetorderByCompanyIDandOrderNumber, saveclientTags, getclienttags
,sendOrderInvoice,createPassword,addreferer, getreferer, getauser , createAdminTeam , getAdminTeam , deleteAdminTeam , adminRenameTeam , addUserTeam , removeUserTeam , mockdata} = require("../../controllers/OTC-AdminController/Clients/clientsController");
const { isOtcAdminAuthenticatedUser } = require("../../middleware/OtcAdminAuth");
const { productImageUpload } = require("../../middleware/OTC-AdminProductimageUpload");
const { createProduct, imageUpload, createProductCategory } = require("../../controllers/OTC-AdminController/Clients/productController");

const { newTestAPIS } = require('../../controllers/OTC-AdminController/Clients/couponController');
const { uploadProfilePicture, uploadfavicon, uploadLogo } = require("../../controllers/customers/userController");
const { otcImageUpload,  deleteimageupload } = require("../../middleware/OtcImageUpload");

router.get("/admin/mockdata", mockdata);
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
router.get("/admin/getaUser/:email", getauser);
router.get("/admin/user/:id", isOtcAdminAuthenticatedUser, getUser);
router.get(
  "/admin/company_share_referreldata/:id",
  isOtcAdminAuthenticatedUser,
  otc_getcompanies_share_referral_data
);
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
router.post(
  "/admin/updateClientCompanyInformation",
  updateClientCompanyInformation
);
router.post(
  "/admin/showClientCompanyCardDetails",
  showClientCompanyCardDetails
);
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
router.post(
  "/admin/GetSubscriptionDetailsForAdmin",
  GetSubscriptionDetailsForAdmin
);
router.post("/admin/SubsciptiondetialsofiD", getsubscriptiondetails);

router.post("/admin/invite/user", AdmininviteTeamMember);
router.post("/admin/invite/userByCSV", AdmininviteTeamMemberByCSV);
router.post("/admin/invite/manual", inviteTeamMembermanuallybyadmin);
router.post("/admin/getinvitedUsersbyadmin", getinvitedUsersbyadmin);
router.post(
  "/admin/resendemailinvitationbyadmin",
  resendemailinvitationbyadmin
);

router.post("/admin/createclient", createClient);
router.get("/admin/getActiveUSers", getActiveUsersOfCompany);

router.get("/admin/orders", isOtcAdminAuthenticatedUser, getAllOrders);
router.post("/admin/orders/update", isOtcAdminAuthenticatedUser, updateOrders);
router.post("/admin/orders/delete", isOtcAdminAuthenticatedUser, deleteOrders);
router.get("/admin/order/:id", isOtcAdminAuthenticatedUser, getSingleOrder);
router.post(
  "/admin/order/update/:id",
  isOtcAdminAuthenticatedUser,
  updateOrder
);
router.post("/admin/getCompanyDetailsforAdmin", getCompanyDetailsforAdmin);
router.post(
  "/admin/check-availability",
  checkcompanyurlslugavailiblityAdminside
);
router.post("/admin/UpdateCompanySlug", UpdateCompanySlugFromAdmin);
router.post("/admin/UpdateCompanySettings", UpdateCompanySettings);
router.post(
  "/admin/getsharereferalSettingsAdmin",
  getsharereferalSettingsAdmin
);
router.post("/admin/UpdateLeadCaptureSettings", UpdateLeadCaptureSettings);
router.post("/admin/getTeamofCompany", getTeamofCompany);
router.post("/admin/updateTeamNamebyAdmin", updateTeamNamebyAdmin);
router.post("/admin/removeTeamFromUsersByadmin", removeTeamFromUsersByadmin);
router.post("/admin/deleteteamofselectedcompany", deleteteamofselectedcompany);
router.post("/admin/renameteamofselectedcompany", renameteamofselectedcompany);
router.post(
  "/admin/createNewteamofselectedcompany",
  createNewteamofselectedcompany
);
router.post(
  "/admin/getAllShippingAddressofcompany",
  getAllShippingAddressofcompany
);
router.post(
  "/admin/createShippingAddressofcompany",
  createShippingAddressofcompany
);
router.post(
  "/admin/removeShippingAddressofcompany/:addressId",
  removeShippingAddressofcompany
);
router.post(
  "/admin/editShippingAddressofcompany/:editAddressId",
  editShippingAddressofcompany
);
router.post(
  "/admin/updateuserroleofcompanyusers",
  updateuserroleofcompanyusers
);
router.post(
  "/admin/updateuserplanonrolechangeofcompany",
  updateuserplanonrolechangeofcompany
);
router.post(
  "/admin/fetchbillingaddressofcompany",
  fetchbillingaddressofcompany
);
router.post(
  "/admin/updateBillingAddressofcompany",
  updateBillingAddressofcompany
);
router.post("/admin/getallcompanynames", getallcompanynames);

router.get("/admin/otc_adminusers", otcadminusers);
router.post("/admin/otc_addAdminUser", addAdminUser);
router.post("/admin/otc_updateAdminUser/:userId", updateAdminUser);
router.post("/admin/getOrders", getcompanyorders);
router.post("/admin/getorderbyidandnumber", GetorderByCompanyIDandOrderNumber);
router.post("/admin/send-order-invoice", sendOrderInvoice);
router.post("/admin/savetag", saveclientTags);
router.post("/admin/getclienttags", getclienttags);
router.post("/admin/addreferer", addreferer);
router.post("/admin/getreferer", getreferer);
router.post("/admin/create-team", createAdminTeam);
router.get("/admin/teamdata", getAdminTeam);
router.post("/admin/delete-team", deleteAdminTeam);
router.post("/admin/rename-team", adminRenameTeam);
router.post("/admin/adduser-team", addUserTeam);
router.post("/admin/remove-user-team", removeUserTeam);
router.delete('/admin/imagedelete/:filename',deleteimageupload);
router.post('/admin/createPassword', createPassword);
module.exports = router;
