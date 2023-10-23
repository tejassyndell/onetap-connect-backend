const express = require("express");
const router = express.Router();
const {
  testAPIS, getClients, Signup, Login,
} = require("../../controllers/OTC-AdminController/Clients/clientsController");


router.get("/admin/test", testAPIS);
router.get("/admin/clients", getClients);
router.post("/admin/signup", Signup);
router.post("/admin/login", Login);


module.exports = router;