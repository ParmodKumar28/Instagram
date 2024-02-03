// Creating router for the user here
// Imports
import express from "express";
import { signUp } from "../controller/user.controller.js";

// Router
const userRouter = express.Router();

// Routes

// Register new user
userRouter.post("/signup", signUp);

// Exporting Router
export default userRouter;
