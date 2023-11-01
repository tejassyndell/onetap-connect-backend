const catchAsyncErrors = require("../../../middleware/catchAsyncErrors.js");
const ErrorHandler = require("../../../utils/errorHandler.js");
const User = require("../../../models/NewSchemas/UserModel.js");
const UserInformation = require("../../../models/NewSchemas/users_informationModel.js");
const Product = require('../../../models/NewSchemas/ProductModel.js');
const ProductCategory = require("../../../models/NewSchemas/ProductCategoryModel.js");


exports.createProduct = catchAsyncErrors(async (req, res, next) => {
    const product = Product(req.body);
    try {
        await product.save();
        res.status(201).json({ success: true, product });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

exports.createProductCategories = catchAsyncErrors(async (req, res, next) => {
    try {
        const { productcategoryImage, id } = req.body;
        const CustomPermalinkSlug = productcategoryImage.CustomPermalink;
        let CustomPermalink = `https://onetapconnect.com/` + CustomPermalinkSlug;

        const { name, isActive, parentCategory, description, image, imageName, altText, status, Visibility, activitylog } = productcategoryImage;
console.log(id, "id")
        if (id) {
            // Editing an existing category
            console.log("if......have id")
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
                    parentCategory,
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
console.log("else....not have id new category")
            const newCategory = new ProductCategory({
                name,
                isActive,
                parentCategory,
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
    res.status(200).json({
        success: true,
        imageName: req.file.originalname,
    });
});