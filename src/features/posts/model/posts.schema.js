// Creating user schema here and model
// Imports

import mongoose from "mongoose";

const postsSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    media: {
      type: String,
    },
    caption: {
      type: String,
      max: [100, "Content should be not greater than 100 characters!"],
    },
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    location: {
      type: String,
    },

    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Like",
      },
    ],
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
  },
  { timestamps: true }
);

// Creating model here
const PostModel = mongoose.model("Post", postsSchema);

// Exporting the post schema
export default PostModel;
