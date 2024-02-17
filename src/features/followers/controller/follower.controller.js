// Creating here follower's controller to handle communication between routes and the model/database
// Imports
import { ErrorHandler } from "../../../utils/errorHandler.js";
import {
  acceptRequestDb,
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
