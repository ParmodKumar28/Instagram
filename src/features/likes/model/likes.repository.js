// Like's repository is here for handling database function's
// Imports
import { ObjectId } from "mongodb";
import PostModel from "../../posts/model/posts.schema";
import LikeModel from "./likes.schema";
import { ErrorHandler } from "../../../utils/errorHandler";

// Getting like's on comment or post from database
export const getLikesDb = async (id, type) => {
  try {
    let likeable;
    if (type == "Post") {
      likeable = await PostModel.findById(id);
    } else {
      likeable = await CommentModel.findById(id);
    }

    if (!likeable) {
      throw new ErrorHandler(
        400,
        `No ${type.toLowerCase()} found with this ID`
      );
    }

    const likes = LikeModel.find({
      likeable: new ObjectId(id),
      on_model: type,
    })
      .populate({ path: "User", select: "name email _id" })
      .populate("likeable");

    if (likes.length === 0) {
      throw new ErrorHandler(
        400,
        `There are no like's on this ${type.toLowerCase()}.`
      );
    }

    return likes;
  } catch (error) {
    throw error;
  }
};

// Toggling like on comment or post here in the database
export const toggleLikeDb = async (userId, likeableId, type) => {
  try {
    let likeable;
    if (type == "Post") {
      likeable = await PostModel.findById(likeableId);
    } else {
      likeable = await CommentModel.findById(likeableId);
    }

    if (!likeable) {
      throw new ErrorHandler(
        400,
        `There are no like's on this ${type.toLowerCase()}.`
      );
    }

    // Existing like
    const existingLike = await LikeModel.findOne({
      user: userId,
      likeable: likeableId,
      on_model: type,
    });

    if (existingLike) {
      await LikeModel.findByIdAndDelete(existingLike._id);
      // Index of the like in the likeable
      const index = likeable.likes.indexOf(existingLike._id);
      if (index !== -1) {
        // Removing like from the post or comment array of likes
        likeable.likes.splice(index, 1);
        await likeable.save();
        return { message: "Like removed" };
      } else {
        const newLike = new LikeModel({
          user: new ObjectId(userId),
          likeable: new ObjectId(likeable),
          on_model: type,
        });

        const liked = await newLike.save();
        if (liked) {
          // Add like to the post or comment array of likes
          likeable.likes.push(newLike._id);
          await likeable.save();
          return { message: "Like added" };
        }
      }
    }
  } catch (error) {
    throw error;
  }
};
