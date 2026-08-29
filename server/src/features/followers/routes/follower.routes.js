// Follower router is here
// Imports
import express from "express";
import { auth } from "../../../middlewares/auth.js";
import {
  acceptRequest,
  getFollowers,
  getFollowing,
  getFollowStatus,
  getRequests,
  rejectRequest,
  removeFollower,
  toggleFollow,
  unfollowUser,
  getActivity,
} from "../controller/follower.controller.js";

// Creating router
const followersRouter = express.Router();

// Routes
// Toggle follow
followersRouter.get("/follow/:following", auth, toggleFollow);

// Accept request
followersRouter.get("/accept-request/:follower", auth, acceptRequest);

// Reject request
followersRouter.get("/reject-request/:follower", auth, rejectRequest);

// Unfollow user
followersRouter.get("/unfollow/:following", auth, unfollowUser);

// Remove follower
followersRouter.get("/remove-follower/:follower", auth, removeFollower);

// Get request's
followersRouter.get("/requests", auth, getRequests);

// Get activity/notifications
followersRouter.get("/activity", auth, getActivity);

// Get follower's
followersRouter.get("/followers/:userId", auth, getFollowers);

// Get following's
followersRouter.get("/following/:userId", auth, getFollowing);

// Checking follow status of user
followersRouter.get("/follow-status/:userId", auth, getFollowStatus);

// Exporting follower router
export default followersRouter;
