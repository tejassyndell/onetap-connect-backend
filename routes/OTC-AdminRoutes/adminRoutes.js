const express = require("express");
const router = express.Router();
const {
  testAPIS, getClients,
} = require("../../controllers/OTC-AdminController/Clients/clientsController");


router.get("/admin/test", testAPIS);
router.get("/admin/clients", getClients);

module.exports = router;