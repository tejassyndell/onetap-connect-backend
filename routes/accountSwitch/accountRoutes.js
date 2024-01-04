const express = require('express');
const { isAuthenticatedUser, authorizeRoles } = require("../../middleware/auth.js");
const { getActiveAccounts, switchAccounts } = require('../../controllers/customers/accountController.js')
const { isAccountAuthenticated } = require('../../middleware/switchAcAuth')
const router = express.Router();

router.post('/accounts/active', getActiveAccounts)
router.post('/accounts/switch', switchAccounts)

module.exports = router;