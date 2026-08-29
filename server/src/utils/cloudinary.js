// Here uploading the image or video on cloudinary or serving locally based on configuration
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { ErrorHandler } from "./errorHandler.js";

/**
 * Uploads a file to Cloudinary or serves it locally based on STORAGE_TYPE in .env ('cloudinary' | 'local').
 * Defaults to 'cloudinary'.
 * @param {Object} file - The file object from multer (req.file)
 * @returns {Promise<string>} Uploaded media URL
 */
export const uploadMedia = async (file) => {
  if (!file) return null;

  const storageType = (process.env.STORAGE_TYPE || "cloudinary").toLowerCase();

  if (storageType === "cloudinary") {
    try {
      const { secure_url } = await cloudinary.uploader.upload(file.path, {
        resource_type: "auto",
      });

      // Clean up temporary local file after successful upload to Cloudinary
      if (file.path && fs.existsSync(file.path)) {
        fs.promises.unlink(file.path).catch((err) =>
          console.error("Failed to clean up temp file:", err)
        );
      }

      return secure_url;
    } catch (error) {
      // Clean up temp file on failure as well
      if (file.path && fs.existsSync(file.path)) {
        fs.promises.unlink(file.path).catch(() => {});
      }
      throw new ErrorHandler(400, error.message || error);
    }
  } else {
    // Local storage URL
    const host =
      process.env.MODE === "production"
        ? process.env.PRODUCTION
        : process.env.LOCALHOST || `http://localhost:${process.env.PORT || 8000}`;
    return `${host}/images/${file.filename}`;
  }
};

/**
 * Direct Cloudinary uploader
 */
export const uploadCloudinary = async (filePath) => {
  try {
    const { secure_url } = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
    });
    return secure_url;
  } catch (error) {
    throw new ErrorHandler(400, error.message || error);
  }
};

export default uploadMedia;

