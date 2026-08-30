// Imports
import { ErrorHandler } from "../../../utils/errorHandler.js";
import {
  addCommentDb,
  getCommentsDb,
  removeCommentDb,
  updateCommentDb,
} from "../model/comment.repository.js";
import PostModel from "../../posts/model/posts.schema.js";
import { emitToUser } from "../../../socket/index.js";

// Adding new comment on the post
export const addComment = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { postId } = req.params;
    const { comment, parentCommentId } = req.body;
    if (!userId) {
      return next(
        new ErrorHandler(
          400,
          "Please login! userId not received in request here!"
        )
      );
    }
    if (!postId) {
      return next(
        new ErrorHandler(400, "Enter postId in params to add comment!")
      );
    }
    if (!comment) {
      return next(
        new ErrorHandler(400, "Enter comment in req body comment not received!")
      );
    }
    const newComment = await addCommentDb(postId, userId, comment, parentCommentId);
    if (!newComment) {
      return next(
        new ErrorHandler(400, "Comment not added something went wrong!")
      );
    }

    // Emit live notification to post author
    try {
      const post = await PostModel.findById(postId);
      if (post && post.user && post.user.toString() !== userId.toString()) {
        emitToUser(post.user, "new_notification", {
          type: "comment",
          sender: {
            _id: req.user._id,
            username: req.user.username,
            name: req.user.name,
            profilePic: req.user.profilePic,
          },
          message: `${req.user.username} commented on your post: "${comment.slice(0, 30)}${comment.length > 30 ? "..." : ""}"`,
          postId,
          commentId: newComment._id,
          createdAt: new Date(),
        });
      }
    } catch (e) {
      console.error("Failed to emit comment notification:", e);
    }

    // Sending response
    return res.status(201).json({
      success: true,
      msg: "Comment added!",
      comment: newComment,
    });
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

// Update Comment
export const updateComment = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { commentId } = req.params;
    const { comment } = req.body;
    if (!userId) {
      return next(
        new ErrorHandler(
          400,
          "Please login! userId not received in request here!"
        )
      );
    }
    if (!commentId) {
      return next(new ErrorHandler(400, "Please enter commentId in params!"));
    }
    if (!comment) {
      return next(
        new ErrorHandler(400, "Enter comment in req body comment not received!")
      );
    }
    const updatedComment = await updateCommentDb(commentId, userId, comment);
    if (!updatedComment) {
      return next(
        new ErrorHandler(400, "Comment not updated something went wrong!")
      );
    }
    return res.status(200).json({
      success: true,
      msg: "Comment updated!",
      comment: updateComment,
    });
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

// Delete Comment
export const deleteComment = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { commentId } = req.params;
    if (!userId) {
      return next(
        new ErrorHandler(
          400,
          "Please login! userId not received in request here!"
        )
      );
    }
    if (!commentId) {
      return next(new ErrorHandler(400, "Please enter commentId in params!"));
    }
    const deletedComment = await removeCommentDb(commentId, userId);
    if (!deletedComment) {
      return next(
        new ErrorHandler(400, "Comment not deleted something went wrong!")
      );
    }
    return res.status(200).json({
      success: true,
      msg: "Comment deleted!",
    });
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

// Get all comment's on a post here
export const getComments = async (req, res, next) => {
  try {
    const { postId } = req.params;
    if (!postId) {
      return next(
        new ErrorHandler(400, "Enter postId in params to add comment!")
      );
    }
    const comments = await getCommentsDb(postId);
    res.status(200).json({
      success: true,
      msg: "Comment's retrieved",
      comments: comments,
    });
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};
