// // Creating a middleware to upload files and photos
// // Imports
// import multer from "multer";
// import path from "path";

// // Directory
// const dir = path.resolve();

// // Configuring to store files in disk
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, `${dir}/src/uploads`);
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, file.fieldname + "-" + uniqueSuffix);
//   },
// });

// // Creating middleware
// const upload = multer({ storage: storage });
// export default upload;

import multer from "multer";
import path from "path";
// Image Storage Engine
const storage = multer.diskStorage({
  destination: "./upload/images",
  filename: (req, file, cb) => {
    return cb(
      null,
      `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

// Define file filter for images and videos
const fileFilter = function (req, file, cb) {
  const allowedFileTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "video/mp4",
    "video/quicktime",
  ]; // Define accepted file types
  if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true); // Accept the file
  } else {
    cb(
      new Error(
        "Error: Only images (JPEG, PNG, GIF) and videos (MP4, MOV) are allowed!"
      )
    );
  }
};

// Configure upload middleware
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // Set the maximum file size (50MB in this case)
  },
});

export default upload;
