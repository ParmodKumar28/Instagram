import { ObjectId } from "mongodb";
import { ErrorHandler } from "../../../utils/errorHandler.js";
import UserModel from "../../user/model/user.schema.js";
import FollowerModel from "./follower.schema.js";

export const toggleSendRequestDb = async (user, following) => {
  try {
    const followerUser = await UserModel.findById(following);
    if (!followerUser) {
      throw new ErrorHandler(400, "No user found by this id!");
    }

    const isPending = await FollowerModel.findOne({
      follower: user,
      following: following,
      status: "pending",
    });

    if (isPending) {
      await FollowerModel.findOneAndDelete({
        follower: user,
        following: following,
        status: "pending",
      });
      const index = followerUser.requests.indexOf(user._id);
      followerUser.requests.splice(index, 1);
      await followerUser.save();
      return "request cancelled!";
    } else {
      const sendRequest = new FollowerModel({
        follower: user,
        following: following,
      });
      await sendRequest.save();
      followerUser.requests.push(user._id);
      await followerUser.save();
      return "request sent!";
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

    await FollowerModel.findOneAndUpdate(
      {
        follower: follower,
        following: user,
        status: "pending",
      },
      { status: "accepted" } 
    );

    // Add to both follow and following arrays
    user.followers.push(new ObjectId(follower));
    followerUser.following.push(new ObjectId(user._id));
    await user.save();
    await followerUser.save();

    return "request accepted!";
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
