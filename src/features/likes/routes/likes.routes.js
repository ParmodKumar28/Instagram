// Like's routes is here
// Imports
import express from "express";
import { auth } from "../../../middlewares/auth";
import { getLikes, toggleLike } from "../controller/likes.controller";

// Creating router
const likesRouter = express.Router();

// Routes

// Get like's on comment's or post's
likesRouter.get("/:id", auth, getLikes);

// Adding like or toggling like on a comment or post here
likesRouter.get("/toggle/:id", auth, toggleLike);

// Exporting like router
export default likesRouter;
