// Comment's repository is here for handling database function's
// Imports
import { ObjectId } from "mongodb";
import { ErrorHandler } from "../../../utils/errorHandler.js";
import PostModel from "../../posts/model/posts.schema.js";
import CommentModel from "./comment.schema.js";

// Adding comment on a post in the database
export const addCommentDb = async (postId, userId, comment, parentCommentId = null) => {
  try {
    const post = await PostModel.findById(postId);
    if (!post) {
      throw new ErrorHandler(400, "No post found by this id to add comment!");
    }

    let parentComment = null;
    if (parentCommentId) {
      parentComment = await CommentModel.findById(parentCommentId);
    }

    // Creating new comment
    const newComment = new CommentModel({
      user: new ObjectId(userId),
      post: new ObjectId(postId),
      content: comment,
      parentComment: parentComment ? new ObjectId(parentComment._id) : null,
    });

    // Saving new comment
    await newComment.save();

    if (parentComment) {
      if (!parentComment.replies) parentComment.replies = [];
      parentComment.replies.push(newComment._id);
      await parentComment.save();
    } else {
      // Updating post's comments array for top-level comments
      post.comments.push(new ObjectId(newComment._id));
      await post.save();
    }

    await newComment.populate([
      { path: "user", select: "name username profilePic gender _id" },
      { path: "likes" },
    ]);
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

    // If it's a reply, remove from parentComment replies
    if (comment.parentComment) {
      await CommentModel.findByIdAndUpdate(comment.parentComment, {
        $pull: { replies: comment._id },
      });
    } else {
      // If it's a parent comment, delete its replies too and remove from post
      if (comment.replies && comment.replies.length > 0) {
        await CommentModel.deleteMany({ _id: { $in: comment.replies } });
      }
      if (post) {
        const commentIndex = post.comments.indexOf(new ObjectId(commentId));
        if (commentIndex !== -1) {
          post.comments.splice(commentIndex, 1);
          await post.save();
        }
      }
    }

    const deletedComment = await CommentModel.findByIdAndDelete(commentId);
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
      throw new ErrorHandler(400, "No post found by this id to get comments!");
    }
    const comments = await CommentModel.find({
      post: new ObjectId(postId),
      parentComment: null, // Only fetch root comments; replies are nested
    })
      .populate("user", "name username profilePic gender _id")
      .populate("likes")
      .populate({
        path: "replies",
        populate: [
          { path: "user", select: "name username profilePic gender _id" },
          { path: "likes" },
        ],
      })
      .sort({ createdAt: 1 });
    return comments;
  } catch (error) {
    throw error;
  }
};
