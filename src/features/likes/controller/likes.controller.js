// Like's controller is here for routes and database/model communication function's
// Imports
import { ErrorHandler } from "../../../utils/errorHandler.js";
import { getLikesDb, toggleLikeDb } from "../model/likes.repository.js";

// Get likes on post or comment here
export const getLikes = async (req, res, next) => {
  try {
    const id = req.params.id;
    const type = req.body.type;
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
    return res.status(200).json({
      success: true,
      msg: response.message,
    });
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};
