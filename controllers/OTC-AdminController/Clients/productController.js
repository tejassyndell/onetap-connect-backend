const catchAsyncErrors = require("../../../middleware/catchAsyncErrors.js");
const ErrorHandler = require("../../../utils/errorHandler.js");
const User = require("../../../models/NewSchemas/UserModel.js");
const UserInformation = require("../../../models/NewSchemas/users_informationModel.js");
const Product = require('../../../models/NewSchemas/ProductModel.js');
const ProductCategory = require("../../../models/NewSchemas/ProductCategoryModel.js");
const Plan = require("../../../models/NewSchemas/OtcPlanSchemaModal.js");



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
exports.createProductCategories = catchAsyncErrors(async (req, res, next) => {
    try {
        const { productcategoryImage, id } = req.body;
        const CustomPermalinkSlug = productcategoryImage.CustomPermalink;
        let CustomPermalink = `https://onetapconnect.com/` + CustomPermalinkSlug;

        const { name, isActive, categoryType, description, image, imageName, altText, status, Visibility, activitylog } = productcategoryImage;

        if (id) {
            // Editing an existing category

            const existingCategory = await ProductCategory.findById(id);
            if (!existingCategory) {
                return res.status(404).json({ success: false, message: 'Category not found' });
            }

            // Check if CustomPermalink is not changed or is unique
            if (CustomPermalink !== existingCategory.CustomPermalink) {
                const isUnique = await isCustomPermalinkUnique(CustomPermalink);
                if (!isUnique) {
                    CustomPermalink = await generateUniqueCustomPermalink(CustomPermalink);
                }
            }

            const updatedCategory = await ProductCategory.findByIdAndUpdate(
                id,
                {
                    name,
                    isActive,
                    categoryType,
                    CustomPermalink,
                    description,
                    image,
                    imageName,
                    altText,
                    status,
                    Visibility,
                    activitylog,
                },
                { new: true } // Return the updated document
            );

            res.status(200).json({ success: true, category: updatedCategory });
        } else {
            // Creating a new category
            const isUnique = await isCustomPermalinkUnique(CustomPermalink);
            if (!isUnique) {
                CustomPermalink = await generateUniqueCustomPermalink(CustomPermalink);
            }

            const newCategory = new ProductCategory({
                name,
                isActive,
                categoryType,
                CustomPermalink,
                description,
                image,
                imageName,
                altText,
                status,
                Visibility,
                activitylog,
                publishedDate: new Date()
            });
            const createdCategory = await newCategory.save();
            res.status(201).json({ success: true, category: createdCategory });
        }
    } catch (error) {
        // Handle error
        next(error);
    }
});

async function isCustomPermalinkUnique(CustomPermalink) {
    const existingCategory = await ProductCategory.findOne({ CustomPermalink });
    return !existingCategory;
}

async function generateUniqueCustomPermalink(basePermalink) {
    let uniquePermalink = basePermalink;
    let counter = 1;
    while (true) {
        const existingCategory = await ProductCategory.findOne({ CustomPermalink: uniquePermalink });
        if (!existingCategory) {
            return uniquePermalink;
        }
        // Append a counter to the base permalink to make it unique
        uniquePermalink = `${basePermalink}-${counter}`;
        counter++;
    }
}



exports.imageUpload = catchAsyncErrors(async (req, res, next) => {
    res.status(200).json({
        success: true,
        imageName: req.file.originalname,
    });
});



exports.getProductCategories = catchAsyncErrors(async (req, res, next) => {
    const ProductCategories = await ProductCategory.find()

    if (!ProductCategories) {
        return next(new ErrorHandler("No ProductCategories Found.....", 404));
    }

    res.status(200).json({
        ProductCategories,
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


exports.createPlan = catchAsyncErrors(async (req, res, next) => {
    try {
        const { planData, planFormData ,id } = req.body;

        const CustomPermalinkSlug = planFormData.CustomPermalink;
        let CustomPermalink =  CustomPermalinkSlug;
        // let CustomPermalink = `https://onetapconnect.com/` + CustomPermalinkSlug;

        const { InternalPlanName,PublicPlanName, categoryType, description, image, imageName, altText, status, Visibility, activitylog } = planFormData;
        const { planType, users, monthlyPrice_perUser, monthly_fee, monthly_sku, yearlyPrice_perUser, yearly_fee,yearly_sku} = planData

        if (id) {
            // Editing an existing category

            const existingCategory = await Plan.findById(id);
            if (!existingCategory) {
                return res.status(404).json({ success: false, message: 'Category not found' });
            }

            // Check if CustomPermalink is not changed or is unique
            if (CustomPermalink !== existingCategory.CustomPermalink) {
                const isUnique = await isCustomPermalinkUnique(CustomPermalink);
                if (!isUnique) {
                    CustomPermalink = await generateUniqueCustomPermalink(CustomPermalink);
                }
            }

            const updatedCategory = await Plan.findByIdAndUpdate(
                id,
                {InternalPlanName,PublicPlanName,categoryType,CustomPermalink,description,image,imageName,altText,status,Visibility,activitylog,planType, users, monthlyPrice_perUser, monthly_fee, monthly_sku, yearlyPrice_perUser, yearly_fee,yearly_sku},
                { new: true } // Return the updated document
            );
            res.status(200).json({ success: true, category: updatedCategory });
        } else {
            // Creating a new category
            const isUnique = await isCustomPermalinkUnique(CustomPermalink);
            if (!isUnique) {
                CustomPermalink = await generateUniqueCustomPermalink(CustomPermalink);
            }

            const newplans = new Plan({
                InternalPlanName,PublicPlanName, categoryType, CustomPermalink, description, image, imageName, altText,status, Visibility,  activitylog,publishedDate: new Date(),planType, users, monthlyPrice_perUser, monthly_fee, monthly_sku, yearlyPrice_perUser, yearly_fee,yearly_sku
            });
            const plans = await newplans.save();
            res.status(201).json({ success: true, plans });
        }
    } catch (error) {
        // Handle error
        next(error);
    }
});

async function isCustomPermalinkUnique(CustomPermalink) {
    const existingCategory = await Plan.findOne({ CustomPermalink });
    return !existingCategory;
}

async function generateUniqueCustomPermalink(basePermalink) {
    let uniquePermalink = basePermalink;
    let counter = 1;
    while (true) {
        const existingCategory = await Plan.findOne({ CustomPermalink: uniquePermalink });
        if (!existingCategory) {
            return uniquePermalink;
        }
        // Append a counter to the base permalink to make it unique
        uniquePermalink = `${basePermalink}-${counter}`;
        counter++;
    }
}

exports.getPlans = catchAsyncErrors(async (req, res, next) => {
    const Plans = await Plan.find()

    if (!Plans) {
        return next(new ErrorHandler("No Plans Found.....", 404));
    }

    res.status(200).json({
        Plans,
    });
});


