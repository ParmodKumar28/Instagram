import express from "express";
import { auth } from "../../../middlewares/auth.js";
import upload from "../../../middlewares/file-upload.js";
import {
  createStory,
  getFeedStories,
  getUserStories,
  markStoryViewed,
  toggleLikeStory,
  replyStory,
  deleteStory,
} from "../controller/story.controller.js";

const storyRouter = express.Router();

// Upload a new story
storyRouter.post("/create", auth, upload.single("media"), createStory);

// Get feed stories for active user
storyRouter.get("/feed", auth, getFeedStories);

// Get stories for a user
storyRouter.get("/user/:userId", auth, getUserStories);

// Mark story as viewed
storyRouter.post("/:storyId/view", auth, markStoryViewed);

// Like / unlike story
storyRouter.post("/:storyId/like", auth, toggleLikeStory);

// Reply to story
storyRouter.post("/:storyId/reply", auth, replyStory);

// Delete story
storyRouter.delete("/:storyId", auth, deleteStory);

export default storyRouter;
