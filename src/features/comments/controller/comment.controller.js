// Comment's controller is here for routes and database/model communication function's
// Imports
import { ErrorHandler } from "../../../utils/errorHandler.js";
import { addCommentDb } from "../model/comment.repository.js";

// Adding new comment on the post
export const addComment = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { postId } = req.params;
    const { comment } = req.body;
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
    const newComment = await addCommentDb(postId, userId, comment);
    if (!newComment) {
      return next(
        new ErrorHandler(400, "Comment not added something went wrong!")
      );
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
