// Comment's repository is here for handling database function's
// Imports
import { ObjectId } from "mongodb";
import { ErrorHandler } from "../../../utils/errorHandler.js";
import PostModel from "../../posts/model/posts.schema.js";
import CommentModel from "./comment.schema.js";

// Adding comment on a post in the database
export const addCommentDb = async (postId, userId, comment) => {
  try {
    const post = await PostModel.findById(postId);
    if (!post) {
      throw new ErrorHandler(400, "No post found by this id to add comment!");
    }

    // Creating new comment
    const newComment = new CommentModel({
      user: new ObjectId(userId),
      post: new ObjectId(postId),
      content: comment,
    });

    // Saving new comment
    await newComment.save();

    // Updating post's comments array
    post.comments.push(new ObjectId(newComment._id));
    await post.save();

    return newComment;
  } catch (error) {
    throw error;
  }
};

// Removing comment on post from database
export const removeCommentDb = async (commentId, user) => {
  try {
    const comment = await CommentModel.findById(commentId);
    if (!comment) {
      throw new ErrorHandler(400, "No comment found by this id!");
    }
    const postId = comment.post;
    const post = await PostModel.findById(postId);
    if (!comment.user.equals(user)) {
      throw new ErrorHandler(400, "You cannot delete other's comment!");
    }
    const deletedComment = await CommentModel.findByIdAndDelete(commentId);
    // Removing comment from post comment's array
    const commentIndex = post.comments.indexOf(new ObjectId(commentId));
    post.comments.splice(commentIndex, 1);
    await post.save();
    return deletedComment;
  } catch (error) {
    throw error;
  }
};

// Updating a comment on a post
export const updateCommentDb = async (commentId, user, updatedComment) => {
  try {
    const comment = await CommentModel.findById(commentId);
    if (!comment) {
      throw new ErrorHandler(400, "No comment found by this id!");
    }
    if (!comment.user.equals(user)) {
      throw new ErrorHandler(400, "You cannot update other's comment!");
    }
    return await CommentModel.findByIdAndUpdate(
      commentId,
      { content: updatedComment },
      {
        runValidators: true,
        new: true,
      }
    );
  } catch (error) {
    throw error;
  }
};

// Get comment's on a post
export const getCommentsDb = async (postId) => {
  try {
    const post = await PostModel.findById(postId);
    if (!post) {
      throw new ErrorHandler(400, "No post found by this id to add comment!");
    }
    const comments = await CommentModel.find({
      post: new ObjectId(postId),
    }).populate("user", "name profilePic _id");
    return comments;
  } catch (error) {
    throw error;
  }
};
