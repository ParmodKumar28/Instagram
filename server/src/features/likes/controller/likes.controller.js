// Imports
import { ErrorHandler } from "../../../utils/errorHandler.js";
import { getLikesDb, toggleLikeDb } from "../model/likes.repository.js";
import PostModel from "../../posts/model/posts.schema.js";
import { emitToUser } from "../../../socket/index.js";

// Get likes on post or comment here
export const getLikes = async (req, res, next) => {
  try {
    const id = req.params.id;
    const type = req.query.type;
    if (type != "Post" && type != "Comment") {
      return next(
        new ErrorHandler(
          400,
          "Enter a valid type ie 'Post' or 'Comment' in body!"
        )
      );
    }
    if (!id) {
      return next(
        new ErrorHandler(400, "Enter id of post or comment in params!")
      );
    }

    // Calling db
    const likes = await getLikesDb(id, type);
    if (!likes) {
      return next(
        new ErrorHandler(400, "Likes not received something went wrong!")
      );
    }
    return res.status(200).json({
      succes: true,
      likes: likes,
      msg: "Likes retrieved!",
    });
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

// Adding or toggling like here on post or comment here
export const toggleLike = async (req, res, next) => {
  try {
    const { user } = req;
    const userId = user._id;
    const id = req.params.id;
    const type = req.query.type;
    if (!userId) {
      return next(new ErrorHandler(400, "Enter userId or Login!"));
    }
    if (type != "Post" && type != "Comment") {
      return next(
        new ErrorHandler(
          400,
          "Enter a valid type ie 'Post' or 'Comment' in query!"
        )
      );
    }
    if (!id) {
      return next(
        new ErrorHandler(400, "Enter id of post or comment in params!")
      );
    }
    // Calling db
    const response = await toggleLikeDb(userId, id, type);
    if (!response) {
      return next(
        new ErrorHandler(400, "Like not toggled something went wrong!")
      );
    }

    // If like was added on a Post, emit live notification to post owner
    if (response.message === "Like added" && type === "Post") {
      try {
        const post = await PostModel.findById(id);
        if (post && post.user && post.user.toString() !== userId.toString()) {
          emitToUser(post.user, "new_notification", {
            type: "like",
            sender: {
              _id: user._id,
              username: user.username,
              name: user.name,
              profilePic: user.profilePic,
            },
            message: `${user.username} liked your post.`,
            postId: id,
            createdAt: new Date(),
          });
        }
      } catch (e) {
        console.error("Failed to emit like notification:", e);
      }
    }

    return res.status(200).json({
      success: true,
      msg: response.message,
    });
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};
