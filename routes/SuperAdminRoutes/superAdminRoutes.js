const express = require('express');

const{ deleteUser, getAllCompanies, getAllRoles, getAllUsers, getRolePermissions, getSingleUserDetails, updatePermissions, updateUser, createUser } = require('../../controllers/SuperAdmin/superAdminController.js');
const { isAuthenticatedUser, authorizeRoles } = require("../../middleware/auth.js");
const { createIndustries, getAllIndustries } = require('../../controllers/Admin/controller.js');


const router = express.Router();

router.post('/admin/create/user',isAuthenticatedUser,authorizeRoles('admin'),createUser)
router.get('/roles',isAuthenticatedUser,getAllRoles)
router.get('/companies',isAuthenticatedUser,authorizeRoles('admin','manager','superAdmin'),getAllCompanies)
router.get('/user-details/:userId',isAuthenticatedUser,authorizeRoles('admin','manager','superAdmin'),getSingleUserDetails)
router.get('/all-users',isAuthenticatedUser,authorizeRoles('admin','manager','superAdmin'),getAllUsers);
router.post('/create-user');
router.delete('/delete-user/:id',isAuthenticatedUser,authorizeRoles('admin','manager','superAdmin'),deleteUser);
router.put('/update-user/:userId',isAuthenticatedUser,authorizeRoles('admin','manager','superAdmin'),updateUser);
router.post('/permissions/role',isAuthenticatedUser,getRolePermissions)
router.put('/update/permissions',isAuthenticatedUser,updatePermissions)
router.post('/industries/create',createIndustries)
router.get('/industries',getAllIndustries)



module.exports = router;