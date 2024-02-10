// Creating here user controller to handle communication between routes and the model/database
// Imports

import { ErrorHandler } from "../../../utils/errorHandler.js";
import { createPostDb, deletePostDb } from "../model/posts.repository.js";

// Create new post
export const createPost = async (req, res, next) => {
  try {
    const postData = req.body;
    if (!postData) {
      return next(
        new ErrorHandler(400, "Please add post data to create new post!")
      );
    }
    postData.user = req.user._id;
    if (req.file) {
      postData.media = req.file.filename;
    }
    // Passing to db to save the post here.
    const newPost = await createPostDb(postData, req.user);
    if (!newPost) {
      return next(
        new ErrorHandler(400, "Post, not created something went wrong!")
      );
    }
    // Sending response
    res.status(201).json({
      success: true,
      msg: "Post created!",
      newPost: newPost,
    });
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

// Deleting post
export const deletePost = async (req, res, next) => {
  try {
    const postId = req.params.postId;
    if (!postId) {
      return next(new ErrorHandler(400, "Please, enter post id in params!"));
    }
    const deletedPost = await deletePostDb(postId, req.user);
    if (!deletedPost) {
      return next(
        new ErrorHandler(400, "Post not deleted something went wrong!")
      );
    }

    return res.status(200).json({
      succes: true,
      msg: "Post deleted!",
      deletedPost: deletedPost,
    });
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};
