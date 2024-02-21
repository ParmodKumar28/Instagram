// Here uploading the image or video on cloudinary and sending url link
// Imports
import { v2 as cloudinary } from "cloudinary";
import { ErrorHandler } from "./errorHandler.js";

const uploadCloudinary = async (file) => {
  try {
    const { secure_url } = await cloudinary.uploader.upload(file);
    return secure_url;
  } catch (error) {
    throw new ErrorHandler(400, error);
  }
};

// Exporting here
export default uploadCloudinary;
