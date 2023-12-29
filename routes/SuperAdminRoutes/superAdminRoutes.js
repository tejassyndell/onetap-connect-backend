const express = require('express');

const { createIndustries, getAllIndustries } = require('../../controllers/Admin/controller.js');
const { getAllPlans, getAllSinglePlan, getAllAddOns } = require('../../controllers/Admin/PlanPackageController.js');


const router = express.Router();

router.get('/plans',getAllPlans),
router.get('/plan/:id',getAllSinglePlan),

router.get('/addons',getAllAddOns);

router.post('/industries/create',createIndustries)
router.get('/industries',getAllIndustries)



module.exports = router;