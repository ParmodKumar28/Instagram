// Imports
import { ObjectId } from "mongodb";
import { ErrorHandler } from "../../../utils/errorHandler.js";
import PostModel from "./posts.schema.js";
import UserModel from "../../user/model/user.schema.js";

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
      .populate("user", "name username profilePic gender")
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

// Getting post by id from the database
export const getPostDb = async (postId) => {
  try {
    return await PostModel.findById(postId)
      .populate("user", "name username profilePic gender")
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

// Getting user posts from the database
export const getUserPostsDb = async (user) => {
  try {
    return await PostModel.find({ user: user })
      .sort({ createdAt: -1 })
      .populate("user", "name username profilePic gender")
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

// Getting tagged posts for a user
export const getTaggedPostsDb = async (userId) => {
  try {
    return await PostModel.find({ tags: userId })
      .sort({ createdAt: -1 })
      .populate("user", "name username profilePic gender")
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

// Getting all posts from the db in latest to older form
export const getAllPostsDb = async () => {
  try {
    return await PostModel.find({})
      .sort({ createdAt: -1 })
      .populate("user", "name username profilePic gender")
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
