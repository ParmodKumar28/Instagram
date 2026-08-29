// Import necessary modules and utilities
import { ObjectId } from "mongodb";
import { ErrorHandler } from "../../../utils/errorHandler.js";
import UserModel from "../../user/model/user.schema.js";
import FollowerModel from "./follower.schema.js";

// Function to handle toggling of sending follow requests
export const toggleSendRequestDb = async (user, following) => {
  try {
    if (following.toString() === user._id.toString()) {
      throw new ErrorHandler(400, "User cannot follow itself!");
    }

    const followerUser = await UserModel.findById(following);
    if (!followerUser) {
      throw new ErrorHandler(400, "No user found by this id!");
    }

    // Check if the user is already followed
    const isAlreadyFollowed = followerUser.followers.some(
      (f) => f.toString() === user._id.toString()
    );
    if (isAlreadyFollowed) {
      throw new ErrorHandler(400, "You are already following this user!");
    }

    // If the user's account type is public, immediately follow
    if (followerUser.accountType === "public") {
      const sendRequest = new FollowerModel({
        follower: user._id,
        following: following,
        status: "accepted",
      });
      await sendRequest.save();

      if (!followerUser.followers.some((f) => f.toString() === user._id.toString())) {
        followerUser.followers.push(user._id);
        await followerUser.save();
      }

      if (!user.following.some((f) => f.toString() === following.toString())) {
        user.following.push(following);
        await user.save();
      }

      return "Followed successfully!";
    } else {
      // If the user's account type is private, handle follow requests
      const isPending = await FollowerModel.findOne({
        follower: user._id,
        following: following,
        status: "pending",
      });

      if (isPending) {
        // If a pending request already exists, cancel it
        await FollowerModel.findOneAndDelete({
          follower: user._id,
          following: following,
          status: "pending",
        });
        followerUser.requests = followerUser.requests.filter(
          (reqId) => reqId.toString() !== user._id.toString()
        );
        await followerUser.save();
        return "Request cancelled!";
      } else {
        // If no pending request exists, send a new request
        const sendRequest = new FollowerModel({
          follower: user._id,
          following: following,
          status: "pending",
        });
        await sendRequest.save();

        if (!followerUser.requests.some((r) => r.toString() === user._id.toString())) {
          followerUser.requests.push(user._id);
          await followerUser.save();
        }
        return "Request sent!";
      }
    }
  } catch (error) {
    throw error;
  }
};

// Function to accept a follow request
export const acceptRequestDb = async (user, follower) => {
  try {
    const followerUser = await UserModel.findById(follower);
    if (!followerUser) {
      throw new ErrorHandler(400, "No user found by this id!");
    }

    const updatedFollower = await FollowerModel.findOneAndUpdate(
      {
        follower: follower,
        following: user._id,
        status: "pending",
      },
      { $set: { status: "accepted" } },
      { new: true }
    );

    if (!updatedFollower) {
      throw new ErrorHandler(
        400,
        "No pending request found for this user and follower."
      );
    }

    if (!user.followers.some((f) => f.toString() === follower.toString())) {
      user.followers.push(follower);
    }
    user.requests = user.requests.filter(
      (r) => r.toString() !== follower.toString()
    );
    await user.save();

    if (!followerUser.following.some((f) => f.toString() === user._id.toString())) {
      followerUser.following.push(user._id);
      await followerUser.save();
    }

    return "Request accepted!";
  } catch (error) {
    throw error;
  }
};

// Reject request of a user in the db
export const rejectRequestDb = async (user, follower) => {
  try {
    const followerUser = await UserModel.findById(follower);
    if (!followerUser) {
      throw new ErrorHandler(400, "No user found by this id!");
    }

    const rejectedRequest = await FollowerModel.findOneAndDelete({
      follower: follower,
      following: user._id,
      status: "pending",
    });

    if (!rejectedRequest) {
      throw new ErrorHandler(400, "No request found by this follower id!");
    }

    user.requests = user.requests.filter(
      (r) => r.toString() !== follower.toString()
    );
    await user.save();

    return "Request rejected!";
  } catch (error) {
    throw error;
  }
};

// Function to unfollow a user
export const unfollowDb = async (user, following) => {
  try {
    const followingUser = await UserModel.findById(following);
    if (!followingUser) {
      throw new ErrorHandler(400, "No user found by this id!");
    }

    await FollowerModel.findOneAndDelete({
      follower: user._id,
      following: following,
    });

    user.following = user.following.filter(
      (f) => f.toString() !== following.toString()
    );
    await user.save();

    followingUser.followers = followingUser.followers.filter(
      (f) => f.toString() !== user._id.toString()
    );
    await followingUser.save();

    return "User unfollowed!";
  } catch (error) {
    throw error;
  }
};

// Function to remove a follower
export const removeFollowerDb = async (user, follower) => {
  try {
    const followerUser = await UserModel.findById(follower);
    if (!followerUser) {
      throw new ErrorHandler(400, "No user found by this id!");
    }

    await FollowerModel.findOneAndDelete({
      follower: follower,
      following: user._id,
      status: "accepted",
    });

    user.followers = user.followers.filter(
      (f) => f.toString() !== follower.toString()
    );
    await user.save();

    followerUser.following = followerUser.following.filter(
      (f) => f.toString() !== user._id.toString()
    );
    await followerUser.save();

    return "Follower removed!";
  } catch (error) {
    throw error;
  }
};

// Get requests from database
export const getRequestsDb = async (userId) => {
  try {
    const requests = await FollowerModel.find({
      following: userId,
      status: "pending",
    })
      .select("follower createdAt status")
      .populate("follower", "name username email profilePic");
    return requests || [];
  } catch (error) {
    throw error;
  }
};

// Get followers
export const getFollowersDb = async (userId) => {
  try {
    const followers = await FollowerModel.find({
      following: userId,
      status: "accepted",
    })
      .select("follower createdAt")
      .populate({
        path: "follower",
        select: "profilePic username name",
      });
    return followers || [];
  } catch (error) {
    throw error;
  }
};

// Get following's
export const getfollowingDb = async (userId) => {
  try {
    const following = await FollowerModel.find({
      follower: userId,
      status: "accepted",
    })
      .select("following createdAt")
      .populate({
        path: "following",
        select: "profilePic username name email",
      });
    return following || [];
  } catch (error) {
    throw error;
  }
};

// Get follow status db
export const getFollowStatusDb = async (userId, followingId) => {
  try {
    const followStatus = await FollowerModel.findOne({
      follower: userId,
      following: followingId,
    }).select("status");

    if (!followStatus) {
      return "not-following";
    }
    return followStatus;
  } catch (error) {
    throw error;
  }
};

// Get activity/notifications db
export const getActivityDb = async (userId) => {
  try {
    // 1. Users who accepted current user's request
    const acceptedRequests = await FollowerModel.find({
      follower: userId,
      status: "accepted",
    })
      .select("following createdAt updatedAt")
      .populate("following", "name username profilePic")
      .sort({ updatedAt: -1 })
      .limit(15);

    // 2. Users who started following the current user
    const newFollowers = await FollowerModel.find({
      following: userId,
      status: "accepted",
    })
      .select("follower createdAt updatedAt")
      .populate("follower", "name username profilePic")
      .sort({ createdAt: -1 })
      .limit(15);

    const activities = [
      ...acceptedRequests.map((item) => ({
        _id: item._id,
        user: item.following,
        type: "accepted_request",
        text: "accepted your follow request.",
        createdAt: item.updatedAt || item.createdAt,
      })),
      ...newFollowers.map((item) => ({
        _id: item._id,
        user: item.follower,
        type: "new_follower",
        text: "started following you.",
        createdAt: item.createdAt,
      })),
    ].filter((item) => item.user && item.user._id);

    // Sort combined activities by latest first
    activities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return activities.slice(0, 20);
  } catch (error) {
    throw error;
  }
};