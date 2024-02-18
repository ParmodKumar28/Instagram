// Follower router is here
// Imports
import express from "express";
import { auth } from "../../../middlewares/auth.js";
import {
  acceptRequest,
  getFollowers,
  getRequests,
  removeFollower,
  toggleFollow,
  unfollowUser,
} from "../controller/follower.controller.js";

// Creating router
const followersRouter = express.Router();

// Routes
// Toggle follow
followersRouter.get("/follow/:following", auth, toggleFollow);

// Accept request
followersRouter.get("/accept-request/:follower", auth, acceptRequest);

// Unfollow user
followersRouter.get("/unfollow/:following", auth, unfollowUser);

// Remove follower
followersRouter.get("/remove-follower/:follower", auth, removeFollower);

// Get request's
followersRouter.get("/requests", auth, getRequests);

// Get follower's
followersRouter.get("/followers", auth, getFollowers);

// Exporting like router
export default followersRouter;
