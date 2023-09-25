const multer = require('multer');
const User = require("../models/NewSchemas/UserModel");

exports.imageUpload = (req, res, next) => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "./uploads/profileImages");
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const extension = file.originalname.split(".").pop(); // Get the file extension
      cb(null, `profile-${uniqueSuffix}.${extension}`);
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
  upload.single('avatar')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: 'Error uploading file', error: err });
    }

    const userID = req.body.userID;
    const filename = req.file.filename;
    // console.log(userID, "...")
    // console.log(filename, "...") // Assuming 'filename' contains the saved file name

    try {
      // Find the user with the corresponding userID
      const user = await User.findById(userID);
    //   console.log(user, "...........................")

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Update the 'avatar' field with the filename
      user.avatar = filename;
      await user.save();

      req.file = {
        buffer: req.file.buffer,
        mimetype: req.file.mimetype,
        originalname: req.file.originalname,
        // userID: userID,
        avatar: filename // Add avatar field to req.file object
      };

      next();
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  });
};
