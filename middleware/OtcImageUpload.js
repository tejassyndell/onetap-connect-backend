const multer = require("multer");
const User = require("../models/NewSchemas/UserModel");
const Company = require("../models/NewSchemas/Company_informationModel.js");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const catchAsyncErrors = require("./catchAsyncErrors");
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: {
        fieldSize: 1024 * 1024 * 5, // 5MB for base64 data
        fileSize: 1024 * 1024 * 10, // 10MB for the entire request (adjust as needed)
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/svg+xml",
            "image/jpg",
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true); // Accept the file
        } else {
            // Reject the file with an error message
            cb(new Error("Please select an image to upload."), false);
        }
    },
}).single("image");
const getImageExtensionFromBase64 = (base64Data) => {
    const mimeRegex = /^data:image\/([a-zA-Z]+);base64,/;
    const match = base64Data.match(mimeRegex);

    if (match && match[1]) {
        return match[1];
    }

    // Default to a specific extension (e.g., "png") if not found
    return "png";
};
const saveImageToFolder = async (imageType, imageData) => {
    let fileNamePrefix;

    if (imageType === "profile") {
        fileNamePrefix = "profile-image-";
    } else if (imageType === "logo") {
        fileNamePrefix = "logo-";
    } else if (imageType === "favicon") {
        console.log("called favicon");
        fileNamePrefix = "favicon-";
    } else {
        throw new Error("Invalid image type");
    }

    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const imageExtension = getImageExtensionFromBase64(imageData);
    const fileName = `${fileNamePrefix}${uniqueSuffix}.${imageExtension}`; // Assume PNG format

    let folderPath = "";

    if (imageType === "profile") {
        folderPath = "../uploads/profileImages";
    } else if (imageType === "logo") {
        folderPath = "../uploads/logo";
    } else if (imageType === "favicon") {
        folderPath = "../uploads/favicon";
    } else {
        throw new Error("Invalid image type");
    }

    const destinationPath = path.join(__dirname, folderPath, fileName);

    await saveBase64Image(imageData, destinationPath);

    return fileName;
};

const saveBase64Image = async (base64Data, filePath) => {
    try {
        // Remove the data URL prefix (e.g., "data:image/png;base64,")
        const base64ImageWithoutPrefix = base64Data.replace(
            /^data:image\/(jpeg|png|jpg);base64,/,
            ""
        );

        // Create a Buffer from the base64 image
        const imageBuffer = Buffer.from(base64ImageWithoutPrefix, "base64");

        // Ensure the directory exists
        const directory = path.dirname(filePath);
        fs.mkdirSync(directory, { recursive: true });

        // Write the Buffer data to a file
        fs.writeFileSync(filePath, imageBuffer);

        console.log("Image saved successfully:", filePath);
    } catch (error) {
        console.error("Error saving the image:", error);
        throw error;
    }
};
const saveimageDatabase = async (type, userID, companyID, imagePath) => {
    const company = await Company.findById(companyID);
    if (type === "logo") {
        const oldLogoPath = company.logopath;
        console.log("oldLogoPath");
        console.log(oldLogoPath);
        console.log("oldLogoPath");

        if (oldLogoPath) {
            const filePath = path.join(
                __dirname,
                "..",
                "uploads",
                "logo",
                oldLogoPath
            );
            console.log("Deleting file at path:", filePath);
            fs.unlink(filePath, (unlinkErr) => {
                if (unlinkErr) {
                    console.error("Error deleting old logo:", unlinkErr);
                }
            });
        }
        const updatedCompany = await Company.findByIdAndUpdate(
            companyID,
            { logopath: imagePath },
            { new: true }
        );
    } else if (type === "favicon") {
        const oldfaviconPath = company.fav_icon_path;
        console.log(oldfaviconPath);

        const filePath = path.join(
            __dirname,
            "..",
            "uploads",
            "favicon",
            oldfaviconPath
        );

        if (oldfaviconPath) {
            // Remove the old favicon file from the storage folder
            fs.unlink(filePath, (unlinkErr) => {
                if (unlinkErr) {
                    console.error("Error deleting old favicon:", unlinkErr);
                }
            });
        }

        const updatedCompany = await Company.findByIdAndUpdate(
            companyID,
            { fav_icon_path: imagePath },
            { new: true }
        );
    } else if (type === "profile") {
        const removeuser = await User.findById({ _id: userID });
        const oldAvatarPath = removeuser.avatar;

        if (oldAvatarPath) {
            const filePath = path.join(
                __dirname,
                "..",
                "uploads",
                "profileImages",
                oldAvatarPath
            );
            fs.unlink(filePath, (unlinkErr) => {
                if (unlinkErr) {
                    console.error("Error deleting old profile picture:", unlinkErr);
                }
            });
        }
        const updatedUser = await User.findByIdAndUpdate(
            userID,
            { avatar: imagePath },
            { new: true }
        );
    }
};

exports.otcImageUpload = (req, res, next) => {
    console.log("called");

    upload(req, res, async (err) => {
        if (err) {
            return res
                .status(400)
                .json({ message: "Error uploading file", error: err });
        }

        let base64ImageData;

        if (req.file && req.file.buffer) {
            // If a file is uploaded
            base64ImageData = req.file.buffer.toString("base64");
            console.log("base34");
        } else if (req.body.image) {
            // If base64 image data is provided in req.body.image
            base64ImageData = req.body.image;
            console.log("image");
        } else {
            return res
                .status(400)
                .json({ message: "No image or base64 data provided." });
        }

        try {
            const { imageType } = req.body;
            const { id } = req.params;
            let companyID;
       
                const user = await User.find({ _id: id})
          

                companyID = user.companyID
          

            const uploadedFileName = req.file ? req.file.filename : null;

            let base64FileName;
            if (imageType === "profile") {
                base64FileName = await saveImageToFolder("profile", base64ImageData);
            } else if (imageType === "logo") {
                base64FileName = await saveImageToFolder("logo", base64ImageData);
            } else if (imageType === "favicon") {
                base64FileName = await saveImageToFolder("favicon", base64ImageData);
            } else {
                throw new Error("Invalid image type");
            }
            saveimageDatabase(imageType, id, companyID, base64FileName);
            req.base64FileName = base64FileName; // Add this line
            console.log(base64FileName);

            req.file = {
                buffer: null,
                mimetype: "image/jpeg", // Assuming PNG format
                originalname: uploadedFileName || base64FileName,
                avatar: uploadedFileName || base64FileName,
            };
            // console.log(updatedCompany)

            next();
        } catch (error) {
            return res
                .status(500)
                .json({ message: "Internal server error", error: error.message });
        }
    });
};

