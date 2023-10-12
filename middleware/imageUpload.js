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
// const saveImageToFolder = async (imageType, imageData, uploadedFileName) => {
//   let fileNamePrefix;

//   if (imageType === "profile") {
//     fileNamePrefix = "profile-image-";
//   } else if (imageType === "logo") {
//     fileNamePrefix = "logo-";
//   } else if (imageType === "favicon") {
//     console.log("called favicon");
//     fileNamePrefix = "favicon-";
//   } else {
//     throw new Error("Invalid image type");
//   }

//   const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);

//   // Extract the file extension from the uploaded file name
//   // const fileExtension = path.extname(uploadedFileName);

//   const fileName = `${fileNamePrefix}${uniqueSuffix}.png`;

//   let folderPath = "";

//   if (imageType === "profile") {
//     folderPath = "../uploads/profileImages";
//   } else if (imageType === "logo") {
//     folderPath = "../uploads/logo";
//   } else if (imageType === "favicon") {
//     folderPath = "../uploads/favicon";
//   } else {
//     throw new Error("Invalid image type");
//   }

//   const destinationPath = path.join(__dirname, folderPath, fileName);

//   try {
//     // Remove the data URL prefix (e.g., "data:image/png;base64,")
//     const base64ImageWithoutPrefix = imageData.replace(
//       /^data:image\/(jpeg|png|jpg);base64,/,
//       ""
//     );

//     // Create a Buffer from the base64 image
//     const imageBuffer = Buffer.from(base64ImageWithoutPrefix, "base64");

//     // Compress the image using sharp
//     const compressedImageBuffer = await sharp(imageBuffer)
//       .resize({ width: 300 }) // Set the desired width (adjust as needed)
//       .toBuffer();

//     // Ensure the directory exists
//     const directory = path.dirname(destinationPath);
//     fs.mkdirSync(directory, { recursive: true });

//     // Write the compressed Buffer data to a file
//     fs.writeFileSync(destinationPath, compressedImageBuffer);

//     console.log("Image saved successfully:", destinationPath);

//     return fileName;
//   } catch (error) {
//     console.error("Error saving the image:", error);
//     throw error;
//   }
// };
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

// const getImageDimensionsFromBuffer = async (imageData) => {
//   const base64ImageWithoutPrefix = imageData.replace(
//     /^data:image\/(jpeg|png|jpg);base64,/,
//     ""
//   );

//   try {
//     const imageBuffer = Buffer.from(base64ImageWithoutPrefix, "base64");
//     const { width, height } = await sharp(imageBuffer, {
//       format: "jpeg",
//     }).metadata(); // Change 'jpeg' to the appropriate format
//     console.log("Image dimensions:", { width, height });
//     return { width, height };
//   } catch (error) {
//     console.error("Error getting image dimensions:", error);
//     throw error;
//   }
// };

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

exports.imageUpload = (req, res, next) => {
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
      const { companyID } = req.user;
      const { id } = req.params;
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

exports.deleteProfileImage = async (req, res, next) => {
  try {
    const avatarFileName = req.params.avatarFileName;
    const avatarPath = path.join(__dirname, '..', 'uploads', 'profileImages', avatarFileName);

    // Check if the avatar file exists
    if (fs.existsSync(avatarPath)) {
      // Delete the file
      fs.unlinkSync(avatarPath);

      // Update the User's avatar field in the database
      await User.findOneAndUpdate({ avatar: avatarFileName }, { avatar: '' });

      res.status(200).json({ message: 'Avatar deleted successfully.' });
    } else {
      res.status(404).json({ message: 'Avatar not found.' });
    }
  } catch (error) {
    console.error('Error deleting avatar:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

exports.deleteLogoImage = async (req, res, next) => {
  try {
    const logoFileName = req.params.logoFileName;
    const logoPath = path.join(__dirname, '..', 'uploads', 'logo', logoFileName);

    // Check if the Logo file exists
    if (fs.existsSync(logoPath)) {
      // Delete the file
      fs.unlinkSync(logoPath);

      // Update the User's Logo field in the database
      await Company.findOneAndUpdate({ logopath: logoFileName }, { logopath: '' });

      res.status(200).json({ message: 'Logo deleted successfully.' });
    } else {
      res.status(404).json({ message: 'Logo not found.' });
    }
  } catch (error) {
    console.error('Error deleting Logo:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

exports.deleteFaviconImage = async (req, res, next) => {
  try {
    const FaviconFileName = req.params.faviconFileName;
    const FaviconPath = path.join(__dirname, '..', 'uploads', 'favicon', FaviconFileName);

    // Check if the FaviconPath file exists
    if (fs.existsSync(FaviconPath)) {
      // Delete the file
      fs.unlinkSync(FaviconPath);

      // Update the User's FaviconPath field in the database
      await Company.findOneAndUpdate({ fav_icon_path: FaviconFileName }, { fav_icon_path: '' });

      res.status(200).json({ message: 'Favicon deleted successfully.' });
    } else {
      res.status(404).json({ message: 'Favicon not found.' });
    }
  } catch (error) {
    console.error('Error deleting Favicon:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};