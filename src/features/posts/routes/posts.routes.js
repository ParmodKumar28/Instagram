// Creating router for the posts here.
// Imports
import express from "express";
import { auth } from "../../../middlewares/auth.js";
import upload from "../../../middlewares/file-upload.js";
import { createPost, deletePost } from "../controller/posts.controller.js";

// Router
const postsRouter = express.Router();

// Routes

// Create post
postsRouter.post("/create-post", auth, upload.single("media"), createPost);

// Delete post
postsRouter.delete("/delete-post/:postId", auth, deletePost);

// Exporting Router
export default postsRouter;
