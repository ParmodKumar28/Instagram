// Creating posts repository here for the database
// Imports
import { ErrorHandler } from "../../../utils/errorHandler.js";
import PostModel from "./posts.schema.js";

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
    });
  } catch (error) {
    throw error;
  }
};

// Getting post by id from the database
export const getPostDb = async (postId) => {
  try {
    return await PostModel.findById(postId)
      .populate("user", "name username profilePic")
      .populate({
        path: "tags",
        select: "name username profilePic",
        model: "User", // Specify the model if 'tags' is referencing documents from the 'User' collection
      })
      .populate({
        path: "likes",
        select: "user",
        model: "User", // Specify the model if 'likes' is referencing documents from the 'User' collection
      })
      .populate({
        path: "comments",
        select: "user content likes",
        populate: {
          path: "user", // If 'comments' is an array of subdocuments with a 'user' field
          select: "name username profilePic",
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
      .populate("user", "name username profilePic")
      .populate({
        path: "tags",
        select: "name username profilePic",
        model: "User", // Specify the model if 'tags' is referencing documents from the 'User' collection
      })
      .populate({
        path: "likes",
        select: "user",
        model: "User", // Specify the model if 'likes' is referencing documents from the 'User' collection
      })
      .populate({
        path: "comments",
        select: "user content likes",
        populate: {
          path: "user", // If 'comments' is an array of subdocuments with a 'user' field
          select: "name username profilePic",
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
      .sort({ createdAt: -1 }) // Sort in descending order to get latest posts first
      .populate("user", "name username profilePic")
      .populate({
        path: "tags",
        select: "name username profilePic",
        model: "User", // Specify the model if 'tags' is referencing documents from the 'User' collection
      })
      .populate({
        path: "likes",
        select: "user",
        model: "User", // Specify the model if 'likes' is referencing documents from the 'User' collection
      })
      .populate({
        path: "comments",
        select: "user content likes",
        populate: {
          path: "user", // If 'comments' is an array of subdocuments with a 'user' field
          select: "name username profilePic",
          model: "User",
        },
      });
  } catch (error) {
    throw error;
  }
};
