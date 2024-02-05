// Creating a middleware to upload files and photos
// Imports
import multer from "multer";
import path from "path";

// Directory
const dir = path.resolve();

// Configuring to store files in disk
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, `${dir}/src/uploads`);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

// Creating middleware
const upload = multer({ storage: storage });
export default upload;
