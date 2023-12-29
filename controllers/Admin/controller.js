const catchAsyncErrors = require("../../middleware/catchAsyncErrors.js");
const ErrorHandler = require("../../utils/errorHandler.js");
const Industry = require('../../models/NewSchemas/IndustriesModel.js')


exports.createIndustries = catchAsyncErrors(async (req, res, next) => {
    const industries = await Industry.create(req.body);

    if (!industries) {
        return next(new ErrorHandler("Somthing failed to create", 400))
    }

    res.status(201).json({
        success: true,
        data: industries

    })})

exports.getAllIndustries = catchAsyncErrors((async (req, res, next) => {


    const industries = await Industry.find();

    if (!industries) {
        return next(new ErrorHandler("Somthing failed to create", 400))
    }

    res.status(201).json({
        success: true,
        industries

    })}))
