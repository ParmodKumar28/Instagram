// Creating router for the posts here.
// Imports
import express from "express";
import { auth } from "../../../middlewares/auth.js";
import upload from "../../../middlewares/file-upload.js";

// Router
const postsRouter = express.Router();

// Routes

// Create post
postsRouter.post('/create-post');



// Exporting Router
export default postsRouter;
