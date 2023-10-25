const express = require("express");
const router = express.Router();
const {
  testAPIS, getClients, Signup, OtcLogin, Otclogout, getOtcAdminProfile,
} = require("../../controllers/OTC-AdminController/Clients/clientsController");
const { isOtcAdminAuthenticatedUser } = require("../../middleware/OtcAdminAuth");


router.get("/admin/test", testAPIS);
router.get("/admin/clients", getClients);
router.post("/admin/signup", Signup);
router.post("/admin/login", OtcLogin);
router.post("/admin/logout", Otclogout);
router.get("/admin/loadadmin", isOtcAdminAuthenticatedUser ,getOtcAdminProfile);


module.exports = router;