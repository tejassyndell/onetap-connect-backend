const catchAsyncErrors = require("../../../middleware/catchAsyncErrors.js");
const ErrorHandler = require("../../../utils/errorHandler.js");
const User = require("../../../models/NewSchemas/UserModel.js");
const UserInformation = require("../../../models/NewSchemas/users_informationModel.js");
const Product = require('../../../models/NewSchemas/ProductModel.js');
const ProductCategory = require("../../../models/NewSchemas/OtcCategoryModel.js");



// Create or update a product
exports.createProduct = async (req, res, next) => {
    try {

        const { dataToSend, id } = req.body;
        // console.log("Creating", _id);
        const product = dataToSend
        const {
            name,
            status,
            image,
            media,
            sku,
            stockStatus,
            quantity,
            inventory,
            shippingDate,
            height,
            width,
            length,
            weight,
            price,
            saleprice,
            category,
            Tags,
            isFeatured,
            isOnSale,
            publishedBy,
            visibility,
            activityLog,
            LinkedCoupons,
            CustomPermalink,
            producttype,
            hasVariations,
            shortDescription,
            description,
            CompatibilityInformation,
            ShippingAndReturnInformation,
            variations,
            isActive,
        } = product;

        if (id) {
            // Editing an existing product
            const existingProduct = await Product.findById(id);
            if (!existingProduct) {
                return res.status(404).json({ success: false, message: 'Product not found' });
            }

            // Update the product fields
            existingProduct.name = name;
            existingProduct.status = status;
            existingProduct.image = image;
            existingProduct.media = media;
            existingProduct.sku = sku;
            existingProduct.stockStatus = stockStatus;
            existingProduct.quantity = quantity;
            existingProduct.inventory = inventory;
            existingProduct.shippingDate = shippingDate;
            existingProduct.height = height;
            existingProduct.width = width;
            existingProduct.length = length;
            existingProduct.weight = weight;
            existingProduct.price = price;
            existingProduct.saleprice = saleprice;
            existingProduct.category = category;
            existingProduct.Tags = Tags;
            existingProduct.isFeatured = isFeatured;
            existingProduct.isOnSale = isOnSale;
            existingProduct.publishedBy = publishedBy;
            existingProduct.visibility = visibility;
            existingProduct.activityLog = activityLog;
            existingProduct.LinkedCoupons = LinkedCoupons;
            existingProduct.CustomPermalink = CustomPermalink;
            existingProduct.producttype = producttype;
            existingProduct.hasVariations = hasVariations;
            existingProduct.shortDescription = shortDescription;
            existingProduct.description = description;
            existingProduct.CompatibilityInformation = CompatibilityInformation;
            existingProduct.ShippingAndReturnInformation = ShippingAndReturnInformation;
            existingProduct.variations = variations;
            existingProduct.isActive = isActive;

            // Save the updated product
            const updatedProduct = await existingProduct.save();

            res.status(200).json({ success: true, product: updatedProduct });
        } else {
            // Creating a new product
            const newProduct = new Product({
                name,
                status,
                image,
                media,
                sku,
                stockStatus,
                quantity,
                inventory,
                shippingDate,
                height,
                width,
                length,
                weight,
                price,
                saleprice,
                category,
                Tags,
                isFeatured,
                isOnSale,
                publishedBy,
                visibility,
                activityLog,
                LinkedCoupons,
                CustomPermalink,
                producttype,
                hasVariations,
                shortDescription,
                description,
                CompatibilityInformation,
                ShippingAndReturnInformation,
                variations,
                isActive,
            });

            // Save the new product
            const createdProduct = await newProduct.save();

            res.status(201).json({ success: true, product: createdProduct });
        }
    } catch (error) {
        // Handle error
        next(error);
    }
};
exports.createProductCategory = catchAsyncErrors(async (req, res, next) => {
    try {
        const { name, isActive, parentCategory, CustomPermalink, description, featuredImage, status, Visibility, activitylog } = req.body;
        const categoryType = "Smart-accessories"
        const newCategory = new ProductCategory({
            name,
            isActive,
            parentCategory,
            CustomPermalink,
            description,
            featuredImage,
            status,
            Visibility,
            activitylog,
            categoryType,
        });
        const createdCategory = await newCategory.save();
        res.status(201).json({ category: createdCategory });
    } catch (error) {
        // Handle error
        next(error);
    }
});


exports.imageUpload = catchAsyncErrors(async (req, res, next) => {
    res.status(200).json({
        success: true,
        imageName: req.file.originalname,
    });
});




exports.imageUpload = catchAsyncErrors(async (req, res, next) => {
    const fileNames = req.fileNames;
    const fileTypes = req.body.fileType || [] // Get the "fileType" from the request body

    // Create an array of objects with name and fileType
    const imagesWithTypes = fileNames.map((name, index) => ({
        name,
        fileType: Array.isArray(fileTypes) ? fileTypes[index] : fileTypes,
        // Include the "fileType" for each image
    }));

    res.status(200).json({
        success: true,
        imageNames: imagesWithTypes,
    });
});





