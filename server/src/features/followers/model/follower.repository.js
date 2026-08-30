// Import necessary modules and utilities
import { ObjectId } from "mongodb";
import { ErrorHandler } from "../../../utils/errorHandler.js";
import UserModel from "../../user/model/user.schema.js";
import FollowerModel from "./follower.schema.js";

// Function to handle toggling of sending follow requests (follow / unfollow / cancel request)
export const toggleSendRequestDb = async (user, following) => {
  try {
    if (following.toString() === user._id.toString()) {
      throw new ErrorHandler(400, "User cannot follow itself!");
    }

    const targetUser = await UserModel.findById(following);
    if (!targetUser) {
      throw new ErrorHandler(404, "No user found by this id!");
    }

    const currentUser = await UserModel.findById(user._id);

    // 1. Check existing relation in FollowerModel or arrays
    const existingFollow = await FollowerModel.findOne({
      follower: user._id,
      following: following,
    });

    const isAcceptedInModel = existingFollow && existingFollow.status === "accepted";
    const isPendingInModel = existingFollow && existingFollow.status === "pending";
    const isInFollowersArray = targetUser.followers && targetUser.followers.some(
      (f) => f.toString() === user._id.toString()
    );

    // If ALREADY FOLLOWING (accepted) -> UNFOLLOW
    if (isAcceptedInModel || isInFollowersArray) {
      await FollowerModel.deleteMany({
        follower: user._id,
        following: following,
      });

      targetUser.followers = (targetUser.followers || []).filter(
        (f) => f.toString() !== user._id.toString()
      );
      if (currentUser) {
        currentUser.following = (currentUser.following || []).filter(
          (f) => f.toString() !== following.toString()
        );
        await currentUser.save();
      }
      targetUser.requests = (targetUser.requests || []).filter(
        (r) => r.toString() !== user._id.toString()
      );
      await targetUser.save();

      return {
        status: "not-following",
        isFollowing: false,
        isPending: false,
        msg: "Unfollowed successfully!",
      };
    }

    // If PENDING request exists -> CANCEL REQUEST
    if (isPendingInModel || (targetUser.requests && targetUser.requests.some((r) => r.toString() === user._id.toString()))) {
      await FollowerModel.deleteMany({
        follower: user._id,
        following: following,
      });

      targetUser.requests = (targetUser.requests || []).filter(
        (r) => r.toString() !== user._id.toString()
      );
      await targetUser.save();

      return {
        status: "not-following",
        isFollowing: false,
        isPending: false,
        msg: "Follow request cancelled!",
      };
    }

    // Otherwise -> FOLLOW (or SEND REQUEST if private)
    if (targetUser.accountType === "private") {
      const sendRequest = new FollowerModel({
        follower: user._id,
        following: following,
        status: "pending",
      });
      await sendRequest.save();

      if (!targetUser.requests) targetUser.requests = [];
      if (!targetUser.requests.some((r) => r.toString() === user._id.toString())) {
        targetUser.requests.push(user._id);
        await targetUser.save();
      }

      return {
        status: "pending",
        isFollowing: false,
        isPending: true,
        msg: "Follow request sent!",
      };
    } else {
      const sendRequest = new FollowerModel({
        follower: user._id,
        following: following,
        status: "accepted",
      });
      await sendRequest.save();

      if (!targetUser.followers) targetUser.followers = [];
      if (!targetUser.followers.some((f) => f.toString() === user._id.toString())) {
        targetUser.followers.push(user._id);
        await targetUser.save();
      }

      if (currentUser) {
        if (!currentUser.following) currentUser.following = [];
        if (!currentUser.following.some((f) => f.toString() === following.toString())) {
          currentUser.following.push(following);
          await currentUser.save();
        }
      }

      return {
        status: "accepted",
        isFollowing: true,
        isPending: false,
        msg: "Followed successfully!",
      };
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