const catchAsyncErrors = require("../../../middleware/catchAsyncErrors.js");
const ErrorHandler = require("../../../utils/errorHandler.js");
const User = require("../../../models/NewSchemas/UserModel.js");
const UserInformation = require("../../../models/NewSchemas/users_informationModel.js");
const Product = require('../../../models/NewSchemas/ProductModel.js');

exports.createProduct = catchAsyncErrors(async (req, res, next) => {
    const product = Product(req.body); 
    try {
        await product.save();
        res.status(201).json({ success: true, product });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

