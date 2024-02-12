// Like's schema is here
// Imports
import mongoose from "mongoose";

const likesSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  likeable: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "on_model",
  },
  on_model: {
    type: String,
    enum: ["Post", "Comment"],
    required: true,
  },
});

// Like model
const LikeModel = mongoose.model("Like", likesSchema);

// Exporting model
export default LikeModel;
