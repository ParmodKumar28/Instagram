// Comment's schema is here
// Imports
import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Post",
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Like",
    },
  ],
  content: {
    type: String,
    required: true,
  },
});

// Like model
const CommentModel = mongoose.model("Comment", commentSchema);

// Exporting model
export default CommentModel;
