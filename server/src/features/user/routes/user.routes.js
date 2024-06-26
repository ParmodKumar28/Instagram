// Creating router for the user here
// Imports
import express from "express";
import {
  addProfilePic,
  deleteAccount,
  forgotPasswordOtp,
  logout,
  resetPassword,
  signIn,
  signUp,
  updatePassword,
  updateUserProfile,
  userData,
} from "../controller/user.controller.js";
import { auth } from "../../../middlewares/auth.js";
import upload from "../../../middlewares/file-upload.js";

// Router
const userRouter = express.Router();

// Routes

// Register new user
userRouter.post("/signup", signUp);

// Signing in
userRouter.post("/signin", signIn);

// Logout user
userRouter.get("/logout", auth, logout);

// Updating user
userRouter.put("/update-profile", auth, updateUserProfile);

// Upload profile pic
userRouter.post(
  "/upload-profile-pic",
  auth,
  upload.single("profilePic"),
  addProfilePic
);

// Getting user data
userRouter.get("/user-data/:userId", auth, userData);

// Otp for password reset
userRouter.post("/forgot-password-otp", forgotPasswordOtp);

// Reset password
userRouter.put("/reset-password", resetPassword);

// Update password
userRouter.put("/update-password", auth, updatePassword);

// Delete account
userRouter.delete("/delete-account", auth, deleteAccount);

// Exporting Router
export default userRouter;
