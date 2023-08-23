const express = require('express');
const { isAuthenticatedUser, authorizeRoles } = require("../../middleware/auth.js");
const { login, registerUser, forgotPassword, resetPassword, getCompanyDetails, getUsers, getUserDetails, getProfile, logout, updateTeam, updateStatus, inviteTeamMember, getinvitedUsers } = require('../../controllers/customers/userController.js');

const router = express.Router();


router.post('/login',login)
router.get('/logout',logout)
router.post('/forgot/password',forgotPassword)
router.put('/reset/password/:token',resetPassword)
router.post('/register/new',registerUser)
router.get('/company/profile',isAuthenticatedUser,getCompanyDetails);
router.get('/users',isAuthenticatedUser,getUsers)
router.get('/invitedusers',isAuthenticatedUser,getinvitedUsers)
router.get('/profile',isAuthenticatedUser,getProfile)
router.get('/user/:id',isAuthenticatedUser,getUserDetails)
router.put('/user/update/team',isAuthenticatedUser,updateTeam)
router.put('/user/update/status',isAuthenticatedUser,updateStatus)
router.post('/invite/user',isAuthenticatedUser,inviteTeamMember)

module.exports = router;