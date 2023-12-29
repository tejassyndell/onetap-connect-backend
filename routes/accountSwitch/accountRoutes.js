const express = require("express");
const {
  switchAccounts,
} = require("../../controllers/customers/accountController.js");
const { isAccountAuthenticated } = require("../../middleware/switchAcAuth.js");
const router = express.Router();

// router.post('/accounts/active',isAuthenticatedUser,getActiveAccounts)
router.post("/accounts/switch", isAccountAuthenticated, switchAccounts);

module.exports = router;
