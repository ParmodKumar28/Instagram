// Creating router for the posts here.
// Imports
import express from "express";
import { auth } from "../../../middlewares/auth.js";
import upload from "../../../middlewares/file-upload.js";
import {
  createPost,
  deletePost,
  getAllPosts,
  getPost,
  getUserPosts,
  updatePost, 
} from "../controller/posts.controller.js";

// Router
const postsRouter = express.Router();

// Routes

// Create post
postsRouter.post("/create-post", auth, upload.single("media"), createPost);

// Delete post
postsRouter.delete("/delete-post/:postId", auth, deletePost);

// Update post
postsRouter.put("/update-post/:postId", upload.none(), auth, updatePost);

// Getting user posts
postsRouter.get("/user-posts/:userId", auth, getUserPosts);

// Getting all posts
postsRouter.get("/all-posts", auth, getAllPosts);

// Getting single post by id
postsRouter.get("/:postId", auth, getPost);

// Exporting Router
export default postsRouter;
