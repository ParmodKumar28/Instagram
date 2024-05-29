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
