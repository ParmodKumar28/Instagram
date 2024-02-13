// Comment's routes is here
// Imports
import express from "express";
import { auth } from "../../../middlewares/auth.js";
import { addComment } from "../controller/comment.controller.js";

// Creating router
const commentsRouter = express.Router();

// Routes
// Adding comment on a post
commentsRouter.post("/add/:postId", auth, addComment);

// Exporting like router
export default commentsRouter;
