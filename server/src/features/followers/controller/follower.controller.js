// Creating here follower's controller to handle communication between routes and the model/database
// Imports
import { ErrorHandler } from "../../../utils/errorHandler.js";
import {
  acceptRequestDb,
  getFollowStatusDb,
  getFollowersDb,
  getRequestsDb,
  getfollowingDb,
  rejectRequestDb,
  removeFollowerDb,
  toggleSendRequestDb,
  unfollowDb,
} from "../model/follower.repository.js";

// Toggle follower
export const toggleFollow = async (req, res, next) => {
  try {
    const { following } = req.params;
    if (!following) {
      return next(
        new ErrorHandler(400, "Please, enter following id in params!")
      );
    }
    const response = await toggleSendRequestDb(req.user, following);
    if (!response) {
      return next(
        new ErrorHandler(400, "Follow not added somtehing went wrong!")
      );
    }
    return res.status(200).json({
      success: true,
      msg: response,
    });
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

// Accept request
export const acceptRequest = async (req, res, next) => {
  try {
    const { follower } = req.params;
    if (!follower) {
      return next(
        new ErrorHandler(400, "Please, enter follower id in params!")
      );
    }
    const response = await acceptRequestDb(req.user, follower);
    if (!response) {
      return next(
        new ErrorHandler(400, "Request not accepted somtehing went wrong!")
      );
    }
    return res.status(200).json({
      success: true,
      msg: response,
    });
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

// Reject request
export const rejectRequest = async (req, res, next) => {
  try {
    const { follower } = req.params;
    if (!follower) {
      return next(
        new ErrorHandler(400, "Please, enter follower id in params!")
      );
    }
    const response = await rejectRequestDb(req.user, follower);
    if (!response) {
      return next(
        new ErrorHandler(400, "Request not rejected somtehing went wrong!")
      );
    }
    return res.status(200).json({
      success: true,
      msg: response,
    });
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

// Unfollow user
export const unfollowUser = async (req, res, next) => {
  try {
    const { following } = req.params;
    if (!following) {
      return next(
        new ErrorHandler(400, "Please, enter following id in params!")
      );
    }
    const response = await unfollowDb(req.user, following);
    if (!response) {
      return next(
        new ErrorHandler(400, "Unfollow failed somtehing went wrong!")
      );
    }
    return res.status(200).json({
      success: true,
      msg: response,
    });
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

// Remove follower
export const removeFollower = async (req, res, next) => {
  try {
    const { follower } = req.params;
    if (!follower) {
      return next(
        new ErrorHandler(400, "Please, enter follower id in params!")
      );
    }
    const response = await removeFollowerDb(req.user, follower);
    if (!response) {
      return next(
        new ErrorHandler(400, "Follower not removed somtehing went wrong!")
      );
    }
    return res.status(200).json({
      success: true,
      msg: response,
    });
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

// Get request's
export const getRequests = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const requests = await getRequestsDb(userId);
    return res.status(200).json({
      success: true,
      requests: requests,
    });
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

// Get followers
export const getFollowers = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const followers = await getFollowersDb(userId);
    return res.status(200).json({
      success: true,
      followers: followers,
    });
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

// Get following
export const getFollowing = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const following = await getfollowingDb(userId);
    return res.status(200).json({
      success: true,
      following: following,
    });
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

// get follow status
export const getFollowStatus = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return next(new ErrorHandler(400, "Please, enter user id in params!"));
    }
    const response = await getFollowStatusDb(req.user._id, userId);
    if(response === "not-following"){
      return res.status(200).json({
        success: true,
        followStatus: response,
      });
    }
    return res.status(200).json({
      success: true,
      followStatus: response.status,
    });
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};
