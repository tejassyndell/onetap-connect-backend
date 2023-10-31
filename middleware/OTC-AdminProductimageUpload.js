const multer = require('multer');
const path = require('path');
const fs = require('fs');

let newFilename; // Declare newFilename variable in a broader scope

// Define a function to determine the destination folder based on imageType
const destination = (req, file, cb) => {
  const imageType = req.query.imageType;
  let folder = '';

  if (imageType === 'product') {
    folder = 'productImages';
  } else if (imageType === 'category') {
    folder = 'categoryImages';
  }

  const destinationPath = path.join('./uploads', folder);
  fs.mkdirSync(destinationPath, { recursive: true });
  cb(null, destinationPath);
};

// Define the storage settings
const storage = multer.diskStorage({
  destination: destination,
  filename: (req, file, cb) => {
    const originalname = file.originalname;
    const imageType = req.query.imageType;
    let folder = '';

    if (imageType === 'product') {
      folder = 'productImages';
    } else if (imageType === 'category') {
      folder = 'categoryImages';
    }

    const destinationPath = path.join('./uploads', folder);

    let i = 1;
    newFilename = originalname; // Assign newFilename in this broader scope

    while (fs.existsSync(path.join(destinationPath, newFilename))) {
      const ext = path.extname(originalname);
      const filenameWithoutExt = path.basename(originalname, ext);
      newFilename = `${filenameWithoutExt}-${i}${ext}`;
      i++;
    }

    cb(null, newFilename);
  },
});

// Define a file filter to accept specific image types
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // Accept the file
  } else {
    cb(null, false); // Reject the file
  }
};

// Create the multer upload middleware
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

// Define the middleware function
exports.productImageUpload = (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: 'Error uploading file', error: err });
    }

    // req.file is now available because of the broader scope of newFilename
    req.file = {
      originalname: newFilename,
    };

    next();
  });
};
