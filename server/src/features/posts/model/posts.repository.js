// Imports
import { ObjectId } from "mongodb";
import { ErrorHandler } from "../../../utils/errorHandler.js";
import PostModel from "./posts.schema.js";
import UserModel from "../../user/model/user.schema.js";
import FollowerModel from "../../followers/model/follower.schema.js";

// Helper to determine private account user IDs that the viewer cannot view
export const getBlockedPrivateUserIds = async (viewerId) => {
  const privateUsers = await UserModel.find({ accountType: "private" }).select("_id");
  const privateUserIds = privateUsers.map((u) => u._id.toString());

  if (privateUserIds.length === 0) return [];

  const allowedUserIds = new Set();
  if (viewerId) {
    allowedUserIds.add(viewerId.toString());
    const acceptedFollows = await FollowerModel.find({
      follower: new ObjectId(viewerId),
      status: "accepted",
    }).select("following");
    acceptedFollows.forEach((f) => {
      if (f.following) allowedUserIds.add(f.following.toString());
    });
  }

  return privateUserIds
    .filter((id) => !allowedUserIds.has(id))
    .map((id) => new ObjectId(id));
};

// Create new post in the db
export const createPostDb = async (post, user) => {
  try {
    const newPost = await new PostModel(post).save();
    // Updating the user posts array here adding new post to it's posts
    user.posts.push(newPost._id);
    await user.save();
    return newPost;
  } catch (error) {
    throw error;
  }
};

// Deleting post in the db
export const deletePostDb = async (postId, user) => {
  try {
    const post = await PostModel.findById(postId);
    if (!post) {
      throw new ErrorHandler(400, "No post found by this id!");
    }
    if (!post.user.equals(user._id)) {
      throw new ErrorHandler(400, "You are not allowed to delete this post!");
    }
    const deletedPost = await PostModel.findByIdAndDelete(postId);
    // Removing post from user array
    user.posts = user.posts.filter(
      (post) => post.toString() !== postId.toString()
    );
    await user.save();
    return deletedPost;
  } catch (error) {
    throw error;
  }
};

// Updating the post data in the db
export const updatePostDb = async (postId, user, postData) => {
  try {
    const post = await PostModel.findById(postId);
    if (!post) {
      throw new ErrorHandler(400, "No post found by this id!");
    }
    // Validating user
    if (!post.user.equals(user)) {
      throw new ErrorHandler(400, "You cannot update other's post!");
    }
    return await PostModel.findByIdAndUpdate(postId, postData, {
      runValidators: true,
      new: true,
    })
      .populate("user", "name username profilePic gender accountType")
      .populate({
        path: "tags",
        select: "name username profilePic gender",
        model: "User",
      })
      .populate({
        path: "likes",
        select: "user",
      })
      .populate({
        path: "comments",
        select: "user content likes replies",
        populate: {
          path: "user",
          select: "name username profilePic gender",
          model: "User",
        },
      });
  } catch (error) {
    throw error;
  }
};

// Getting post by id from the database (enforcing privacy check)
export const getPostDb = async (postId, viewerId = null) => {
  try {
    const post = await PostModel.findById(postId)
      .populate("user", "name username profilePic gender accountType")
      .populate({
        path: "tags",
        select: "name username profilePic gender",
        model: "User",
      })
      .populate({
        path: "likes",
        select: "user",
        populate: {
          path: "user",
          select: "name username profilePic gender",
          model: "User",
        },
      })
      .populate({
        path: "comments",
        select: "user content likes replies",
        populate: {
          path: "user",
          select: "name username profilePic gender",
          model: "User",
        },
      });

    if (!post) {
      throw new ErrorHandler(404, "No post found by this id!");
    }

    if (post.user && post.user.accountType === "private") {
      const authorId = (post.user._id || post.user).toString();
      const isSelf = viewerId && authorId === viewerId.toString();
      if (!isSelf) {
        const isFollowing = viewerId
          ? await FollowerModel.findOne({
              follower: new ObjectId(viewerId),
              following: new ObjectId(authorId),
              status: "accepted",
            })
          : null;
        if (!isFollowing) {
          throw new ErrorHandler(403, "This account is private.");
        }
      }
    }

    return post;
  } catch (error) {
    throw error;
  }
};

// Getting user posts from the database (enforcing privacy check)
export const getUserPostsDb = async (targetUserId, viewerId = null) => {
  try {
    const targetUser = await UserModel.findById(targetUserId).select("accountType");
    if (!targetUser) throw new ErrorHandler(404, "User not found");

    if (targetUser.accountType === "private") {
      const isSelf = viewerId && targetUserId.toString() === viewerId.toString();
      if (!isSelf) {
        const isFollowing = viewerId
          ? await FollowerModel.findOne({
              follower: new ObjectId(viewerId),
              following: new ObjectId(targetUserId),
              status: "accepted",
            })
          : null;
        if (!isFollowing) {
          return []; // Hide posts of private account from non-followers
        }
      }
    }

    return await PostModel.find({ user: targetUserId })
      .sort({ createdAt: -1 })
      .populate("user", "name username profilePic gender accountType")
      .populate({
        path: "tags",
        select: "name username profilePic gender",
        model: "User",
      })
      .populate({
        path: "likes",
        select: "user",
      })
      .populate({
        path: "comments",
        select: "user content likes replies",
        populate: {
          path: "user",
          select: "name username profilePic gender",
          model: "User",
        },
      });
  } catch (error) {
    throw error;
  }
};

// Getting tagged posts for a user (enforcing privacy check)
export const getTaggedPostsDb = async (targetUserId, viewerId = null) => {
  try {
    const targetUser = await UserModel.findById(targetUserId).select("accountType");
    if (!targetUser) throw new ErrorHandler(404, "User not found");

    if (targetUser.accountType === "private") {
      const isSelf = viewerId && targetUserId.toString() === viewerId.toString();
      if (!isSelf) {
        const isFollowing = viewerId
          ? await FollowerModel.findOne({
              follower: new ObjectId(viewerId),
              following: new ObjectId(targetUserId),
              status: "accepted",
            })
          : null;
        if (!isFollowing) {
          return []; // Hide tagged posts on private profile from non-followers
        }
      }
    }

    const blockedPrivateUserIds = await getBlockedPrivateUserIds(viewerId);
    const query = { tags: targetUserId };
    if (blockedPrivateUserIds.length > 0) {
      query.user = { $nin: blockedPrivateUserIds };
    }

    return await PostModel.find(query)
      .sort({ createdAt: -1 })
      .populate("user", "name username profilePic gender accountType")
      .populate({
        path: "tags",
        select: "name username profilePic gender",
        model: "User",
      })
      .populate({
        path: "likes",
        select: "user",
      })
      .populate({
        path: "comments",
        select: "user content likes replies",
        populate: {
          path: "user",
          select: "name username profilePic gender",
          model: "User",
        },
      });
  } catch (error) {
    throw error;
  }
};

// Getting all posts from the db with privacy filter
export const getAllPostsDb = async (viewerId = null) => {
  try {
    const blockedPrivateUserIds = await getBlockedPrivateUserIds(viewerId);
    const query = blockedPrivateUserIds.length > 0 ? { user: { $nin: blockedPrivateUserIds } } : {};

    return await PostModel.find(query)
      .sort({ createdAt: -1 })
      .populate("user", "name username profilePic gender accountType")
      .populate({
        path: "tags",
        select: "name username profilePic gender",
        model: "User",
      })
      .populate({
        path: "likes",
        select: "user",
        populate: {
          path: "user",
          select: "name username profilePic gender",
          model: "User",
        },
      })
      .populate({
        path: "comments",
        select: "user content likes replies",
        populate: {
          path: "user",
          select: "name username profilePic gender",
          model: "User",
        },
      });
  } catch (error) {
    throw error;
  }
};

// Toggle save post in user's savedPosts
export const toggleSavePostDb = async (postId, userId) => {
  try {
    const user = await UserModel.findById(userId);
    if (!user) throw new ErrorHandler(404, "User not found");
    if (!user.savedPosts) user.savedPosts = [];

    const strPostId = postId.toString();
    const isSaved = user.savedPosts.some((id) => id.toString() === strPostId);

    if (isSaved) {
      user.savedPosts = user.savedPosts.filter((id) => id.toString() !== strPostId);
    } else {
      user.savedPosts.push(new ObjectId(postId));
    }
    await user.save();
    return { isSaved: !isSaved, savedPosts: user.savedPosts };
  } catch (error) {
    throw error;
  }
};

// Get saved posts for user
export const getSavedPostsDb = async (userId) => {
  try {
    const user = await UserModel.findById(userId).populate({
      path: "savedPosts",
      populate: [
        { path: "user", select: "name username profilePic" },
        { path: "likes", select: "user" },
        { path: "comments", select: "user content likes" },
      ],
    });
    if (!user) throw new ErrorHandler(404, "User not found");
    return user.savedPosts || [];
  } catch (error) {
    throw error;
  }
};
