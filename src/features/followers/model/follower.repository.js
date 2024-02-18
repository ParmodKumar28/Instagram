// Import necessary modules and utilities
import { ObjectId } from "mongodb";
import { ErrorHandler } from "../../../utils/errorHandler.js";
import UserModel from "../../user/model/user.schema.js";
import FollowerModel from "./follower.schema.js";

// Function to handle toggling of sending follow requests
export const toggleSendRequestDb = async (user, following) => {
  try {
    // Check if the user is trying to follow itself
    if (following.toString() === user._id.toString()) {
      throw new ErrorHandler(400, "User cannot follow itself!");
    }

    // Check if the user being followed exists
    const followerUser = await UserModel.findById(following);
    if (!followerUser) {
      throw new ErrorHandler(400, "No user found by this id!");
    }

    // Check if the user is already followed
    const isAlreadyFollowed = followerUser.followers.includes(user._id);
    if (isAlreadyFollowed) {
      throw new ErrorHandler(400, "You are already following this user!");
    }

    // If the user's account type is public, immediately follow
    if (followerUser.accountType === "public") {
      followerUser.followers.push(user._id);
      await followerUser.save();
      user.following.push(following);
      await user.save();
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
        const index = followerUser.requests.indexOf(user._id);
        if (index !== -1) {
          followerUser.requests.splice(index, 1);
          await followerUser.save();
        }
        return "Request cancelled!";
      } else {
        // If no pending request exists, send a new request
        const sendRequest = new FollowerModel({
          follower: user._id,
          following: following,
        });
        await sendRequest.save();
        followerUser.requests.push(user._id);
        await followerUser.save();
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
    // Check if the follower exists
    const followerUser = await UserModel.findById(follower);
    if (!followerUser) {
      throw new ErrorHandler(400, "No user found by this id!");
    }

    // Update the document in FollowerModel
    const updatedFollower = await FollowerModel.findOneAndUpdate(
      {
        follower: follower,
        following: user,
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

    // Add to both follow and following arrays
    user.followers.push(new ObjectId(follower));
    // After accepting request removing from the request here
    const requestIndex = user.requests.indexOf(new ObjectId(follower));
    user.requests.splice(requestIndex, 1);
    followerUser.following.push(new ObjectId(user._id));
    await user.save();
    await followerUser.save();

    return "Request accepted!";
  } catch (error) {
    throw error;
  }
};

// Function to unfollow a user
export const unfollowDb = async (user, following) => {
  try {
    // Check if the user being followed exists
    const followingUser = await UserModel.findById(following);
    if (!followingUser) {
      throw new ErrorHandler(400, "No user found by this id!");
    }

    // Check if there's an existing relationship between the user and the follower
    const isFollowing = await FollowerModel.findOne({
      follower: user._id,
      following: following,
    });

    if (!isFollowing) {
      throw new ErrorHandler(400, "You are not following this user!");
    }

    // Find and delete the corresponding entry in the FollowerModel
    await FollowerModel.findOneAndDelete({
      follower: user._id,
      following: following,
    });

    // Remove the user being followed from the 'following' array of the current user
    const index = user.following.indexOf(following);
    if (index !== -1) {
      user.following.splice(index, 1);
      await user.save();
    }

    // Remove the current user from the 'followers' array of the user being followed
    const index2 = followingUser.followers.indexOf(user._id);
    if (index2 !== -1) {
      followingUser.followers.splice(index2, 1);
      await followingUser.save();
    }

    return "User unfollowed!";
  } catch (error) {
    throw error;
  }
};

// Function to remove a follower
export const removeFollowerDb = async (user, follower) => {
  try {
    // Check if the follower exists
    const followerUser = await UserModel.findById(follower);
    if (!followerUser) {
      throw new ErrorHandler(400, "No user found by this id!");
    }

    // Check if there's an accepted follower relationship between the user and the follower
    const isFollower = await FollowerModel.findOne({
      follower: follower,
      following: user._id,
      status: "accepted",
    });

    if (!isFollower) {
      throw new ErrorHandler(400, "No follower found to remove!");
    }

    // Find and delete the corresponding entry in the FollowerModel
    await FollowerModel.findOneAndDelete({
      follower: follower,
      following: user._id,
      status: "accepted",
    });

    // Remove the follower from the 'followers' array of the current user
    const index = user.followers.indexOf(follower);
    if (index !== -1) {
      user.followers.splice(index, 1);
      await user.save();
    }

    // Remove the current user from the 'following' array of the follower
    const index2 = followerUser.following.indexOf(user._id);
    if (index2 !== -1) {
      followerUser.following.splice(index2, 1);
      await followerUser.save();
    }

    return "Follower removed!";
  } catch (error) {
    throw error;
  }
};

// Get requests from database
export const getRequestsDb = async (userId) => {
  try {
    const requests = await FollowerModel.find({
      following: new ObjectId(userId),
      status: "pending",
    })
      .select("follower createdAt")
      .populate("follower", "name email id");
    return requests;
  } catch (error) {
    throw error;
  }
};

// Get followers
export const getFollowersDb = async (userId) => {
  try {
    
  } catch (error) {
    
  }
}

// Get following's
