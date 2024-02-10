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
