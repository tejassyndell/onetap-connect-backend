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
  } else if (imageType === 'addonsimage'){
    folder = 'addonsimages';
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
    } else if (imageType === 'addonsimage'){
      folder = 'addonsimages';
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
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm'];

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
// exports.productImageUpload = (req, res, next) => {
//   const isMultiple = req.query.multiple === 'true'; // Check if it's multiple files

//   const uploadMiddleware = isMultiple ? upload.array('image') : upload.single('image');

//   uploadMiddleware(req, res, (err) => {
//     if (err) {
//       return res.status(400).json({ message: 'Error uploading file', error: err });
//     }

//     if (isMultiple) {
//       // req.files is now available for multiple files
//       const originalnames = req.files.map((file) => file.originalname);
//       req.fileNames = originalnames;
//     } else {
//       // req.file is now available for a single file
//       req.fileNames = [newFilename];
//     }

//     next();
//   });
// };


exports.productImageUpload = (req, res, next) => {
  const isMultiple = req.query.multiple === 'true'; // Check if it's multiple files
 
  const uploadMiddleware = isMultiple ? upload.array('image') : upload.single('image');

  uploadMiddleware(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: 'Error uploading file', error: err });
    }

    if (isMultiple) {
      // req.files is now available for multiple files
      const originalnames = req.files.map((file) => file.originalname);
      const fileTypes = req.body.fileType; // Get the "fileType" from the request body
      
      // Combine file names and file types into an array of objects
      const filesWithTypes = originalnames.map((name, index) => ({
        name,
        fileType: Array.isArray(fileTypes) ? fileTypes[index] : fileTypes,
      }));
    
      req.fileNames = filesWithTypes;
    } else {
      //       // req.file is now available for a single file
      req.fileNames = [newFilename];
      //     }
    }
    next();
  });
};



