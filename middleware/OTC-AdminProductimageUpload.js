const multer = require('multer');
const User = require("../models/NewSchemas/UserModel");
const product = require("../models/NewSchemas/ProductModel");
const productCategory = require("../models/NewSchemas/ProductCategoryModel")

exports.productImageUpload = (req, res, next) => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "./uploads/profileImages");
    },
    filename: (req, file, cb) => {
      cb(null, `category-${file.originalname}`);
    },
  });

  const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true); // Accept the file
    } else {
      cb(null, false); // Reject the file
    }
  };

  const upload = multer({
    storage: storage,
    fileFilter: fileFilter
  });

  // Call the upload function
  upload.single('image')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: 'Error uploading file', error: err });
    }

    const filename = req.file.filename;
    // console.log(userID, "...")
    // console.log(filename, "...") // Assuming 'filename' contains the saved file name

    try {
      // Find the user with the corresponding userID
      // const user = await User.findById(userID);
    //   console.log(user, "...........................")

      // if (!user) {
      //   return res.status(404).json({ message: 'User not found' });
      // }

      // Update the 'avatar' field with the filename
      // user.avatar = filename;
      // await user.save();

      req.file = {
        buffer: req.file.buffer,
        mimetype: req.file.mimetype,
        originalname: req.file.originalname,
        // userID: userID,
        image: filename 
      };

      next();
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  });
};
