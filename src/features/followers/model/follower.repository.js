import { ObjectId } from "mongodb";
import { ErrorHandler } from "../../../utils/errorHandler.js";
import UserModel from "../../user/model/user.schema.js";
import FollowerModel from "./follower.schema.js";

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

    if (user.accountType === "public") {
      // If the user's account type is public, immediately follow
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

export const acceptRequestDb = async (user, follower) => {
  try {
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
      { $set: { status: "accepted" } }, // Use $set to update only the 'status' field
      { new: true } // Return the updated document
    );

    if (!updatedFollower) {
      throw new ErrorHandler(
        400,
        "No pending request found for this user and follower."
      );
    }

    // Add to both follow and following arrays
    user.followers.push(new ObjectId(follower));
    followerUser.following.push(new ObjectId(user._id));
    await user.save();
    await followerUser.save();

    return "Request accepted!";
  } catch (error) {
    throw error;
  }
};

export const unfollowDb = async (user, following) => {
  try {
    const followingUser = await UserModel.findById(following);
    if (!followingUser) {
      throw new ErrorHandler(400, "No user found by this id!");
    }

    await FollowerModel.findOneAndDelete({
      follower: new ObjectId(user._id),
      following: new ObjectId(following),
    });

    const index = user.following.indexOf(new ObjectId(following));
    user.following.splice(index, 1);
    await user.save();

    const index2 = followingUser.followers.indexOf(new ObjectId(user._id));
    followingUser.followers.splice(index2, 1);
    await followingUser.save();

    return "user unfollowed!";
  } catch (error) {
    throw error;
  }
};

export const removeFollower = async (user, follower) => {
  try {
    const followerUser = await UserModel.findById(follower);
    if (!followerUser) {
      throw new ErrorHandler(400, "No user found by this id!");
    }

    await FollowerModel.findOneAndDelete({
      follower: new ObjectId(follower),
      following: new ObjectId(user._id),
      status: "accepted",
    });

    const index = user.followers.indexOf(new ObjectId(follower));
    user.followers.splice(index, 1);
    await user.save();

    const index2 = followerUser.following.indexOf(new ObjectId(user._id));
    followerUser.following.splice(index2, 1);
    await followerUser.save();

    return "follower removed!";
  } catch (error) {
    throw error;
  }
};
