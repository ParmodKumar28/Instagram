// Follower's schema is here
import mongoose from "mongoose";

// Imports
const followersSchema = new mongoose.Schema(
  {
    follower: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    following: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

//Creating model
const FollowerModel = mongoose.model("Follower", followersSchema);

// Exporting model
export default FollowerModel;
