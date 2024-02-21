// Comment's routes is here
// Imports
import express from "express";
import { auth } from "../../../middlewares/auth.js";
import {
  addComment,
  deleteComment,
  getComments,
  updateComment,
} from "../controller/comment.controller.js";

// Creating router
const commentsRouter = express.Router();

// Routes
// Get comments
commentsRouter.get("/:postId", auth, getComments);

// Add comment on a post
commentsRouter.post("/add/:postId", auth, addComment);

// Delete comment
commentsRouter.delete("/delete/:commentId", auth, deleteComment);

// Update Comment
commentsRouter.put("/update/:commentId", auth, updateComment);

// Exporting like router
export default commentsRouter;
