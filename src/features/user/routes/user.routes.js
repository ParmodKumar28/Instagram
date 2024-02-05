// Creating router for the user here
// Imports
import express from "express";
import { logout, signIn, signUp, updateUserProfile } from "../controller/user.controller.js";
import { auth } from "../../../middlewares/auth.js";

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

// Exporting Router
export default userRouter;
